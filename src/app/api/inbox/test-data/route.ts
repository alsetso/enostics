import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create a test endpoint for the user
    let { data: endpoint, error: endpointError } = await supabase
      .from('endpoints')
      .select('id, name, url_path')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (endpointError || !endpoint) {
      // Create a test endpoint
      const { data: newEndpoint, error: createError } = await supabase
        .from('endpoints')
        .insert({
          user_id: user.id,
          name: 'Test Endpoint',
          url_path: '/test',
          is_active: true,
          description: 'Test endpoint for debugging'
        })
        .select()
        .single()

      if (createError || !newEndpoint) {
        console.error('Error creating test endpoint:', createError)
        return NextResponse.json({ error: 'Failed to create test endpoint' }, { status: 500 })
      }

      endpoint = newEndpoint
    }

    // At this point, endpoint is guaranteed to exist
    if (!endpoint) {
      return NextResponse.json({ error: 'Failed to get or create endpoint' }, { status: 500 })
    }

    // Create some test data
    const testData = [
      {
        endpoint_id: endpoint.id,
        data: {
          message: 'Test message 1',
          type: 'notification',
          priority: 'high'
        },
        source: 'test-api',
        type: 'notification',
        subject: 'Test Notification',
        preview: 'This is a test notification message',
        source_ip: '127.0.0.1',
        user_agent: 'Test Agent',
        is_read: false,
        is_starred: false
      },
      {
        endpoint_id: endpoint.id,
        data: {
          event: 'user_signup',
          user_id: '12345',
          email: 'test@example.com'
        },
        source: 'webhook',
        type: 'event',
        subject: 'User Signup Event',
        preview: 'New user signed up: test@example.com',
        source_ip: '192.168.1.100',
        user_agent: 'Webhook/1.0',
        is_read: false,
        is_starred: true
      },
      {
        endpoint_id: endpoint.id,
        data: {
          temperature: 22.5,
          humidity: 65,
          sensor_id: 'sensor_001'
        },
        source: 'iot-device',
        type: 'sensor_data',
        subject: 'Sensor Data Update',
        preview: 'Temperature: 22.5°C, Humidity: 65%',
        source_ip: '10.0.0.50',
        user_agent: 'IoT Device v2.1',
        is_read: false,
        is_starred: false
      }
    ]

    // Insert test data
    const { data: insertedData, error: insertError } = await supabase
      .from('data')
      .insert(testData)
      .select()

    if (insertError) {
      console.error('Error inserting test data:', insertError)
      return NextResponse.json({ error: 'Failed to insert test data' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test data created successfully',
      endpoint: endpoint,
      data: insertedData
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check current test data
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
      .eq('is_active', true)

    if (endpointsError) {
      console.error('Error fetching endpoints:', endpointsError)
      return NextResponse.json({ error: 'Failed to fetch endpoints' }, { status: 500 })
    }

    if (!endpoints || endpoints.length === 0) {
      return NextResponse.json({
        message: 'No endpoints found',
        endpoints: [],
        data: []
      })
    }

    const endpointIds = endpoints.map(ep => ep.id)

    // Get recent data
    const { data: recentData, error: dataError } = await supabase
      .from('data')
      .select('*')
      .in('endpoint_id', endpointIds)
      .order('created_at', { ascending: false })
      .limit(10)

    if (dataError) {
      console.error('Error fetching data:', dataError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Current test data',
      endpoints: endpoints,
      data: recentData || []
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 