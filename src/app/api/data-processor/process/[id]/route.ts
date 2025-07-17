import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { force_restart = false } = body

    // Get the queue item
    const { data: queueItem, error: fetchError } = await supabase
      .from('data_processor')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !queueItem) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
    }

    // Check if item can be processed
    if (queueItem.status === 'processing' && !force_restart) {
      return NextResponse.json({ 
        error: 'Item is already being processed. Use force_restart=true to restart.' 
      }, { status: 409 })
    }

    if (queueItem.status === 'completed' && !force_restart) {
      return NextResponse.json({ 
        error: 'Item is already completed. Use force_restart=true to reprocess.' 
      }, { status: 409 })
    }

    // Update status to processing
    const { data: updatedItem, error: updateError } = await supabase
      .from('data_processor')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        retry_count: force_restart ? 0 : queueItem.retry_count + 1,
        processing_logs: [
          ...queueItem.processing_logs || [],
          {
            timestamp: new Date().toISOString(),
            action: force_restart ? 'manual_restart' : 'manual_trigger',
            details: { triggered_by: user.id }
          }
        ]
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating queue item:', updateError)
      return NextResponse.json({ error: 'Failed to start processing' }, { status: 500 })
    }

    // Here you would trigger the actual processing engine
    // For now, we'll just simulate by immediately completing simple tasks
    if (queueItem.processing_plan === 'manual') {
      // Manual processing - just mark as ready for user review
      await supabase
        .from('data_processor')
        .update({
          status: 'pending',
          processing_results: {
            manual_review_required: true,
            queued_for_review: new Date().toISOString()
          }
        })
        .eq('id', id)
    }

    return NextResponse.json({ 
      message: 'Processing started',
      queue_item: updatedItem 
    })

  } catch (error) {
    console.error('Process queue item API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      status,
      priority,
      user_instructions,
      processing_results,
      user_feedback_score,
      user_tags,
      auto_tags
    } = body

    // Verify ownership
    const { data: queueItem, error: fetchError } = await supabase
      .from('data_processor')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !queueItem) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (status) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (user_instructions !== undefined) updateData.user_instructions = user_instructions
    if (processing_results) updateData.processing_results = processing_results
    if (user_feedback_score !== undefined) updateData.user_feedback_score = user_feedback_score
    if (user_tags) updateData.user_tags = user_tags
    if (auto_tags) updateData.auto_tags = auto_tags

    // Special handling for status changes
    if (status === 'completed' && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString()
    }

    if (status === 'processing' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString()
    }

    const { data: updatedItem, error: updateError } = await supabase
      .from('data_processor')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating queue item:', updateError)
      return NextResponse.json({ error: 'Failed to update queue item' }, { status: 500 })
    }

    return NextResponse.json({ queue_item: updatedItem })

  } catch (error) {
    console.error('Update queue item API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership and check if item can be deleted
    const { data: queueItem, error: fetchError } = await supabase
      .from('data_processor')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !queueItem) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
    }

    if (queueItem.status === 'processing') {
      return NextResponse.json({ 
        error: 'Cannot delete item that is currently being processed' 
      }, { status: 409 })
    }

    const { error: deleteError } = await supabase
      .from('data_processor')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting queue item:', deleteError)
      return NextResponse.json({ error: 'Failed to delete queue item' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Queue item deleted successfully' })

  } catch (error) {
    console.error('Delete queue item API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 