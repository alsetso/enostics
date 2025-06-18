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
    const relationship = searchParams.get('relationship')
    const favorites = searchParams.get('favorites') === 'true'

    // Build query
    let query = supabase
      .from('enostics_inbox_contacts')
      .select(`
        id,
        contact_username,
        contact_display_name,
        contact_avatar_url,
        relationship_type,
        is_favorite,
        can_send_health_data,
        can_send_financial_data,
        can_send_location_data,
        allowed_data_types,
        last_sent_at,
        total_messages_sent,
        created_at
      `)
      .eq('user_id', user.id)
      .eq('is_blocked', false)
      .order('is_favorite', { ascending: false })
      .order('contact_display_name')

    // Apply filters
    if (search) {
      query = query.or(`contact_display_name.ilike.%${search}%,contact_username.ilike.%${search}%`)
    }
    
    if (relationship) {
      query = query.eq('relationship_type', relationship)
    }
    
    if (favorites) {
      query = query.eq('is_favorite', true)
    }

    const { data: contacts, error } = await query

    if (error) {
      console.error('Error fetching contacts:', error)
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }

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
    const { 
      contact_username, 
      display_name, 
      relationship_type = 'contact',
      permissions = {}
    } = body

    if (!contact_username) {
      return NextResponse.json({ error: 'Contact username is required' }, { status: 400 })
    }

    // Use the helper function to add contact
    const { data, error } = await supabase.rpc('add_enostics_contact', {
      p_contact_username: contact_username,
      p_display_name: display_name,
      p_relationship_type: relationship_type
    })

    if (error) {
      console.error('Error adding contact:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to add contact' 
      }, { status: 400 })
    }

    // Update permissions if provided
    if (Object.keys(permissions).length > 0) {
      const { error: updateError } = await supabase
        .from('enostics_inbox_contacts')
        .update({
          can_send_health_data: permissions.health || true,
          can_send_financial_data: permissions.financial || false,
          can_send_location_data: permissions.location || false,
          allowed_data_types: permissions.data_types || ['message', 'note', 'event']
        })
        .eq('id', data)

      if (updateError) {
        console.error('Error updating permissions:', updateError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      contact_id: data,
      message: 'Contact added successfully' 
    })

  } catch (error) {
    console.error('Add contact API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 