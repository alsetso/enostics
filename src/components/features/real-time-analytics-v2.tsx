'use client'

import { useState, useEffect } from 'react'
import { DashboardPanel, DataPanel } from '@/components/ui/dashboard-panel'
import { HealthBadge, useEndpointHealth } from '@/components/ui/health-badge'
import { StatusIndicator } from '@/components/ui/dashboard-tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Activity, Clock, AlertTriangle, CheckCircle, XCircle, Globe, Eye, ExternalLink } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface RequestLog {
  id: string
  method: string
  status_code: number
  response_time_ms: number | null
  source_ip: string | null
  created_at: string
  error_message: string | null
  webhook_sent: boolean
  webhook_status: number | null
}

interface Analytics {
  totalRequests: number
  successRequests: number
  errorRequests: number
  averageResponseTime: number
  topErrors: Array<{ error: string; count: number }>
}

interface RealTimeAnalyticsV2Props {
  endpointId: string
  endpointName: string
}

export function RealTimeAnalyticsV2({ endpointId, endpointName }: RealTimeAnalyticsV2Props) {
  const [logs, setLogs] = useState<RequestLog[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRequests: 0,
    successRequests: 0,
    errorRequests: 0,
    averageResponseTime: 0,
    topErrors: []
  })
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h')
  const [loading, setLoading] = useState(true)
  const [isRealTime, setIsRealTime] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const health = useEndpointHealth(analytics)

  useEffect(() => {
    fetchLogs()
    fetchAnalytics()
    
    // Set up real-time subscription
    const supabase = createClientSupabaseClient()
    const subscription = supabase
      .channel(`request_logs_${endpointId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'enostics_request_logs',
        filter: `endpoint_id=eq.${endpointId}`
      }, (payload) => {
        const newLog = payload.new as RequestLog
        setLogs(prev => [newLog, ...prev.slice(0, 49)])
        setIsRealTime(true)
        setLastUpdated(new Date())
        setTimeout(() => setIsRealTime(false), 2000)
        
        // Update analytics
        fetchAnalytics()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [endpointId, timeframe])

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/analytics/logs?endpoint_id=${endpointId}&limit=50`)
      const result = await response.json()
      
      if (response.ok) {
        setLogs(result.logs || [])
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/stats?endpoint_id=${endpointId}&timeframe=${timeframe}`)
      const result = await response.json()
      
      if (response.ok) {
        setAnalytics(result.analytics || analytics)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return <CheckCircle className="h-4 w-4 text-green-400" />
    if (statusCode >= 400 && statusCode < 500) return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    return <XCircle className="h-4 w-4 text-red-400" />
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-400'
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      'GET': 'text-blue-400 bg-blue-400/10',
      'POST': 'text-green-400 bg-green-400/10',
      'PUT': 'text-orange-400 bg-orange-400/10',
      'DELETE': 'text-red-400 bg-red-400/10',
      'PATCH': 'text-purple-400 bg-purple-400/10'
    }
    return colors[method] || 'text-gray-400 bg-gray-400/10'
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <DashboardPanel
        title={`${endpointName} Analytics`}
        subtitle="Real-time performance metrics and request monitoring"
        icon={<BarChart3 className="h-5 w-5" />}
        badge={
          isRealTime ? {
            text: "Live",
            variant: "success"
          } : undefined
        }
        action={
          <div className="flex items-center gap-3">
            <HealthBadge 
              successRate={health.successRate} 
              totalRequests={health.totalRequests}
            />
            <div className="flex gap-2">
              {(['1h', '24h', '7d'] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        }
        lastUpdated={lastUpdated}
        loading={loading}
      >
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{analytics.totalRequests.toLocaleString()}</div>
              <div className="text-sm text-enostics-gray-400">Total Requests</div>
            </CardContent>
          </Card>
          
          <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{analytics.successRequests.toLocaleString()}</div>
              <div className="text-sm text-enostics-gray-400">Successful</div>
            </CardContent>
          </Card>
          
          <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">{analytics.errorRequests.toLocaleString()}</div>
              <div className="text-sm text-enostics-gray-400">Errors</div>
            </CardContent>
          </Card>
          
          <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{analytics.averageResponseTime}ms</div>
              <div className="text-sm text-enostics-gray-400">Avg Response</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Errors */}
        {analytics.topErrors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Top Errors</h3>
            <div className="space-y-2">
              {analytics.topErrors.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-enostics-gray-900/50 rounded-lg border border-red-500/20">
                  <span className="text-red-400 text-sm font-mono truncate flex-1 mr-4">{error.error}</span>
                  <Badge variant="destructive" className="text-xs">{error.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardPanel>

      {/* Real-time Request Logs */}
      <DashboardPanel
        title="Recent Requests"
        subtitle={`${logs.length} most recent API requests`}
        icon={<Activity className="h-5 w-5" />}
        badge={{
          text: isRealTime ? "Live" : "Updated " + formatRelativeTime(lastUpdated.toISOString()),
          variant: isRealTime ? "success" : "outline"
        }}
        loading={loading}
      >
        {logs.length === 0 ? (
          <div className="text-center py-12 text-enostics-gray-400">
            <Activity className="h-16 w-16 mx-auto mb-4 text-enostics-gray-600" />
            <h3 className="text-lg font-medium mb-2">No Requests Yet</h3>
            <p className="text-sm">Requests will appear here once your endpoint receives traffic.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="group flex items-center gap-4 p-3 rounded-lg border border-enostics-gray-800 bg-enostics-gray-950/50 hover:bg-enostics-gray-900/50 transition-all duration-200"
              >
                {/* Method Badge */}
                <div className={`px-2 py-1 rounded text-xs font-mono ${getMethodColor(log.method)}`}>
                  {log.method}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 min-w-20">
                  {getStatusIcon(log.status_code)}
                  <span className={`text-sm font-medium ${getStatusColor(log.status_code)}`}>
                    {log.status_code}
                  </span>
                </div>

                {/* Response Time */}
                <div className="min-w-20">
                  <span className="text-sm text-blue-400 font-medium">
                    {formatDuration(log.response_time_ms)}
                  </span>
                </div>

                {/* Source IP */}
                <div className="min-w-32 flex-1">
                  <span className="text-sm text-enostics-gray-300">
                    {log.source_ip || 'Unknown IP'}
                  </span>
                </div>

                {/* Webhook Status */}
                <div className="min-w-20">
                  {log.webhook_sent ? (
                    <Badge 
                      variant={log.webhook_status === 200 ? "success" : "destructive"} 
                      className="text-xs"
                    >
                      Webhook {log.webhook_status}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-enostics-gray-400">
                      No Webhook
                    </Badge>
                  )}
                </div>

                {/* Timestamp */}
                <div className="min-w-20 text-right">
                  <span className="text-xs text-enostics-gray-400">
                    {formatTime(log.created_at)}
                  </span>
                </div>

                {/* Error Message */}
                {log.error_message && (
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-red-400 truncate block">
                      {log.error_message}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    title="View Details"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </div>
  )
} 