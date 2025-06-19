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
import { enrichPayload } from '@/lib/enhanced-payload-enrichment'

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
    
    // Get user by endpoint URL path
    const supabase = getSupabaseAdmin()
    
    // Find the endpoint by URL path and get the user
    const { data: endpoint, error: endpointError } = await supabase
      .from('endpoints')
      .select('user_id, id, name, is_active')
      .eq('url_path', username)
      .eq('is_active', true)
      .single()
    
    if (endpointError || !endpoint) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      )
    }
    
    const userId = endpoint.user_id
    const endpointId = endpoint.id
    
    // Get user's inbox configuration
    const { data: config } = await supabase
      .from('inbox_config')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    // Create default config if none exists
    if (!config) {
      await supabase
        .from('inbox_config')
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
    
    // For now, all active endpoints are considered public
    // In the future, we can check endpoint.settings.is_public if needed
    
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
        .from('data')
        .select('*', { count: 'exact', head: true })
        .eq('endpoint_id', endpointId)
        .eq('source_ip', headers.sourceIp)
        .gte('processed_at', oneHourAgo.toISOString())
      
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
    
    // Enhanced payload enrichment (temporarily simplified)
    let enrichedData: any = null
    try {
      const apiKeyInfo = apiKeyUsed ? { id: apiKeyUsed, name: 'API Key' } : undefined
      enrichedData = enrichPayload(
        payload,
        {
          'user-agent': headers.userAgent || '',
          'x-forwarded-for': headers.sourceIp || '',
          'referer': headers.referer || '',
          'content-type': contentType
        },
        apiKeyInfo
      )
      console.log('Enhanced data generated successfully:', JSON.stringify(enrichedData, null, 2))
    } catch (error) {
      console.error('Error in payload enrichment:', error)
      // Create fallback enriched data
      enrichedData = {
        raw_payload: payload,
        sender: { ip_address: headers.sourceIp, user_agent: headers.userAgent },
        structure: { field_count: Object.keys(payload || {}).length, nested_levels: 0, data_types: ['object'] },
        content: { category: 'general', confidence: 0.5, key_fields: [], sensitive_data: false, data_quality_score: 50 },
        context: { timestamp_fields: [], location_fields: [], reference_ids: [], business_context: 'general' }
      }
    }
    
    // Calculate abuse score
    const abuseScore = calculateAbuseScore(
      payload,
      headers.sourceIp || '',
      headers.userAgent
    )
    
    // Store the data in data table with enhanced information
    // Build insert data with enhanced fields if columns exist
    const insertData: any = {
      endpoint_id: endpointId,
      data: payload,
      source_ip: headers.sourceIp,
      headers: {
        'user-agent': headers.userAgent,
        'referer': headers.referer,
        'content-type': contentType,
        'x-forwarded-for': headers.sourceIp
      },
      user_agent: headers.userAgent,
      content_type: contentType,
      data_size: JSON.stringify(payload).length,
      status: 'received'
    }

    // Enhanced fields - re-enable after schema is applied
    try {
      insertData.enriched_data = enrichedData
      insertData.sender_info = enrichedData.sender
      insertData.data_quality_score = enrichedData.content.data_quality_score
      insertData.business_context = enrichedData.context.business_context
      insertData.key_fields = enrichedData.content.key_fields
      insertData.sensitive_data = enrichedData.content.sensitive_data
      insertData.auto_tags = classification.tags
      console.log('Enhanced data stored successfully:', {
        quality_score: enrichedData.content.data_quality_score,
        business_context: enrichedData.context.business_context,
        key_fields: enrichedData.content.key_fields.length,
        sender_confidence: enrichedData.sender.confidence_score
      })
    } catch (error) {
      console.log('Enhanced fields not available yet, using basic data only:', error)
    }

    const { data: dataRecord, error: insertError } = await supabase
      .from('data')
      .insert(insertData)
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
        id: dataRecord.id,
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
          'X-Inbox-ID': dataRecord.id,
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
    
    // Get user by endpoint path
    const { data: endpoint, error: endpointError } = await supabase
      .from('endpoints')
      .select('user_id, url_path')
      .eq('url_path', username)
      .single()
    
    if (endpointError || !endpoint) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      )
    }
    
    // Get inbox configuration (create default if not exists)
    const { data: config } = await supabase
      .from('inbox_config')
      .select('is_public, requires_api_key, max_payload_size, rate_limit_per_hour')
      .eq('user_id', endpoint.user_id)
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