import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { 
  extractPayloadMetadata, 
  calculateAbuseScore, 
  validatePayloadSize,
  sanitizePayload,
  parseInboxHeaders 
} from '@/lib/public-inbox-simple'
import { validateApiKey } from '@/lib/api-keys'
import { classifyPayload } from '@/lib/universal-classification'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const startTime = Date.now()
  
  try {
    // Get request metadata
    const headers = parseInboxHeaders(request.headers)
    const contentType = headers.contentType || 'application/json'
    
    // Parse request body
    let payload: any
    try {
      if (contentType.includes('application/json')) {
        payload = await request.json()
      } else {
        // Handle other content types as text
        const text = await request.text()
        payload = { content: text, content_type: contentType }
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    // Sanitize payload
    payload = sanitizePayload(payload)
    
    // Get user by username
    const supabase = getSupabaseAdmin()
    
    // First, get user from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .eq('full_name', username) // Assuming username is stored in full_name
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const userId = profile.user_id
    
    // Get user's inbox configuration
    const { data: config } = await supabase
      .from('enostics_public_inbox_config')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    // Create default config if none exists
    if (!config) {
      await supabase
        .from('enostics_public_inbox_config')
        .insert({
          user_id: userId,
          is_public: true,
          requires_api_key: false,
          max_payload_size: 1048576,
          rate_limit_per_hour: 1000,
          rate_limit_per_day: 10000
        })
    }
    
    const inboxConfig = config || {
      is_public: true,
      requires_api_key: false,
      max_payload_size: 1048576,
      rate_limit_per_hour: 1000,
      rate_limit_per_day: 10000,
      blocked_ips: [],
      allowed_sources: []
    }
    
    // Check if inbox is public
    if (!inboxConfig.is_public) {
      return NextResponse.json(
        { error: 'This inbox is private' },
        { status: 403 }
      )
    }
    
    // Check IP blocking
    if (headers.sourceIp && inboxConfig.blocked_ips?.includes(headers.sourceIp)) {
      return NextResponse.json(
        { error: 'IP address is blocked' },
        { status: 403 }
      )
    }
    
    // Validate payload size
    if (!validatePayloadSize(payload, inboxConfig.max_payload_size)) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      )
    }
    
    // Check API key if required
    let apiKeyUsed: string | undefined
    let isAuthenticated = false
    
    if (inboxConfig.requires_api_key) {
      const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key required' },
          { status: 401 }
        )
      }
      
      const authResult = await validateApiKey(apiKey)
      if (!authResult.isValid || authResult.userId !== userId) {
        return NextResponse.json(
          { error: 'Valid API key required' },
          { status: 401 }
        )
      }
      apiKeyUsed = authResult.keyId
      isAuthenticated = true
    }
    
    // Check rate limits (simplified - in production, use Redis)
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    if (headers.sourceIp) {
      const { count: recentRequests } = await supabase
        .from('enostics_public_inbox')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('source_ip', headers.sourceIp)
        .gte('created_at', oneHourAgo.toISOString())
      
      if ((recentRequests || 0) >= inboxConfig.rate_limit_per_hour) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            retry_after: 3600
          },
          { 
            status: 429,
            headers: {
              'Retry-After': '3600',
              'X-RateLimit-Limit': inboxConfig.rate_limit_per_hour.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(now.getTime() / 1000 + 3600).toString()
            }
          }
        )
      }
    }
    
    // Intelligent classification
    const classification = classifyPayload(
      payload,
      headers.userAgent,
      headers.referer
    )
    
    // Calculate abuse score
    const abuseScore = calculateAbuseScore(
      payload,
      headers.sourceIp || '',
      headers.userAgent
    )
    
    // Store the request
    const { data: inboxRequest, error: insertError } = await supabase
      .from('enostics_public_inbox')
      .insert({
        user_id: userId,
        method: 'POST',
        source_ip: headers.sourceIp,
        user_agent: headers.userAgent,
        referer: headers.referer,
        payload: payload,
        payload_type: classification.type,
        payload_source: classification.source,
        content_type: contentType,
        content_length: headers.contentLength,
        api_key_used: apiKeyUsed,
        is_authenticated: isAuthenticated,
        is_suspicious: abuseScore > 50,
        abuse_score: abuseScore
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error storing inbox request:', insertError)
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      )
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        id: inboxRequest.id,
        message: `Request received in ${username}'s inbox`,
        timestamp: new Date().toISOString(),
        response_time: `${responseTime}ms`,
        metadata: {
          type: classification.type,
          source: classification.source,
          tags: classification.tags,
          confidence: classification.confidence,
          quality_score: classification.qualityScore,
          authenticated: isAuthenticated,
          abuse_score: abuseScore
        }
      },
      { 
        status: 200,
        headers: {
          'X-Inbox-ID': inboxRequest.id,
          'X-Response-Time': `${responseTime}ms`,
          'X-Enostics-Version': '3.1'
        }
      }
    )
    
  } catch (error) {
    console.error('Public inbox error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method to provide inbox information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  
  try {
    const supabase = getSupabaseAdmin()
    
    // Get user by username
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .eq('full_name', username)
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get inbox configuration
    const { data: config } = await supabase
      .from('enostics_public_inbox_config')
      .select('is_public, requires_api_key, max_payload_size, rate_limit_per_hour')
      .eq('user_id', profile.user_id)
      .single()
    
    const inboxConfig = config || {
      is_public: true,
      requires_api_key: false,
      max_payload_size: 1048576,
      rate_limit_per_hour: 1000
    }
    
    // Return inbox information
    return NextResponse.json({
      inbox: {
        username: username,
        url: `https://api.enostics.com/v1/${username}`,
        status: inboxConfig.is_public ? 'public' : 'private',
        authentication: inboxConfig.requires_api_key ? 'api_key_required' : 'none',
        limits: {
          max_payload_size: inboxConfig.max_payload_size,
          rate_limit_per_hour: inboxConfig.rate_limit_per_hour
        },
        methods: ['POST'],
        content_types: ['application/json', 'text/plain'],
        documentation: 'https://docs.enostics.com/public-inbox'
      },
      examples: {
        curl: `curl -X POST https://api.enostics.com/v1/${username} \\
  -H "Content-Type: application/json" \\
  -d '{"type": "message", "source": "my-app", "data": {"hello": "world"}}'`,
        javascript: `fetch('https://api.enostics.com/v1/${username}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'event',
    source: 'my-device',
    data: { temperature: 23.5, humidity: 45 }
  })
})`,
        python: `import requests

response = requests.post('https://api.enostics.com/v1/${username}', 
  json={
    'type': 'sensor_data',
    'source': 'iot-device',
    'data': {'value': 42}
  }
)`
      }
    })
    
  } catch (error) {
    console.error('Inbox info error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400'
    }
  })
} 