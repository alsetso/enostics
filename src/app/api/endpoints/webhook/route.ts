import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint_id, webhook_url, webhook_secret, webhook_enabled } = body

    if (!endpoint_id) {
      return NextResponse.json({ error: 'endpoint_id is required' }, { status: 400 })
    }

    // Verify user owns the endpoint
    const { data: endpoint, error: endpointError } = await supabase
      .from('enostics_endpoints')
      .select('id')
      .eq('id', endpoint_id)
      .eq('user_id', user.id)
      .single()

    if (endpointError || !endpoint) {
      return NextResponse.json({ error: 'Endpoint not found or not authorized' }, { status: 404 })
    }

    // Update webhook configuration
    const { error: updateError } = await supabase
      .from('enostics_endpoints')
      .update({
        webhook_url: webhook_enabled ? webhook_url : null,
        webhook_secret: webhook_enabled ? webhook_secret : null,
        webhook_enabled: webhook_enabled || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', endpoint_id)

    if (updateError) {
      console.error('Webhook update error:', updateError)
      return NextResponse.json({ error: 'Failed to update webhook configuration' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Webhook configuration updated' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 