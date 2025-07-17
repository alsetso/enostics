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

    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    console.log(`🔍 Marking item ${id} as read for user ${user.id}`)

    // First, check if the item exists and belongs to the user
    const { data: currentItem, error: fetchError } = await supabase
      .from('data')
      .select('id, is_read, endpoint_id, endpoints!inner(user_id)')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching current item:', fetchError)
      
      // If the error is about missing columns, return a more helpful error
      if (fetchError.message?.includes('is_read')) {
        return NextResponse.json({ 
          error: 'Database migration required', 
          details: 'The is_read column is missing from the data table. Please run the database migration.' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    console.log(`🔍 Current item status:`, currentItem)

    // Check if the user owns this data item through their endpoint
    const endpoint = currentItem.endpoints as any
    if (endpoint.user_id !== user.id) {
      console.error('User does not own this item')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update the item to mark as read
    const { error: updateError } = await supabase
      .from('data')
      .update({ is_read: true })
      .eq('id', id)

    if (updateError) {
      console.error('Error marking item as read:', updateError)
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
    }

    console.log(`✅ Successfully marked item ${id} as read`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 