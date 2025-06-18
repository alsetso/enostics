import { createServerSupabaseClient } from '@/lib/supabase'

interface RequestLogData {
  endpoint_id: string
  api_key_id?: string
  method: string
  status_code: number
  response_time_ms?: number
  source_ip?: string
  user_agent?: string
  content_length?: number
  error_message?: string
}

/**
 * Log a request to the analytics system
 */
export async function logRequest(data: RequestLogData): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: logEntry, error } = await supabase
      .from('enostics_request_logs')
      .insert({
        endpoint_id: data.endpoint_id,
        api_key_id: data.api_key_id,
        method: data.method,
        status_code: data.status_code,
        response_time_ms: data.response_time_ms,
        source_ip: data.source_ip,
        user_agent: data.user_agent,
        content_length: data.content_length,
        error_message: data.error_message,
        webhook_sent: false
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error logging request:', error)
      return null
    }
    
    return logEntry.id
  } catch (error) {
    console.error('Error in logRequest:', error)
    return null
  }
}

/**
 * Get request analytics for an endpoint
 */
export async function getEndpointAnalytics(
  endpointId: string,
  timeframe: '1h' | '24h' | '7d' | '30d' = '24h'
): Promise<{
  totalRequests: number
  successRequests: number
  errorRequests: number
  averageResponseTime: number
  requestsOverTime: Array<{ timestamp: string; count: number; errors: number }>
  topErrors: Array<{ error: string; count: number }>
}> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Calculate time range
    const now = new Date()
    const timeRanges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    const startTime = timeRanges[timeframe]
    
    // Get basic stats
    const { data: stats } = await supabase
      .from('enostics_request_logs')
      .select('status_code, response_time_ms, error_message')
      .eq('endpoint_id', endpointId)
      .gte('created_at', startTime.toISOString())
    
    if (!stats) {
      return {
        totalRequests: 0,
        successRequests: 0,
        errorRequests: 0,
        averageResponseTime: 0,
        requestsOverTime: [],
        topErrors: []
      }
    }
    
    const totalRequests = stats.length
    const successRequests = stats.filter(s => s.status_code >= 200 && s.status_code < 400).length
    const errorRequests = totalRequests - successRequests
    const averageResponseTime = stats.reduce((acc, s) => acc + (s.response_time_ms || 0), 0) / totalRequests || 0
    
    // Get requests over time (hourly buckets)
    const { data: timeData } = await supabase.rpc('get_requests_over_time', {
      p_endpoint_id: endpointId,
      p_start_time: startTime.toISOString(),
      p_bucket_size: timeframe === '1h' ? '5 minutes' : timeframe === '24h' ? '1 hour' : '1 day'
    }).then(result => ({ data: [] })) // Fallback if RPC doesn't exist yet
    
    // Get top errors
    const errorMap = new Map<string, number>()
    stats.forEach(s => {
      if (s.error_message) {
        errorMap.set(s.error_message, (errorMap.get(s.error_message) || 0) + 1)
      }
    })
    
    const topErrors = Array.from(errorMap.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    return {
      totalRequests,
      successRequests,
      errorRequests,
      averageResponseTime: Math.round(averageResponseTime),
      requestsOverTime: timeData || [],
      topErrors
    }
  } catch (error) {
    console.error('Error getting endpoint analytics:', error)
    return {
      totalRequests: 0,
      successRequests: 0,
      errorRequests: 0,
      averageResponseTime: 0,
      requestsOverTime: [],
      topErrors: []
    }
  }
}

/**
 * Get recent request logs for an endpoint
 */
export async function getRecentRequestLogs(
  endpointId: string,
  limit: number = 50
): Promise<Array<{
  id: string
  method: string
  status_code: number
  response_time_ms: number | null
  source_ip: string | null
  created_at: string
  error_message: string | null
  webhook_sent: boolean
  webhook_status: number | null
}>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: logs, error } = await supabase
      .from('enostics_request_logs')
      .select('id, method, status_code, response_time_ms, source_ip, created_at, error_message, webhook_sent, webhook_status')
      .eq('endpoint_id', endpointId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching request logs:', error)
      return []
    }
    
    return logs || []
  } catch (error) {
    console.error('Error in getRecentRequestLogs:', error)
    return []
  }
}

/**
 * Clean up old request logs (for maintenance)
 */
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    const { error } = await supabase
      .from('enostics_request_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
    
    if (error) {
      console.error('Error cleaning up old logs:', error)
    }
  } catch (error) {
    console.error('Error in cleanupOldLogs:', error)
  }
} 