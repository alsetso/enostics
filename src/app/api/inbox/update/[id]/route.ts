import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    const supabase = getSupabaseAdmin()
    
    // Validate allowed fields
    const allowedFields = ['user_notes', 'user_category']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)
    
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('data')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating record:', error)
      return NextResponse.json(
        { error: 'Failed to update record' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data
    })
    
  } catch (error) {
    console.error('Update record error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 