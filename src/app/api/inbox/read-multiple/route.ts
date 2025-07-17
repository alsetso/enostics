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

    const { ids } = await request.json()
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Item IDs array is required' }, { status: 400 })
    }

    console.log(`🔍 Marking ${ids.length} items as read for user ${user.id}:`, ids)

    // First, verify all items belong to the user
    const { data: items, error: fetchError } = await supabase
      .from('data')
      .select('id, endpoint_id, endpoints!inner(user_id)')
      .in('id', ids)

    if (fetchError) {
      console.error('Error fetching items:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }

    // Check if all items belong to the user
    const unauthorizedItems = items.filter(item => {
      const endpoint = item.endpoints as any
      return endpoint.user_id !== user.id
    })

    if (unauthorizedItems.length > 0) {
      console.error('User does not own some items:', unauthorizedItems.map(item => item.id))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log(`🔍 All ${items.length} items verified as belonging to user`)

    // Update multiple items to mark as read
    const { error: updateError } = await supabase
      .from('data')
      .update({ is_read: true })
      .in('id', ids)

    if (updateError) {
      console.error('Error marking items as read:', updateError)
      return NextResponse.json({ error: 'Failed to mark items as read' }, { status: 500 })
    }

    console.log(`✅ Successfully marked ${ids.length} items as read`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 