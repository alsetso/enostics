import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') as '1h' | '24h' | '7d' | '30d' || '24h'

    // Calculate time range
    const now = new Date()
    const timeRanges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    const startTime = timeRanges[timeframe]

    // Get user's endpoints with error handling
    const { data: endpoints, error: endpointsError } = await supabase
      .from('enostics_endpoints')
      .select('id, name, path, is_active, created_at')
      .eq('user_id', user.id)

    if (endpointsError) {
      console.error('Endpoints query error:', endpointsError)
      // Return empty data instead of error if table doesn't exist
      return NextResponse.json({
        overview: {
          totalRequests: 0,
          totalEndpoints: 0,
          averageResponseTime: 0,
          errorRate: 0,
          topEndpoint: 'N/A',
          dataProcessed: 0,
          timeframe,
          lastUpdated: new Date().toISOString()
        },
        endpointPerformance: [],
        recentActivity: []
      })
    }

    const activeEndpoints = endpoints?.filter(e => e.is_active) || []
    const endpointIds = activeEndpoints.map(e => e.id)

    // If no endpoints, return empty data
    if (endpointIds.length === 0) {
      return NextResponse.json({
        overview: {
          totalRequests: 0,
          totalEndpoints: 0,
          averageResponseTime: 0,
          errorRate: 0,
          topEndpoint: 'N/A',
          dataProcessed: 0,
          timeframe,
          lastUpdated: new Date().toISOString()
        },
        endpointPerformance: [],
        recentActivity: []
      })
    }

    // Get aggregated request statistics with error handling
    const { data: requestStats, error: statsError } = await supabase
      .from('enostics_request_logs')
      .select('status_code, response_time_ms, created_at, endpoint_id, error_message')
      .in('endpoint_id', endpointIds)
      .gte('created_at', startTime.toISOString())

    if (statsError) {
      console.error('Request logs query error:', statsError)
      // Return empty data for logs but still show endpoints
      return NextResponse.json({
        overview: {
          totalRequests: 0,
          totalEndpoints: activeEndpoints.length,
          averageResponseTime: 0,
          errorRate: 0,
          topEndpoint: 'N/A',
          dataProcessed: 0,
          timeframe,
          lastUpdated: new Date().toISOString()
        },
        endpointPerformance: activeEndpoints.map(endpoint => ({
          id: endpoint.id,
          name: endpoint.name,
          url_path: endpoint.path,
          totalRequests: 0,
          successRate: 0,
          avgResponseTime: 0,
          lastActivity: endpoint.created_at,
          status: 'idle' as const
        })),
        recentActivity: []
      })
    }

    const logs = requestStats || []
    
    // Calculate overview metrics
    const totalRequests = logs.length
    const successRequests = logs.filter(log => log.status_code >= 200 && log.status_code < 400).length
    const errorRequests = totalRequests - successRequests
    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0
    
    const responseTimes = logs.filter(log => log.response_time_ms).map(log => log.response_time_ms!)
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((acc, time) => acc + time, 0) / responseTimes.length 
      : 0

    // Calculate endpoint performance
    const endpointPerformance = activeEndpoints.map(endpoint => {
      const endpointLogs = logs.filter(log => log.endpoint_id === endpoint.id)
      const endpointSuccess = endpointLogs.filter(log => log.status_code >= 200 && log.status_code < 400).length
      const endpointTotal = endpointLogs.length
      const successRate = endpointTotal > 0 ? (endpointSuccess / endpointTotal) * 100 : 0
      
      const endpointResponseTimes = endpointLogs
        .filter(log => log.response_time_ms)
        .map(log => log.response_time_ms!)
      const avgResponseTime = endpointResponseTimes.length > 0
        ? endpointResponseTimes.reduce((acc, time) => acc + time, 0) / endpointResponseTimes.length
        : 0

      const lastRequest = endpointLogs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]

      return {
        id: endpoint.id,
        name: endpoint.name,
        url_path: endpoint.path,
        totalRequests: endpointTotal,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        lastActivity: lastRequest?.created_at || endpoint.created_at,
        status: endpointTotal === 0 ? 'idle' : successRate < 95 ? 'error' : 'active'
      }
    })

    // Get recent activity with simplified query (no join)
    const { data: recentActivity, error: activityError } = await supabase
      .from('enostics_request_logs')
      .select('id, method, status_code, response_time_ms, created_at, error_message, endpoint_id')
      .in('endpoint_id', endpointIds)
      .order('created_at', { ascending: false })
      .limit(20)

    // Format activity with endpoint names
    const formattedActivity = (recentActivity || []).map(log => {
      const endpoint = activeEndpoints.find(e => e.id === log.endpoint_id)
      return {
        id: log.id,
        method: log.method,
        status_code: log.status_code,
        response_time_ms: log.response_time_ms,
        created_at: log.created_at,
        error_message: log.error_message,
        endpoint_name: endpoint?.name || 'Unknown',
        endpoint_path: endpoint?.path || 'unknown'
      }
    })

    // Find top endpoint by requests
    const endpointRequestCounts = activeEndpoints.map(endpoint => ({
      name: endpoint.name,
      count: logs.filter(log => log.endpoint_id === endpoint.id).length
    }))
    const topEndpoint = endpointRequestCounts.sort((a, b) => b.count - a.count)[0]

    // Calculate data processed (approximate)
    const dataProcessed = logs.length * 1024 // Rough estimate of 1KB per request

    const overview = {
      totalRequests,
      totalEndpoints: activeEndpoints.length,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      topEndpoint: topEndpoint?.name || 'N/A',
      dataProcessed,
      timeframe,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      overview,
      endpointPerformance,
      recentActivity: formattedActivity
    })

  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 