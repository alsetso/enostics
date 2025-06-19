import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createApiKey } from '@/lib/api-keys'
import { PermissionMiddleware } from '@/lib/permissions'

// GET - List user's endpoints
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's endpoints
    const { data: endpoints, error } = await supabase
      .from('endpoints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch endpoints' }, { status: 500 })
    }

    return NextResponse.json({ endpoints })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new endpoint
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, url_path, auth_type = 'none', settings = {} } = await request.json()

    // Validate required fields
    if (!name || !url_path) {
      return NextResponse.json({ error: 'Name and URL path are required' }, { status: 400 })
    }

    // Check if user can create endpoint
    try {
      await PermissionMiddleware.checkEndpointCreation(user.id)
    } catch (error) {
      return NextResponse.json({ 
        error: 'Endpoint creation not allowed', 
        message: error instanceof Error ? error.message : 'Plan upgrade required',
        upgrade_required: true
      }, { status: 403 })
    }

    // Check if URL path is already taken by this user
    const { data: existing } = await supabase
      .from('endpoints')
      .select('id')
      .eq('user_id', user.id)
      .eq('url_path', url_path)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'URL path already exists' }, { status: 409 })
    }

    // Create endpoint
    const { data: endpoint, error } = await supabase
      .from('endpoints')
      .insert({
        user_id: user.id,
        name,
        description,
        url_path,
        auth_type,
        settings,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create endpoint' }, { status: 500 })
    }

    // Automatically create an API key for the new endpoint
    const apiKeyResult = await createApiKey({
      userId: user.id,
      endpointId: endpoint.id,
      name: `${name} - Default Key`,
      expiresInDays: 365
    })

    let apiKey = null
    if ('key' in apiKeyResult) {
      apiKey = apiKeyResult.key
    } else {
      console.error('Failed to create API key:', apiKeyResult.error)
    }

    return NextResponse.json({ 
      endpoint,
      apiKey,
      message: apiKey ? 'Endpoint and API key created successfully' : 'Endpoint created, but API key creation failed'
    }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update endpoint
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, description, url_path, auth_type, settings, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Endpoint ID is required' }, { status: 400 })
    }

    // Update endpoint (RLS will ensure user can only update their own)
    const { data: endpoint, error } = await supabase
      .from('endpoints')
      .update({
        name,
        description,
        url_path,
        auth_type,
        settings,
        is_active
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update endpoint' }, { status: 500 })
    }

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    }

    return NextResponse.json({ endpoint })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete endpoint
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Endpoint ID is required' }, { status: 400 })
    }

    // Delete endpoint (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from('endpoints')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete endpoint' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 