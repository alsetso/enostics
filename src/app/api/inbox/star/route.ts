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

    const { id, starred } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    console.log(`🔍 Updating star status for item ${id} for user ${user.id}`)

    // First, check if the item exists and belongs to the user
    const { data: currentItem, error: fetchError } = await supabase
      .from('data')
      .select('id, is_starred, endpoint_id, endpoints!inner(user_id)')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching current item:', fetchError)
      
      // If the error is about missing columns, return a more helpful error
      if (fetchError.message?.includes('is_starred')) {
        return NextResponse.json({ 
          error: 'Database migration required', 
          details: 'The is_starred column is missing from the data table. Please run the database migration.' 
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

    let newStarredValue = starred

    // If starred value is not provided, toggle the current value
    if (typeof starred !== 'boolean') {
      // Toggle the current value (handle null/undefined as false)
      newStarredValue = !(currentItem.is_starred || false)
    }

    console.log(`🔍 Updating star status for item ${id}: ${currentItem.is_starred} -> ${newStarredValue}`)

    // Update the item to toggle star status
    const { error: updateError } = await supabase
      .from('data')
      .update({ is_starred: newStarredValue })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating star status:', updateError)
      return NextResponse.json({ error: 'Failed to update star status' }, { status: 500 })
    }

    console.log(`✅ Successfully updated star status for item ${id}`)

    return NextResponse.json({ success: true, starred: newStarredValue })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 