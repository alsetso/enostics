import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('processing_batch')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: batches, error: batchError } = await query

    if (batchError) {
      console.error('Error fetching batches:', batchError)
      return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('processing_batch')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error fetching batch count:', countError)
    }

    return NextResponse.json({
      batches: batches || [],
      total: count || 0,
      limit,
      offset,
      has_more: (batches?.length || 0) === limit
    })

  } catch (error) {
    console.error('Batches API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 