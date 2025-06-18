import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { validateApiKeyMiddleware, createAuthenticatedHeaders } from '@/middleware/api-key'
import { rateLimitMiddleware, createRateLimitHeaders } from '@/middleware/rate-limit'
import { resolveUsernameAndEndpoint } from '@/lib/user-resolver'
import { logRequest } from '@/lib/request-logger'
import { processWebhookDelivery } from '@/lib/webhooks'
import { PermissionMiddleware, incrementUsage } from '@/lib/permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const startTime = Date.now()
  let endpointId: string | undefined
  let apiKeyId: string | undefined
  
  try {
    const { path } = params
    
    // Path should be [username, endpoint-name]
    if (!path || path.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid endpoint path. Format: /api/v1/[username]/[endpoint-name]' },
        { status: 400 }
      )
    }

    const [username, endpointPath] = path

    // Step 1: Validate API key
    const apiKeyResult = await validateApiKeyMiddleware(request)
    if (!apiKeyResult.success) {
      return apiKeyResult.response
    }
    
    apiKeyId = apiKeyResult.context.keyId

    // Step 2: Apply rate limiting (using authenticated user ID)
    const rateLimitResult = await rateLimitMiddleware(request, apiKeyResult.context.userId)
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    // Step 3: Resolve username and endpoint using cached resolver
    const resolution = await resolveUsernameAndEndpoint(username, endpointPath)
    if (!resolution) {
      return NextResponse.json(
        { error: 'User or endpoint not found' },
        { status: 404 }
      )
    }

    const { userId, endpoint } = resolution
    endpointId = endpoint.id

    // Step 4: Verify API key belongs to the endpoint owner (security check)
    if (apiKeyResult.context.userId !== userId) {
      const responseTime = Date.now() - startTime
      
      // Log failed authorization attempt
      await logRequest({
        endpoint_id: endpoint.id,
        api_key_id: apiKeyId,
        method: 'POST',
        status_code: 403,
        response_time_ms: responseTime,
        source_ip: request.ip || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        error_message: 'API key not authorized for this endpoint'
      })
      
      return NextResponse.json(
        { error: 'API key not authorized for this endpoint' },
        { status: 403 }
      )
    }

    // Step 4.5: Check if user can make request (plan limits)
    try {
      await PermissionMiddleware.checkApiRequest(userId)
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      await logRequest({
        endpoint_id: endpoint.id,
        api_key_id: apiKeyId,
        method: 'POST',
        status_code: 429,
        response_time_ms: responseTime,
        source_ip: request.ip || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        error_message: error instanceof Error ? error.message : 'Request limit exceeded'
      })
      
      return NextResponse.json({
        error: 'Request limit exceeded',
        message: error instanceof Error ? error.message : 'Plan upgrade required',
        upgrade_required: true
      }, { status: 429 })
    }

    // Step 5: Parse and store the incoming data
    const data = await request.json()
    const contentLength = JSON.stringify(data).length
    const supabase = await createServerSupabaseClient()
    
    const { error: insertError } = await supabase
      .from('enostics_data')
      .insert({
        endpoint_id: endpoint.id,
        data: data,
        source_ip: request.ip || null,
        headers: Object.fromEntries(request.headers.entries()),
        status: 'received'
      })
    
    if (insertError) {
      console.error('Insert error:', insertError)
      const responseTime = Date.now() - startTime
      
      // Log the error
      await logRequest({
        endpoint_id: endpoint.id,
        api_key_id: apiKeyId,
        method: 'POST',
        status_code: 500,
        response_time_ms: responseTime,
        source_ip: request.ip || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        content_length: contentLength,
        error_message: 'Failed to store data'
      })
      
      return NextResponse.json(
        { error: 'Failed to store data' },
        { status: 500 }
      )
    }

    // Step 6: Increment usage tracking
    await incrementUsage(userId, endpoint.id, 1, contentLength)

    // Step 7: Log successful request
    const responseTime = Date.now() - startTime
    const requestLogId = await logRequest({
      endpoint_id: endpoint.id,
      api_key_id: apiKeyId,
      method: 'POST',
      status_code: 200,
      response_time_ms: responseTime,
      source_ip: request.ip || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      content_length: contentLength
    })

    // Step 8: Process webhooks asynchronously (don't block response)
    if (requestLogId) {
      const webhookPayload = {
        endpoint: {
          id: endpoint.id,
          name: endpoint.name,
          url_path: endpoint.url_path
        },
        request: {
          method: 'POST',
          headers: Object.fromEntries(request.headers.entries()),
          data: data,
          timestamp: new Date().toISOString(),
          source_ip: request.ip || undefined
        },
        metadata: {
          api_key_id: apiKeyId,
          request_id: requestLogId
        }
      }
      
      // Process webhook delivery in background
      processWebhookDelivery(endpoint.id, requestLogId, webhookPayload).catch(error => {
        console.error('Webhook delivery error:', error)
      })
    }

    // Step 9: Return success response with proper headers
    const authHeaders = createAuthenticatedHeaders(apiKeyResult.context)
    const rateLimitHeaders = createRateLimitHeaders(`user:${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Data received successfully',
      endpoint: endpoint.name,
      timestamp: new Date().toISOString(),
      request_id: requestLogId
    }, {
      headers: {
        ...authHeaders,
        ...rateLimitHeaders
      }
    })
    
  } catch (error) {
    console.error('API Error:', error)
    const responseTime = Date.now() - startTime
    
    // Log the error if we have endpoint info
    if (endpointId) {
      await logRequest({
        endpoint_id: endpointId,
        api_key_id: apiKeyId,
        method: 'POST',
        status_code: 500,
        response_time_ms: responseTime,
        source_ip: request.ip || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        error_message: error instanceof Error ? error.message : 'Internal server error'
      })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = params
  
  if (!path || path.length !== 2) {
    return NextResponse.json({
      error: 'Invalid endpoint path',
      format: '/api/v1/[username]/[endpoint-name]',
      example: '/api/v1/john/health-data'
    })
  }

  const [username, endpointPath] = path
  
  return NextResponse.json({
    message: `This is ${username}'s ${endpointPath} endpoint`,
    usage: 'Send POST requests with JSON data to this endpoint',
    endpoint: `api.enostics.com/v1/${username}/${endpointPath}`,
    format: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'JSON data'
    }
  })
} 