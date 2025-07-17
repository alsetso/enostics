import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return mock contacts for now
    return NextResponse.json({
      contacts: [
        {
          id: '1',
          name: 'Health App',
          endpoint: '/api/health',
          last_contact: new Date().toISOString(),
          status: 'active'
        },
        {
          id: '2',
          name: 'Tesla API',
          endpoint: '/api/vehicles',
          last_contact: new Date().toISOString(),
          status: 'active'
        }
      ]
    })
  } catch (error) {
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

    const { name, endpoint } = await request.json()
    
    if (!name || !endpoint) {
      return NextResponse.json({ error: 'Name and endpoint are required' }, { status: 400 })
    }

    const newContact = {
      id: Date.now().toString(),
      name,
      endpoint,
      user_id: user.id,
      created_at: new Date().toISOString(),
      status: 'active'
    }

    return NextResponse.json({ contact: newContact }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 