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
    const timeframe = searchParams.get('timeframe') || '7d' // 1d, 7d, 30d, 90d, 1y
    const business_domain = searchParams.get('business_domain')

    // Get comprehensive stats using the database function
    const { data: basicStats } = await supabase.rpc('get_data_processor_stats', {
      user_uuid: user.id
    })

    // Get time-based analytics
    const timeframeMap: Record<string, string> = {
      '1d': '1 day',
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      '1y': '1 year'
    }

    const timefilter = timeframeMap[timeframe] || '7 days'

    let analyticsQuery = supabase
      .from('data_processor')
      .select('*')
      .eq('user_id', user.id)
      .gte('queued_at', `now() - interval '${timefilter}'`)

    if (business_domain) {
      analyticsQuery = analyticsQuery.eq('business_domain', business_domain)
    }

    const { data: timeframeData, error: analyticsError } = await analyticsQuery

    if (analyticsError) {
      console.error('Error fetching analytics data:', analyticsError)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Process analytics data
    const analytics = {
      timeframe,
      total_items: timeframeData?.length || 0,
      status_breakdown: {} as Record<string, number>,
      priority_breakdown: {} as Record<string, number>,
      business_domain_breakdown: {} as Record<string, number>,
      processing_plan_breakdown: {} as Record<string, number>,
      daily_volume: {} as Record<string, number>,
      avg_processing_time: 0,
      success_rate: 0,
      cost_analysis: {
        total_cost_cents: 0,
        avg_cost_per_item_cents: 0,
        cost_by_plan: {} as Record<string, number>
      },
      performance_metrics: {
        fastest_processing_time: null as number | null,
        slowest_processing_time: null as number | null,
        median_processing_time: null as number | null,
        error_rate: 0,
        retry_rate: 0
      }
    }

    if (timeframeData && timeframeData.length > 0) {
      // Status breakdown
      timeframeData.forEach(item => {
        analytics.status_breakdown[item.status] = (analytics.status_breakdown[item.status] || 0) + 1
        analytics.priority_breakdown[item.priority] = (analytics.priority_breakdown[item.priority] || 0) + 1
        
        if (item.business_domain) {
          analytics.business_domain_breakdown[item.business_domain] = 
            (analytics.business_domain_breakdown[item.business_domain] || 0) + 1
        }
        
        analytics.processing_plan_breakdown[item.processing_plan] = 
          (analytics.processing_plan_breakdown[item.processing_plan] || 0) + 1

        // Daily volume
        const date = new Date(item.queued_at).toISOString().split('T')[0]
        analytics.daily_volume[date] = (analytics.daily_volume[date] || 0) + 1

        // Cost analysis
        if (item.actual_cost_cents) {
          analytics.cost_analysis.total_cost_cents += item.actual_cost_cents
          analytics.cost_analysis.cost_by_plan[item.processing_plan] = 
            (analytics.cost_analysis.cost_by_plan[item.processing_plan] || 0) + item.actual_cost_cents
        }
      })

      // Processing time analysis
      const processingTimes = timeframeData
        .filter(item => item.actual_processing_time_seconds)
        .map(item => item.actual_processing_time_seconds)
        .sort((a, b) => a - b)

      if (processingTimes.length > 0) {
        analytics.avg_processing_time = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        analytics.performance_metrics.fastest_processing_time = processingTimes[0]
        analytics.performance_metrics.slowest_processing_time = processingTimes[processingTimes.length - 1]
        analytics.performance_metrics.median_processing_time = 
          processingTimes[Math.floor(processingTimes.length / 2)]
      }

      // Success rate
      const completedItems = analytics.status_breakdown['completed'] || 0
      analytics.success_rate = timeframeData.length > 0 ? (completedItems / timeframeData.length) * 100 : 0

      // Error and retry rates
      const failedItems = analytics.status_breakdown['failed'] || 0
      const retriedItems = timeframeData.filter(item => item.retry_count > 0).length
      
      analytics.performance_metrics.error_rate = timeframeData.length > 0 ? (failedItems / timeframeData.length) * 100 : 0
      analytics.performance_metrics.retry_rate = timeframeData.length > 0 ? (retriedItems / timeframeData.length) * 100 : 0

      // Average cost per item
      if (analytics.cost_analysis.total_cost_cents > 0) {
        analytics.cost_analysis.avg_cost_per_item_cents = 
          analytics.cost_analysis.total_cost_cents / timeframeData.length
      }
    }

    // Get recent activity (last 10 items)
    const { data: recentActivity, error: recentError } = await supabase
      .from('data_processor')
      .select(`
        id,
        status,
        processing_plan,
        priority,
        queued_at,
        started_at,
        completed_at,
        business_domain,
        endpoints!inner(name, url_path)
      `)
      .eq('user_id', user.id)
      .order('queued_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('Error fetching recent activity:', recentError)
    }

    // Get top endpoints by processing volume
    const { data: endpointStats, error: endpointError } = await supabase
      .from('data_processor')
      .select(`
        endpoint_id,
        endpoints!inner(name, url_path),
        count:id.count()
      `)
      .eq('user_id', user.id)
      .gte('queued_at', `now() - interval '${timefilter}'`)

    if (endpointError) {
      console.error('Error fetching endpoint stats:', endpointError)
    }

    return NextResponse.json({
      basic_stats: basicStats || {},
      analytics,
      recent_activity: recentActivity || [],
      top_endpoints: endpointStats || [],
      metadata: {
        generated_at: new Date().toISOString(),
        timeframe,
        business_domain_filter: business_domain
      }
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 