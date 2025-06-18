'use client'

import { useState, useEffect } from 'react'
import { DashboardPanel, DataPanel } from '@/components/ui/dashboard-panel'
import { HealthBadge, useEndpointHealth } from '@/components/ui/health-badge'
import { StatusIndicator } from '@/components/ui/dashboard-tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Activity, Clock, AlertTriangle, CheckCircle, XCircle, Globe } from 'lucide-react'
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <DashboardPanel
        title={`Analytics - ${endpointName}`}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{analytics.totalRequests.toLocaleString()}</div>
            <div className="text-sm text-enostics-gray-400">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">{analytics.successRequests.toLocaleString()}</div>
            <div className="text-sm text-enostics-gray-400">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-1">{analytics.errorRequests.toLocaleString()}</div>
            <div className="text-sm text-enostics-gray-400">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">{analytics.averageResponseTime}ms</div>
            <div className="text-sm text-enostics-gray-400">Avg Response</div>
          </div>
        </div>

        {analytics.topErrors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Top Errors</h3>
            <div className="space-y-3">
              {analytics.topErrors.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-enostics-gray-900/50 rounded-lg border border-red-500/20">
                  <span className="text-red-400 text-sm font-mono truncate flex-1 mr-4">{error.error}</span>
                  <Badge variant="destructive">{error.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardPanel>

      {/* Real-time Request Logs */}
      <DataPanel
        title="Recent Requests"
        subtitle={`Live request stream (${logs.length} shown)`}
        icon={<Clock className="h-5 w-5" />}
        data={logs}
        emptyMessage="No requests yet. Send some data to see real-time logs!"
        emptyIcon={<Globe className="h-16 w-16 text-enostics-gray-600" />}
        lastUpdated={lastUpdated}
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-4 bg-enostics-gray-900/50 rounded-lg border border-enostics-gray-800 hover:border-enostics-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(log.status_code)}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {log.method}
                    </Badge>
                    <StatusIndicator
                      status={log.status_code >= 200 && log.status_code < 300 ? 'success' : 
                             log.status_code >= 400 && log.status_code < 500 ? 'warning' : 'error'}
                      label={log.status_code.toString()}
                      size="sm"
                      showIcon={false}
                    />
                    {log.webhook_sent && (
                      <Badge 
                        variant={log.webhook_status && log.webhook_status < 400 ? 'success' : 'destructive'}
                        className="text-xs"
                      >
                        Webhook
                      </Badge>
                    )}
                  </div>
                  {log.error_message && (
                    <div className="text-sm text-red-400 font-mono">{log.error_message}</div>
                  )}
                </div>
              </div>
              
              <div className="text-right text-sm text-enostics-gray-400 space-y-1">
                <div className="font-medium">{formatTime(log.created_at)}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span>{formatDuration(log.response_time_ms)}</span>
                  {log.source_ip && (
                    <span className="font-mono opacity-75">{log.source_ip}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataPanel>
    </div>
  )
} 