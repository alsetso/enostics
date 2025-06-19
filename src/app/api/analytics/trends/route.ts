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
    const days = parseInt(searchParams.get('days') || '30')
    const business_context = searchParams.get('business_context')
    const sender_name = searchParams.get('sender_name')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Build query
    let query = supabase
      .from('enostics_data')
      .select('processed_at, data_quality_score, business_context, sender_info')
      .eq('user_id', user.id)
      .gte('processed_at', startDate.toISOString())
      .lte('processed_at', endDate.toISOString())
      .order('processed_at', { ascending: true })

    // Add filters if provided
    if (business_context) {
      query = query.eq('business_context', business_context)
    }

    if (sender_name) {
      query = query.ilike('sender_info->>explicit_name', `%${sender_name}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching trend data:', error)
      return NextResponse.json({ error: 'Failed to fetch trend data' }, { status: 500 })
    }

    // Group data by date
    const groupedData = data.reduce((acc: any, item: any) => {
      const date = new Date(item.processed_at).toISOString().split('T')[0]
      
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          total_quality: 0,
          business_contexts: new Set(),
          records: []
        }
      }
      
      acc[date].count++
      acc[date].total_quality += item.data_quality_score || 0
      if (item.business_context) {
        acc[date].business_contexts.add(item.business_context)
      }
      acc[date].records.push(item)
      
      return acc
    }, {})

    // Convert to array and calculate averages
    const trends = Object.values(groupedData).map((day: any) => ({
      date: day.date,
      count: day.count,
      avg_quality: Math.round(day.total_quality / day.count),
      business_contexts: Array.from(day.business_contexts),
      quality_trend: calculateQualityTrend(day.records)
    }))

    // Calculate overall statistics
    const totalRecords = data.length
    const avgQuality = data.length > 0 
      ? Math.round(data.reduce((sum: number, item: any) => sum + (item.data_quality_score || 0), 0) / data.length)
      : 0
    const uniqueContexts = new Set(data.map((item: any) => item.business_context).filter(Boolean)).size

    return NextResponse.json({
      trends,
      summary: {
        total_records: totalRecords,
        avg_quality: avgQuality,
        unique_contexts: uniqueContexts,
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Error in trends API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateQualityTrend(records: any[]): 'improving' | 'declining' | 'stable' {
  if (records.length < 2) return 'stable'
  
  const first = records[0]?.data_quality_score || 0
  const last = records[records.length - 1]?.data_quality_score || 0
  const diff = last - first
  
  if (diff > 10) return 'improving'
  if (diff < -10) return 'declining'
  return 'stable'
} 