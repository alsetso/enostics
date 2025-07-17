import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting inbox/recent API call...')
    const supabase = await createServerSupabaseClient()
    console.log('✅ Supabase client created successfully')
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('🔍 User check:', { user: user?.id, error: userError })
    
    if (userError || !user) {
      console.log('❌ User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ User authenticated:', user.id)
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    console.log('🔍 Query params:', { limit, offset, search })

    // Get user's endpoints first
    console.log('🔍 Fetching user endpoints...')
    const { data: endpoints, error: endpointsError } = await supabase
      .from('endpoints')
      .select('id, name, url_path')
      .eq('user_id', user.id)
      .eq('is_active', true)

    console.log('🔍 Endpoints query result:', { endpoints, error: endpointsError })

    if (endpointsError) {
      console.error('❌ Error fetching endpoints:', endpointsError)
      return NextResponse.json({ error: 'Failed to fetch endpoints' }, { status: 500 })
    }

    if (!endpoints || endpoints.length === 0) {
      console.log('⚠️ No endpoints found for user')
      return NextResponse.json({
        items: [],
        total: 0,
        unread: 0,
        starred: 0,
        hasMore: false
      })
    }

    console.log('✅ Found endpoints:', endpoints.length)
    const endpointIds = endpoints.map(ep => ep.id)
    console.log('🔍 Endpoint IDs:', endpointIds)

    // Build the main data query - select all columns to see what's available
    console.log('🔍 Building data query...')
    let query = supabase
      .from('data')
      .select('*')
      .in('endpoint_id', endpointIds)

    // Apply search filter if provided
    if (search) {
      // Search in JSON data
      query = query.or(`data::text.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    console.log('🔍 Executing data query...')
    const { data: rawData, error: dataError } = await query

    console.log('🔍 Data query result:', { 
      rawDataLength: rawData?.length, 
      error: dataError,
      sampleData: rawData?.[0] ? Object.keys(rawData[0]) : []
    })

    if (dataError) {
      console.error('❌ Error fetching inbox data:', dataError)
      return NextResponse.json({ error: 'Failed to fetch inbox data' }, { status: 500 })
    }

    // Get endpoint information separately to avoid join issues
    const endpointMap = new Map()
    for (const endpoint of endpoints) {
      endpointMap.set(endpoint.id, endpoint)
    }

    console.log('🔍 Transforming data...')
    // Transform the data to match the expected format
    const transformedData = (rawData || []).map(item => {
      const payload = item.data || {}
      const endpoint = endpointMap.get(item.endpoint_id)
      
      // Extract meaningful information from the payload
      const getSubject = () => {
        if (item.subject) return item.subject
        if (payload.subject) return payload.subject
        if (payload.title) return payload.title
        if (payload.event) return `Event: ${payload.event}`
        if (payload.type) return `${payload.type} data received`
        return 'Data received'
      }

      const getPreview = () => {
        if (item.preview) return item.preview
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
        if (item.source) return item.source
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
        if (item.type) return item.type
        if (payload.type) return payload.type
        if (payload.event_type) return payload.event_type
        return 'data'
      }

      // Get timestamp from various possible sources
      const getTimestamp = () => {
        if (item.created_at) return item.created_at
        if (item.timestamp) return item.timestamp
        if (payload.timestamp) return payload.timestamp
        if (payload.created_at) return payload.created_at
        return new Date().toISOString() // fallback to current time
      }

      const timestamp = getTimestamp()

      return {
        id: item.id,
        user_id: user.id,
        sender: getSender(),
        source: item.source || 'api_endpoint',
        type: getType(),
        subject: getSubject(),
        preview: getPreview().substring(0, 100),
        timestamp: new Date(timestamp).toLocaleString(),
        is_read: item.is_read || false,
        is_starred: item.is_starred || false,
        source_ip: item.source_ip,
        user_agent: item.user_agent,
        data: payload,
        created_at: timestamp,
        endpoint_name: endpoint?.name || 'Unknown Endpoint',
        endpoint_path: endpoint?.url_path || '',
        raw_data: item
      }
    })

    console.log('🔍 Getting total count...')
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('data')
      .select('*', { count: 'exact', head: true })
      .in('endpoint_id', endpointIds)

    console.log('🔍 Total count:', totalCount)

    // Calculate stats
    const unreadCount = transformedData.filter(item => !item.is_read).length
    const starredCount = transformedData.filter(item => item.is_starred).length

    console.log('✅ Returning successful response:', {
      itemsLength: transformedData.length,
      total: totalCount,
      unread: unreadCount,
      starred: starredCount
    })

    return NextResponse.json({
      items: transformedData,
      total: totalCount || 0,
      unread: unreadCount,
      starred: starredCount,
      hasMore: (offset + limit) < (totalCount || 0),
      endpoints: endpoints
    })

  } catch (error) {
    console.error('❌ Unexpected error in inbox/recent:', error)
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
        user_agent: request.headers.get('user-agent'),
        type: data_type,
        source: source_description || 'manual',
        subject: data.subject || 'Manual entry',
        preview: data.preview || JSON.stringify(data).substring(0, 100),
        is_read: false,
        is_starred: false
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