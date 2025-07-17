import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface DatabaseRecord {
  id: string
  source: string
  data_type: string
  created_at: string
  raw_data: any
}

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json()
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Record IDs are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createServerSupabaseClient()
    
    // Get user session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Fetch records owned by the user
    const { data: records, error } = await supabase
      .from('data')
      .select('id, source, data_type, created_at, raw_data')
      .in('id', ids)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching records:', error)
      return NextResponse.json(
        { error: 'Failed to fetch records' },
        { status: 500 }
      )
    }
    
    // Return the records with limited data for privacy
    const sanitizedRecords = (records as DatabaseRecord[]).map((record: DatabaseRecord) => ({
      id: record.id,
      source: record.source,
      data_type: record.data_type,
      created_at: record.created_at,
      preview: typeof record.raw_data === 'string' 
        ? record.raw_data.substring(0, 100) + '...'
        : JSON.stringify(record.raw_data).substring(0, 100) + '...'
    }))
    
    return NextResponse.json({
      records: sanitizedRecords,
      count: sanitizedRecords.length
    })
    
  } catch (error) {
    console.error('Error in records API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 