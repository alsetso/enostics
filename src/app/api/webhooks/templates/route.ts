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
    const category = url.searchParams.get('category')
    const provider = url.searchParams.get('provider')

    let query = supabase
      .from('enostics_webhook_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (provider) {
      query = query.eq('provider', provider)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching webhook templates:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    // Group templates by category for easier frontend consumption
    const groupedTemplates = templates?.reduce((acc: any, template: any) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }
      acc[template.category].push(template)
      return acc
    }, {})

    return NextResponse.json({ 
      templates,
      grouped_templates: groupedTemplates,
      categories: Array.from(new Set(templates?.map((t: any) => t.category) || []))
    })
  } catch (error) {
    console.error('Webhook templates API error:', error)
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
    const { template_id, endpoint_id, webhook_url, webhook_secret } = body

    if (!template_id || !endpoint_id || !webhook_url) {
      return NextResponse.json({ 
        error: 'Missing required fields: template_id, endpoint_id, webhook_url' 
      }, { status: 400 })
    }

    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('enostics_webhook_templates')
      .select('*')
      .eq('id', template_id)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
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

    // Check if user can create more webhooks
    const { data: canCreate, error: limitError } = await supabase.rpc('can_user_create_webhook', {
      user_uuid: user.id
    })

    if (limitError || !canCreate.allowed) {
      return NextResponse.json({ 
        error: canCreate?.reason || 'Cannot create webhook',
        current_count: canCreate?.current_count,
        max_webhooks: canCreate?.max_webhooks,
        plan: canCreate?.plan
      }, { status: 429 })
    }

    // Parse template config and create webhook
    const templateConfig = template.template_config
    const webhookData = {
      endpoint_id,
      user_id: user.id,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      webhook_url,
      webhook_secret,
      trigger_events: templateConfig.trigger_events || ['data_received'],
      trigger_conditions: templateConfig.trigger_conditions || {},
      timeout_seconds: templateConfig.timeout_seconds || 30,
      max_retries: templateConfig.max_retries || 3,
      retry_backoff: templateConfig.retry_backoff || 'exponential',
      is_active: true
    }

    const { data: webhook, error: createError } = await supabase
      .from('enostics_webhooks')
      .insert(webhookData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating webhook from template:', createError)
      return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 })
    }

    // Increment template usage count
    await supabase
      .from('enostics_webhook_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', template_id)

    return NextResponse.json({ 
      webhook,
      template: template
    }, { status: 201 })

  } catch (error) {
    console.error('Create webhook from template API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 