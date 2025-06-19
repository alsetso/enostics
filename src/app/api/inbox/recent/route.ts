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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    // Get user's endpoints first
    const { data: endpoints, error: endpointsError } = await supabase
      .from('endpoints')
      .select('id, name, url_path')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (endpointsError) {
      console.error('Error fetching endpoints:', endpointsError)
      return NextResponse.json({ error: 'Failed to fetch endpoints' }, { status: 500 })
    }

    if (!endpoints || endpoints.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        unread: 0,
        starred: 0,
        hasMore: false
      })
    }

    const endpointIds = endpoints.map(ep => ep.id)

    // Build the main data query
    let query = supabase
      .from('data')
      .select(`
        id,
        endpoint_id,
        data,
        source_ip,
        headers,
        user_agent,
        processed_at,
        status,
        endpoints!inner(
          name,
          url_path
        )
      `)
      .in('endpoint_id', endpointIds)
      .order('processed_at', { ascending: false })

    // Apply search filter if provided
    if (search) {
      // Search in JSON data
      query = query.or(`data::text.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: rawData, error: dataError } = await query

    if (dataError) {
      console.error('Error fetching inbox data:', dataError)
      return NextResponse.json({ error: 'Failed to fetch inbox data' }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedData = (rawData || []).map(item => {
      const payload = item.data || {}
      
      // Extract meaningful information from the payload
      const getSubject = () => {
        if (payload.subject) return payload.subject
        if (payload.title) return payload.title
        if (payload.event) return `Event: ${payload.event}`
        if (payload.type) return `${payload.type} data received`
        return 'Data received'
      }

      const getPreview = () => {
        if (payload.message) return payload.message
        if (payload.description) return payload.description
        if (payload.content) return payload.content
        
        // Try to create a meaningful preview from the data
        const keys = Object.keys(payload).slice(0, 3)
        if (keys.length > 0) {
          return keys.map(key => `${key}: ${JSON.stringify(payload[key])}`).join(' | ')
        }
        return 'No preview available'
      }

      const getSender = () => {
        if (payload.sender) return payload.sender
        if (payload.source) return payload.source
        if (payload.from) return payload.from
        if (item.user_agent) {
          // Extract app name from user agent
          const ua = item.user_agent
          if (ua.includes('Postman')) return 'Postman'
          if (ua.includes('curl')) return 'cURL'
          if (ua.includes('Python')) return 'Python Script'
          if (ua.includes('Node.js')) return 'Node.js App'
          return 'Unknown Client'
        }
        return 'API Client'
      }

      const getType = () => {
        if (payload.type) return payload.type
        if (payload.event_type) return payload.event_type
        return 'data'
      }

      return {
        id: item.id,
        user_id: user.id,
        sender: getSender(),
        source: 'api_endpoint',
        type: getType(),
        subject: getSubject(),
        preview: getPreview().substring(0, 100),
        timestamp: new Date(item.processed_at).toLocaleString(),
        is_read: item.status === 'processed', // Consider processed items as read
        is_starred: false, // We'll add starring functionality later
        source_ip: item.source_ip,
        user_agent: item.user_agent,
        payload: payload,
        endpoint_name: (item.endpoints as any)?.[0]?.name || 'Unknown Endpoint',
        endpoint_path: (item.endpoints as any)?.[0]?.url_path || '',
        raw_data: item
      }
    })

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('data')
      .select('*', { count: 'exact', head: true })
      .in('endpoint_id', endpointIds)

    // Calculate stats
    const unreadCount = transformedData.filter(item => !item.is_read).length
    const starredCount = transformedData.filter(item => item.is_starred).length

    return NextResponse.json({
      data: transformedData,
      total: totalCount || 0,
      unread: unreadCount,
      starred: starredCount,
      hasMore: (offset + limit) < (totalCount || 0),
      endpoints: endpoints
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST endpoint for manually adding data (compose functionality)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint_id, data, data_type = 'manual', source_description } = body

    // Validate that the endpoint belongs to the user
    const { data: endpoint, error: endpointError } = await supabase
      .from('endpoints')
      .select('id, name')
      .eq('id', endpoint_id)
      .eq('user_id', user.id)
      .single()

    if (endpointError || !endpoint) {
      return NextResponse.json({ error: 'Endpoint not found or unauthorized' }, { status: 404 })
    }

    // Insert the data
    const { data: insertedData, error: insertError } = await supabase
      .from('data')
      .insert({
        endpoint_id,
        data,
        source_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        headers: {
          'user-agent': request.headers.get('user-agent'),
          'content-type': request.headers.get('content-type'),
          source_description
        },
        user_agent: request.headers.get('user-agent'),
        content_type: request.headers.get('content-type'),
        data_size: JSON.stringify(data).length,
        status: 'received'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting data:', insertError)
      return NextResponse.json({ error: 'Failed to insert data' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: insertedData,
      message: 'Data added successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 