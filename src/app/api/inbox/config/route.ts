import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get inbox configuration
    const { data: config, error } = await supabase
      .from('enostics_public_inbox_config')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching inbox config:', error)
      return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 })
    }
    
    // Create default config if none exists
    if (!config) {
      const { data: newConfig, error: createError } = await supabase
        .from('enostics_public_inbox_config')
        .insert({
          user_id: user.id,
          is_public: true,
          requires_api_key: false,
          max_payload_size: 1048576,
          rate_limit_per_hour: 1000,
          rate_limit_per_day: 10000
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating inbox config:', createError)
        return NextResponse.json({ error: 'Failed to create configuration' }, { status: 500 })
      }
      
      return NextResponse.json({ config: newConfig })
    }
    
    return NextResponse.json({ config })
    
  } catch (error) {
    console.error('Inbox config error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const {
      is_public,
      requires_api_key,
      allowed_api_key_id,
      max_payload_size,
      rate_limit_per_hour,
      rate_limit_per_day,
      auto_webhook,
      webhook_url,
      webhook_secret
    } = body
    
    // Validate input
    if (max_payload_size && (max_payload_size < 1024 || max_payload_size > 10485760)) {
      return NextResponse.json(
        { error: 'Payload size must be between 1KB and 10MB' },
        { status: 400 }
      )
    }
    
    if (rate_limit_per_hour && (rate_limit_per_hour < 1 || rate_limit_per_hour > 10000)) {
      return NextResponse.json(
        { error: 'Hourly rate limit must be between 1 and 10,000' },
        { status: 400 }
      )
    }
    
    // Update configuration
    const { data: config, error } = await supabase
      .from('enostics_public_inbox_config')
      .update({
        is_public,
        requires_api_key,
        allowed_api_key_id,
        max_payload_size,
        rate_limit_per_hour,
        rate_limit_per_day,
        auto_webhook,
        webhook_url,
        webhook_secret,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating inbox config:', error)
      return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 })
    }
    
    return NextResponse.json({ config })
    
  } catch (error) {
    console.error('Inbox config update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 