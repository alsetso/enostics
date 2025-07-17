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

    // Get user's endpoints
    const { data: endpoints, error: endpointsError } = await supabase
      .from('endpoints')
      .select('id, name, url_path')
      .eq('user_id', user.id)

    if (endpointsError) {
      return NextResponse.json({ error: 'Failed to fetch endpoints' }, { status: 500 })
    }

    if (!endpoints || endpoints.length === 0) {
      return NextResponse.json({
        message: 'No endpoints found for user',
        user_id: user.id,
        endpoints: []
      })
    }

    const endpointIds = endpoints.map(ep => ep.id)

    // Get all data items for the user
    const { data: items, error: itemsError } = await supabase
      .from('data')
      .select('id, is_read, is_starred, subject, preview, source, type, endpoint_id')
      .in('endpoint_id', endpointIds)
      .order('id')

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }

    // Get column information
    const { data: sampleItem } = await supabase
      .from('data')
      .select('*')
      .limit(1)

    const availableColumns = sampleItem && sampleItem.length > 0 ? Object.keys(sampleItem[0]) : []

    // Count statistics
    const stats = {
      total: items.length,
      read: items.filter(item => item.is_read).length,
      unread: items.filter(item => !item.is_read).length,
      starred: items.filter(item => item.is_starred).length,
      unstarred: items.filter(item => !item.is_starred).length,
    }

    return NextResponse.json({
      user_id: user.id,
      endpoints,
      availableColumns,
      stats,
      items: items.map(item => ({
        id: item.id,
        is_read: item.is_read,
        is_starred: item.is_starred,
        subject: item.subject || 'No subject',
        preview: item.preview || 'No preview',
        source: item.source || 'No source',
        type: item.type || 'No type',
        endpoint_id: item.endpoint_id
      }))
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 