import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createApiKey, getUserApiKeys, deactivateApiKey, deleteApiKey } from '@/lib/api-keys'

// GET - List user's API keys
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await getUserApiKeys(user.id)
    
    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, endpointId, expiresInDays } = await request.json()

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 })
    }

    // If endpoint ID is provided, verify it belongs to the user
    if (endpointId) {
      const { data: endpoint, error } = await supabase
        .from('enostics_endpoints')
        .select('id')
        .eq('id', endpointId)
        .eq('user_id', user.id)
        .single()

      if (error || !endpoint) {
        return NextResponse.json({ error: 'Endpoint not found or not owned by user' }, { status: 404 })
      }
    }

    const result = await createApiKey({
      userId: user.id,
      endpointId,
      name,
      expiresInDays
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      message: 'API key created successfully',
      apiKey: result.key,
      keyData: result.keyData
    }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update API key (deactivate/reactivate)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyId, action } = await request.json()

    if (!keyId || !action) {
      return NextResponse.json({ error: 'Key ID and action are required' }, { status: 400 })
    }

    let success = false
    
    if (action === 'deactivate') {
      success = await deactivateApiKey(keyId, user.id)
    } else if (action === 'reactivate') {
      const { error } = await supabase
        .from('enostics_api_keys')
        .update({ is_active: true })
        .eq('id', keyId)
        .eq('user_id', user.id)
      success = !error
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `API key ${action}d successfully` })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete API key permanently
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 })
    }

    const success = await deleteApiKey(keyId, user.id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'API key deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 