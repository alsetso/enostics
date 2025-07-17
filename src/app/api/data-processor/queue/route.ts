import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return mock queue data for now
    return NextResponse.json({
      queue: [
        {
          id: '1',
          type: 'health_data',
          status: 'processing',
          created_at: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '2',
          type: 'sensor_data',
          status: 'completed',
          created_at: new Date().toISOString(),
          priority: 'medium'
        }
      ],
      total: 2,
      processing: 1,
      completed: 1
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

    const body = await request.json()
    
    // Handle batch processing (new intelligence selector workflow)
    if (body.record_ids && Array.isArray(body.record_ids)) {
      const { 
        record_ids, 
        processing_plan = 'auto_basic',
        batch_name,
        branch_name,
        priority = 5,
        business_domain = 'general'
      } = body

      if (record_ids.length === 0) {
        return NextResponse.json({ error: 'No records provided' }, { status: 400 })
      }

      // Verify all records exist and belong to the user
      const { data: userRecords, error: recordsError } = await supabase
        .from('data')
        .select('id, endpoint_id, endpoints!inner(user_id)')
        .in('id', record_ids)

      if (recordsError) {
        console.error('Error fetching records:', recordsError)
        return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
      }

      // Verify all records belong to the user
      const validRecords = userRecords?.filter(record => 
        (record.endpoints as any)?.user_id === user.id
      ) || []

      if (validRecords.length !== record_ids.length) {
        return NextResponse.json({ error: 'Some records not found or access denied' }, { status: 403 })
      }

      // Estimate batch cost using the database function
      const { data: estimatedCost, error: costError } = await supabase
        .rpc('estimate_batch_cost', {
          record_count: record_ids.length,
          processing_plan
        })

      if (costError) {
        console.error('Error estimating cost:', costError)
        return NextResponse.json({ error: 'Failed to estimate cost' }, { status: 500 })
      }

      // Create processing batch
      const { data: batch, error: batchError } = await supabase
        .from('processing_batch')
        .insert({
          user_id: user.id,
          name: batch_name || `Batch processing ${record_ids.length} records`,
          branch_name: branch_name || null,
          description: `Processing ${record_ids.length} records with ${processing_plan} plan`,
          status: 'pending',
          total_records: record_ids.length,
          estimated_cost_cents: estimatedCost || 0,
          processing_plan,
          business_domain,
          priority,
          ai_models_enabled: processing_plan === 'auto_advanced' 
            ? ['classification', 'sentiment', 'entity_extraction', 'quality_assessment']
            : ['classification', 'quality_assessment']
        })
        .select()
        .single()

      if (batchError) {
        console.error('Error creating batch:', batchError)
        return NextResponse.json({ error: 'Failed to create processing batch' }, { status: 500 })
      }

      // Update data records with batch_id and queue_status
      const { error: updateError } = await supabase
        .from('data')
        .update({
          queue_status: 'queued',
          batch_id: batch.id
        })
        .in('id', record_ids)

      if (updateError) {
        console.error('Error updating records:', updateError)
        return NextResponse.json({ error: 'Failed to update records' }, { status: 500 })
      }

      // Create data_processor entries for each record
      const processorEntries = record_ids.map((recordId: string) => ({
        user_id: user.id,
        source_data_id: recordId,
        batch_id: batch.id,
        processing_plan,
        priority,
        business_domain,
        status: 'pending',
        ai_models_enabled: processing_plan === 'auto_advanced' 
          ? ['classification', 'sentiment', 'entity_extraction', 'quality_assessment']
          : ['classification', 'quality_assessment'],
        estimated_cost_cents: Math.floor((estimatedCost || 0) / record_ids.length)
      }))

      const { error: processorError } = await supabase
        .from('data_processor')
        .insert(processorEntries)

      if (processorError) {
        console.error('Error creating processor entries:', processorError)
        return NextResponse.json({ error: 'Failed to create processor entries' }, { status: 500 })
      }

      return NextResponse.json({ 
        batch_id: batch.id,
        batch,
        records_queued: record_ids.length,
        estimated_cost_cents: estimatedCost || 0,
        message: 'Successfully added records to processing queue'
      }, { status: 201 })
    }

    // Legacy single-item processing (backward compatibility)
    const { type, data, priority = 'medium' } = body
    
    if (!type || !data) {
      return NextResponse.json({ error: 'Type and data are required' }, { status: 400 })
    }

    const queueItem = {
      id: Date.now().toString(),
      type,
      data,
      priority,
      status: 'queued',
      user_id: user.id,
      created_at: new Date().toISOString()
    }

    return NextResponse.json({ queue_item: queueItem }, { status: 201 })
  } catch (error) {
    console.error('Queue API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 