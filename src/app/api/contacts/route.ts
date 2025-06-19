import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    // Get all public endpoints (which can act as "contacts")
    let query = supabase
      .from('enostics_endpoints')
      .select(`
        id,
        name,
        url_path,
        description,
        user_id,
        is_active,
        is_public,
        created_at
      `)
      .eq('is_active', true)
      .eq('is_public', true)
      .order('name')

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,url_path.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: endpoints, error } = await query

    if (error) {
      console.error('Error fetching endpoints:', error)
      return NextResponse.json({ error: 'Failed to fetch endpoints' }, { status: 500 })
    }

    // Transform endpoints to contact-like format
    const contacts = endpoints?.map(endpoint => ({
      id: endpoint.id,
      contact_username: endpoint.url_path,
      contact_display_name: endpoint.name,
      contact_description: endpoint.description,
      endpoint_url: `/api/v1/${endpoint.url_path}`,
      is_own_endpoint: endpoint.user_id === user.id,
      created_at: endpoint.created_at
    })) || []

    return NextResponse.json({ contacts })

  } catch (error) {
    console.error('Contacts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint_url, message } = body

    if (!endpoint_url) {
      return NextResponse.json({ error: 'Endpoint URL is required' }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Send the message to the endpoint
    const response = await fetch(endpoint_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Enostics-Contact/1.0'
      },
      body: JSON.stringify({
        type: 'contact_message',
        message,
        sender: user.email,
        timestamp: new Date().toISOString()
      })
    })

    const responseData = await response.text()

    return NextResponse.json({ 
      success: response.ok,
      status: response.status,
      response: responseData,
      message: response.ok ? 'Message sent successfully' : 'Failed to send message'
    })

  } catch (error) {
    console.error('Send message API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 