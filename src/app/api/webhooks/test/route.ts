import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { smartWebhooksEngine } from '@/lib/smart-webhooks'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { webhook_url, webhook_secret, sample_data } = body

    if (!webhook_url) {
      return NextResponse.json({ error: 'webhook_url is required' }, { status: 400 })
    }

    // Validate webhook URL
    try {
      const url = new URL(webhook_url)
      if (!['http:', 'https:'].includes(url.protocol)) {
        return NextResponse.json({ 
          error: 'Webhook URL must use HTTP or HTTPS protocol' 
        }, { status: 400 })
      }
      
      // Block localhost URLs for security
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.local')) {
        return NextResponse.json({ 
          error: 'Localhost URLs are not allowed for security reasons' 
        }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ 
        error: 'Invalid webhook URL format' 
      }, { status: 400 })
    }

    // Test the webhook
    const result = await smartWebhooksEngine.testWebhook(
      webhook_url,
      webhook_secret,
      sample_data
    )

    return NextResponse.json({
      success: result.success,
      status_code: result.statusCode,
      response_body: result.responseBody,
      response_headers: result.responseHeaders,
      duration_ms: result.duration,
      error: result.error,
      error_type: result.errorType
    })

  } catch (error) {
    console.error('Webhook test API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 