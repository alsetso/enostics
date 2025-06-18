import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const timeRange = searchParams.get('timeRange') || 'all'
    const search = searchParams.get('search') || ''

    // Build query
    let query = supabase
      .from('enostics_activity_logs')
      .select(`
        id,
        log_type,
        category,
        action,
        status,
        source_identifier,
        source_type,
        details,
        metadata,
        endpoint_id,
        request_id,
        email_id,
        response_time_ms,
        payload_size,
        error_code,
        error_message,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (type !== 'all') {
      query = query.eq('log_type', type)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply time range filter
    if (timeRange !== 'all') {
      const now = new Date()
      let startTime: Date
      
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startTime = now
      }
      
      query = query.gte('created_at', startTime.toISOString())
    }

    // Apply search filter (if provided)
    if (search) {
      query = query.or(`category.ilike.%${search}%,action.ilike.%${search}%,source_identifier.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching activity logs:', error)
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }

    // Get stats for the current user
    const { data: statsData, error: statsError } = await supabase
      .from('enostics_activity_logs')
      .select('log_type, status, created_at')
      .eq('user_id', user.id)

    if (statsError) {
      console.error('Error fetching stats:', statsError)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // Calculate statistics
    const now = Date.now()
    const last24h = now - (24 * 60 * 60 * 1000)
    
    const stats = {
      total: statsData?.length || 0,
      success: statsData?.filter(l => l.status === 'success').length || 0,
      failure: statsData?.filter(l => l.status === 'failure').length || 0,
      warning: statsData?.filter(l => l.status === 'warning').length || 0,
      requests_24h: statsData?.filter(l => 
        l.log_type === 'request' && new Date(l.created_at).getTime() > last24h
      ).length || 0,
      emails_24h: statsData?.filter(l => 
        l.log_type === 'email' && new Date(l.created_at).getTime() > last24h
      ).length || 0
    }

    return NextResponse.json({ 
      logs: logs || [], 
      stats,
      pagination: {
        limit,
        offset,
        total: stats.total
      }
    })

  } catch (error) {
    console.error('Logs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST method to manually log an activity
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      log_type,
      category,
      action,
      status = 'info',
      source_identifier,
      source_type,
      details = {},
      metadata = {},
      endpoint_id,
      request_id,
      email_id,
      response_time_ms,
      payload_size,
      error_code,
      error_message
    } = body

    // Validate required fields
    if (!log_type || !category || !action) {
      return NextResponse.json(
        { error: 'log_type, category, and action are required' },
        { status: 400 }
      )
    }

    // Insert the log entry
    const { data: logEntry, error } = await supabase
      .from('enostics_activity_logs')
      .insert({
        user_id: user.id,
        log_type,
        category,
        action,
        status,
        source_identifier,
        source_type,
        details,
        metadata,
        endpoint_id,
        request_id,
        email_id,
        response_time_ms,
        payload_size,
        error_code,
        error_message
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating log entry:', error)
      return NextResponse.json({ error: 'Failed to create log entry' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      log: logEntry 
    }, { status: 201 })

  } catch (error) {
    console.error('Log creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 