import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getRecentRequestLogs } from '@/lib/request-logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const endpointId = searchParams.get('endpoint_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!endpointId) {
      return NextResponse.json({ error: 'endpoint_id is required' }, { status: 400 })
    }

    // Verify user owns the endpoint
    const { data: endpoint, error: endpointError } = await supabase
      .from('enostics_endpoints')
      .select('id')
      .eq('id', endpointId)
      .eq('user_id', user.id)
      .single()

    if (endpointError || !endpoint) {
      return NextResponse.json({ error: 'Endpoint not found or not authorized' }, { status: 404 })
    }

    const logs = await getRecentRequestLogs(endpointId, limit)
    
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 