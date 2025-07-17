'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Zap, 
  Clock, 
  Users, 
  Database, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronRight,
  MoreVertical
} from 'lucide-react'

interface OverviewMetrics {
  totalRequests: number
  totalEndpoints: number
  averageResponseTime: number
  errorRate: number
  topEndpoint: string
  dataProcessed: number
  timeframe: string
  lastUpdated: string
}

interface EndpointAnalytics {
  id: string
  name: string
  url_path: string
  totalRequests: number
  successRate: number
  avgResponseTime: number
  lastActivity: string
  status: 'active' | 'idle' | 'error'
}

interface RecentActivity {
  id: string
  method: string
  status_code: number
  response_time_ms: number | null
  created_at: string
  error_message: string | null
  endpoint_name: string
  endpoint_path: string
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null)
  const [endpointPerformance, setEndpointPerformance] = useState<EndpointAnalytics[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/analytics/overview?timeframe=${timeframe}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }
      
      setMetrics(data.overview)
      setEndpointPerformance(data.endpointPerformance || [])
      setRecentActivity(data.recentActivity || [])
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeframe])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)}GB`
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)}MB`
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${bytes}B`
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (statusCode >= 400) return <AlertTriangle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-yellow-500" />
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-500'
    if (statusCode >= 400) return 'text-red-500'
    return 'text-yellow-500'
  }

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      POST: 'bg-green-500/10 text-green-400 border-green-500/20',
      PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
      PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
    return colors[method as keyof typeof colors] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }

  const getEndpointStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
      case 'error':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Issues</Badge>
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Idle</Badge>
    }
  }

  if (loading && !metrics) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-800 p-6 space-y-3 animate-pulse">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
        <div className="border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Analytics Error</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No Analytics Data</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Start using your endpoints to see analytics here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with timeframe selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated {formatTime(metrics.lastUpdated)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['1h', '24h', '7d', '30d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeframe === period
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="border-gray-200 dark:border-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        <div className="border border-gray-200 dark:border-gray-800 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(metrics.totalRequests)}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active Endpoints</span>
            <Globe className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.totalEndpoints}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response</span>
            <Zap className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.averageResponseTime}ms
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.errorRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Endpoint Performance */}
      <div className="border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Endpoint Performance</h2>
        </div>
        <div className="p-6">
          {endpointPerformance.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No active endpoints found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {endpointPerformance.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{endpoint.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">/{endpoint.url_path}</p>
                      </div>
                      {getEndpointStatusBadge(endpoint.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-900 dark:text-white">{formatNumber(endpoint.totalRequests)}</div>
                      <div className="text-gray-600 dark:text-gray-400">requests</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900 dark:text-white">{endpoint.successRate.toFixed(1)}%</div>
                      <div className="text-gray-600 dark:text-gray-400">success</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900 dark:text-white">{endpoint.avgResponseTime}ms</div>
                      <div className="text-gray-600 dark:text-gray-400">response</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900 dark:text-white">{formatTime(endpoint.lastActivity)}</div>
                      <div className="text-gray-600 dark:text-gray-400">last activity</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg"
                >
                  <div className={`px-2 py-1 rounded text-xs font-mono border ${getMethodColor(activity.method)}`}>
                    {activity.method}
                  </div>
                  
                  <div className="flex items-center gap-2 min-w-20">
                    {getStatusIcon(activity.status_code)}
                    <span className={`text-sm font-medium ${getStatusColor(activity.status_code)}`}>
                      {activity.status_code}
                    </span>
                  </div>

                  <div className="min-w-20">
                    <span className="text-sm text-blue-500 font-medium">
                      {formatDuration(activity.response_time_ms)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.endpoint_name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      /{activity.endpoint_path}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatTime(activity.created_at)}
                    </span>
                  </div>

                  {activity.error_message && (
                    <div className="max-w-xs">
                      <span className="text-xs text-red-500 truncate block">
                        {activity.error_message}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 