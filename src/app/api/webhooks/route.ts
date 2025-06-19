import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const endpointId = url.searchParams.get('endpoint_id')

    let query = supabase
      .from('enostics_webhooks')
      .select(`
        *,
        endpoint:enostics_endpoints(id, name, url_path)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (endpointId) {
      query = query.eq('endpoint_id', endpointId)
    }

    const { data: webhooks, error } = await query

    if (error) {
      console.error('Error fetching webhooks:', error)
      return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
    }

    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error('Webhooks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      endpoint_id,
      name,
      description,
      webhook_url,
      webhook_secret,
      trigger_events = ['data_received'],
      trigger_conditions = {},
      timeout_seconds = 30,
      max_retries = 3,
      retry_backoff = 'exponential'
    } = body

    // Validate required fields
    if (!endpoint_id || !name || !webhook_url) {
      return NextResponse.json({ 
        error: 'Missing required fields: endpoint_id, name, webhook_url' 
      }, { status: 400 })
    }

    // Validate webhook URL
    try {
      const url = new URL(webhook_url)
      if (!['http:', 'https:'].includes(url.protocol)) {
        return NextResponse.json({ 
          error: 'Webhook URL must use HTTP or HTTPS protocol' 
        }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ 
        error: 'Invalid webhook URL format' 
      }, { status: 400 })
    }

    // Check if user can create more webhooks
    const { data: canCreate, error: limitError } = await supabase.rpc('can_user_create_webhook', {
      user_uuid: user.id
    })

    if (limitError) {
      console.error('Error checking webhook limits:', limitError)
      return NextResponse.json({ error: 'Failed to check webhook limits' }, { status: 500 })
    }

    if (!canCreate.allowed) {
      return NextResponse.json({ 
        error: canCreate.reason,
        current_count: canCreate.current_count,
        max_webhooks: canCreate.max_webhooks,
        plan: canCreate.plan
      }, { status: 429 })
    }

    // Verify user owns the endpoint
    const { data: endpoint, error: endpointError } = await supabase
      .from('enostics_endpoints')
      .select('id')
      .eq('id', endpoint_id)
      .eq('user_id', user.id)
      .single()

    if (endpointError || !endpoint) {
      return NextResponse.json({ error: 'Endpoint not found or unauthorized' }, { status: 404 })
    }

    // Create webhook
    const { data: webhook, error: createError } = await supabase
      .from('enostics_webhooks')
      .insert({
        endpoint_id,
        user_id: user.id,
        name,
        description,
        webhook_url,
        webhook_secret,
        trigger_events,
        trigger_conditions,
        timeout_seconds,
        max_retries,
        retry_backoff,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating webhook:', createError)
      return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 })
    }

    return NextResponse.json({ webhook }, { status: 201 })
  } catch (error) {
    console.error('Create webhook API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      name,
      description,
      webhook_url,
      webhook_secret,
      trigger_events,
      trigger_conditions,
      timeout_seconds,
      max_retries,
      retry_backoff,
      is_active
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 })
    }

    // Validate webhook URL if provided
    if (webhook_url) {
      try {
        const url = new URL(webhook_url)
        if (!['http:', 'https:'].includes(url.protocol)) {
          return NextResponse.json({ 
            error: 'Webhook URL must use HTTP or HTTPS protocol' 
          }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ 
          error: 'Invalid webhook URL format' 
        }, { status: 400 })
      }
    }

    // Update webhook
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (webhook_url !== undefined) updateData.webhook_url = webhook_url
    if (webhook_secret !== undefined) updateData.webhook_secret = webhook_secret
    if (trigger_events !== undefined) updateData.trigger_events = trigger_events
    if (trigger_conditions !== undefined) updateData.trigger_conditions = trigger_conditions
    if (timeout_seconds !== undefined) updateData.timeout_seconds = timeout_seconds
    if (max_retries !== undefined) updateData.max_retries = max_retries
    if (retry_backoff !== undefined) updateData.retry_backoff = retry_backoff
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: webhook, error: updateError } = await supabase
      .from('enostics_webhooks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating webhook:', updateError)
      return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 })
    }

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ webhook })
  } catch (error) {
    console.error('Update webhook API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const webhookId = url.searchParams.get('id')

    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('enostics_webhooks')
      .delete()
      .eq('id', webhookId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting webhook:', deleteError)
      return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete webhook API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 