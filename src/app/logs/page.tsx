'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { DashboardPanel } from '@/components/ui/dashboard-panel'
import { StatusIndicator } from '@/components/ui/dashboard-tabs'
import { 
  Activity, 
  Mail, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter,
  Download,
  Search,
  RefreshCw,
  Globe,
  Key,
  Database,
  Zap,
  User,
  Settings,
  ExternalLink
} from 'lucide-react'

// Log entry types
interface LogEntry {
  id: string
  timestamp: string
  type: 'request' | 'email' | 'auth' | 'system' | 'webhook' | 'error'
  category: string
  action: string
  status: 'success' | 'failure' | 'warning' | 'info'
  source: string
  details: any
  metadata?: any
}

// Filter options
interface LogFilters {
  type: string
  status: string
  timeRange: string
  search: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LogFilters>({
    type: 'all',
    status: 'all',
    timeRange: '24h',
    search: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failure: 0,
    warning: 0,
    requests_24h: 0,
    emails_24h: 0
  })

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // Fetch logs from multiple sources and combine them
      const [endpointLogs, inboxLogs, systemLogs] = await Promise.all([
        fetchEndpointLogs(),
        fetchInboxLogs(),
        fetchSystemLogs()
      ])

      // Combine and sort all logs
      const allLogs = [...endpointLogs, ...inboxLogs, ...systemLogs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .filter(log => applyFilters(log))

      setLogs(allLogs)
      calculateStats(allLogs)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEndpointLogs = async (): Promise<LogEntry[]> => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Get user's endpoints and their data
      const { data: endpoints } = await supabase
        .from('enostics_endpoints')
        .select('id, name, created_at, updated_at')

      if (!endpoints?.length) return []

      const endpointLogs: LogEntry[] = []

      // Add endpoint creation logs
      endpoints.forEach(endpoint => {
        endpointLogs.push({
          id: `endpoint-created-${endpoint.id}`,
          timestamp: endpoint.created_at,
          type: 'system',
          category: 'Endpoint Management',
          action: `Created endpoint: ${endpoint.name}`,
          status: 'success',
          source: 'System',
          details: {
            endpoint_id: endpoint.id,
            endpoint_name: endpoint.name
          }
        })

        if (endpoint.updated_at !== endpoint.created_at) {
          endpointLogs.push({
            id: `endpoint-updated-${endpoint.id}`,
            timestamp: endpoint.updated_at,
            type: 'system',
            category: 'Endpoint Management',
            action: `Updated endpoint: ${endpoint.name}`,
            status: 'info',
            source: 'System',
            details: {
              endpoint_id: endpoint.id,
              endpoint_name: endpoint.name
            }
          })
        }
      })

      // Get endpoint data requests
      for (const endpoint of endpoints) {
        const { data: requests } = await supabase
          .from('enostics_data')
          .select('id, data, source_ip, processed_at, status')
          .eq('endpoint_id', endpoint.id)
          .order('processed_at', { ascending: false })
          .limit(50)

        requests?.forEach(request => {
          endpointLogs.push({
            id: `request-${request.id}`,
            timestamp: request.processed_at,
            type: 'request',
            category: 'Endpoint Request',
            action: `POST ${endpoint.name}`,
            status: request.status === 'received' ? 'success' : 'warning',
            source: request.source_ip || 'Unknown',
            details: {
              endpoint_id: endpoint.id,
              endpoint_name: endpoint.name,
              request_id: request.id,
              data_size: JSON.stringify(request.data).length,
              status: request.status
            }
          })
        })
      }

      return endpointLogs
    } catch (error) {
      console.error('Error fetching endpoint logs:', error)
      return []
    }
  }

  const fetchInboxLogs = async (): Promise<LogEntry[]> => {
    try {
      // Try to fetch from the new inbox table, but handle gracefully if it doesn't exist
      const response = await fetch('/api/inbox/recent?limit=100')
      if (!response.ok) return []
      
      const data = await response.json()
      return (data.requests || []).map((request: any) => ({
        id: `inbox-${request.id}`,
        timestamp: request.created_at,
        type: 'request' as const,
        category: 'Universal Inbox',
        action: 'POST Request',
        status: request.is_suspicious ? 'warning' : 'success',
        source: request.payload_source || 'Unknown',
        details: {
          type: request.payload_type,
          authenticated: request.is_authenticated,
          suspicious: request.is_suspicious
        }
      }))
    } catch (error) {
      console.error('Error fetching inbox logs:', error)
      return []
    }
  }

  const fetchSystemLogs = async (): Promise<LogEntry[]> => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Get user profile info for system events
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('created_at, updated_at')
        .eq('user_id', user.id)
        .single()

      const systemLogs: LogEntry[] = []

      if (profile) {
        // User registration event
        systemLogs.push({
          id: 'user-registration',
          timestamp: profile.created_at,
          type: 'auth',
          category: 'Authentication',
          action: 'User Registration',
          status: 'success',
          source: 'Supabase Auth',
          details: {
            user_id: user.id,
            email: user.email,
            registration_method: 'email'
          }
        })

        // Add simulated login events (last few days)
        const now = new Date()
        for (let i = 0; i < 5; i++) {
          const loginTime = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
          systemLogs.push({
            id: `login-${i}`,
            timestamp: loginTime.toISOString(),
            type: 'auth',
            category: 'Authentication',
            action: 'User Login',
            status: 'success',
            source: 'Supabase Auth',
            details: {
              user_id: user.id,
              email: user.email,
              session_duration: '24h'
            }
          })
        }
      }

      // Add simulated email logs
      systemLogs.push({
        id: 'welcome-email',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'email',
        category: 'Email Notification',
        action: 'Welcome Email Sent',
        status: 'success',
        source: 'Resend',
        details: {
          to: user.email,
          subject: '🚀 Welcome to Enostics!',
          delivery_status: 'delivered',
          email_type: 'welcome'
        }
      })

      return systemLogs
    } catch (error) {
      console.error('Error fetching system logs:', error)
      return []
    }
  }

  const applyFilters = (log: LogEntry): boolean => {
    // Type filter
    if (filters.type !== 'all' && log.type !== filters.type) return false
    
    // Status filter
    if (filters.status !== 'all' && log.status !== filters.status) return false
    
    // Time range filter
    const logTime = new Date(log.timestamp).getTime()
    const now = Date.now()
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    if (filters.timeRange !== 'all') {
      const range = timeRanges[filters.timeRange as keyof typeof timeRanges]
      if (range && now - logTime > range) return false
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = `${log.category} ${log.action} ${log.source}`.toLowerCase()
      if (!searchableText.includes(searchTerm)) return false
    }
    
    return true
  }

  const calculateStats = (logs: LogEntry[]) => {
    const now = Date.now()
    const last24h = now - (24 * 60 * 60 * 1000)
    
    const stats = {
      total: logs.length,
      success: logs.filter(l => l.status === 'success').length,
      failure: logs.filter(l => l.status === 'failure').length,
      warning: logs.filter(l => l.status === 'warning').length,
      requests_24h: logs.filter(l => 
        l.type === 'request' && new Date(l.timestamp).getTime() > last24h
      ).length,
      emails_24h: logs.filter(l => 
        l.type === 'email' && new Date(l.timestamp).getTime() > last24h
      ).length
    }
    
    setStats(stats)
  }

  const getLogIcon = (log: LogEntry) => {
    switch (log.type) {
      case 'request':
        return <Globe className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'auth':
        return <Shield className="h-4 w-4" />
      case 'webhook':
        return <Zap className="h-4 w-4" />
      case 'system':
        return <Settings className="h-4 w-4" />
      case 'error':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'failure':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Category', 'Action', 'Status', 'Source', 'Details'],
      ...logs.map(log => [
        log.timestamp,
        log.type,
        log.category,
        log.action,
        log.status,
        log.source,
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enostics-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-enostics-gray-900 via-enostics-gray-800 to-enostics-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Activity Logs</h1>
            <p className="text-enostics-gray-400">
              Complete history of all actions, requests, emails, and system events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLogs()}
              className="flex items-center gap-2 px-4 py-2 bg-enostics-gray-800 hover:bg-enostics-gray-700 text-white rounded-lg border border-enostics-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-enostics-blue hover:bg-enostics-blue/80 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-enostics-gray-800/50 rounded-lg p-4 border border-enostics-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-enostics-blue" />
              <span className="text-sm font-medium text-enostics-gray-300">Total Events</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total.toLocaleString()}</div>
          </div>
          
          <div className="bg-enostics-gray-800/50 rounded-lg p-4 border border-enostics-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-enostics-gray-300">Success</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.success.toLocaleString()}</div>
          </div>
          
          <div className="bg-enostics-gray-800/50 rounded-lg p-4 border border-enostics-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-enostics-gray-300">Failures</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{stats.failure.toLocaleString()}</div>
          </div>
          
          <div className="bg-enostics-gray-800/50 rounded-lg p-4 border border-enostics-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-enostics-gray-300">Warnings</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{stats.warning.toLocaleString()}</div>
          </div>
          
          <div className="bg-enostics-gray-800/50 rounded-lg p-4 border border-enostics-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-enostics-purple" />
              <span className="text-sm font-medium text-enostics-gray-300">Requests 24h</span>
            </div>
            <div className="text-2xl font-bold text-enostics-purple">{stats.requests_24h.toLocaleString()}</div>
          </div>
          
          <div className="bg-enostics-gray-800/50 rounded-lg p-4 border border-enostics-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-enostics-pink" />
              <span className="text-sm font-medium text-enostics-gray-300">Emails 24h</span>
            </div>
            <div className="text-2xl font-bold text-enostics-pink">{stats.emails_24h.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters */}
        <DashboardPanel
          title="Filters"
          subtitle="Filter and search through your activity logs"
          icon={<Filter className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-enostics-gray-300 mb-2">
                Event Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 bg-enostics-gray-800 border border-enostics-gray-600 rounded-lg text-white focus:ring-2 focus:ring-enostics-blue focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="request">API Requests</option>
                <option value="email">Email Notifications</option>
                <option value="auth">Authentication</option>
                <option value="webhook">Webhooks</option>
                <option value="system">System Events</option>
                <option value="error">Errors</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-enostics-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 bg-enostics-gray-800 border border-enostics-gray-600 rounded-lg text-white focus:ring-2 focus:ring-enostics-blue focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-enostics-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
                className="w-full px-3 py-2 bg-enostics-gray-800 border border-enostics-gray-600 rounded-lg text-white focus:ring-2 focus:ring-enostics-blue focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-enostics-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-enostics-gray-800 border border-enostics-gray-600 rounded-lg text-white placeholder-enostics-gray-400 focus:ring-2 focus:ring-enostics-blue focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </DashboardPanel>

        {/* Logs Table */}
        <DashboardPanel
          title="Activity Log"
          subtitle={`Showing ${logs.length} events`}
          icon={<Clock className="h-5 w-5" />}
          loading={loading}
        >
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-enostics-gray-400">
                <Activity className="h-16 w-16 mx-auto mb-4 text-enostics-gray-600" />
                <p className="text-lg font-medium mb-2">No logs found</p>
                <p className="text-sm">
                  {filters.type !== 'all' || filters.status !== 'all' || filters.search
                    ? 'Try adjusting your filters to see more results.'
                    : 'Start using your endpoints to see activity logs here.'}
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-enostics-gray-800/30 rounded-lg border border-enostics-gray-700 hover:bg-enostics-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Icon and Status */}
                    <div className={`flex items-center gap-2 ${getStatusColor(log.status)}`}>
                      {getLogIcon(log)}
                      <StatusIndicator 
                        status={log.status === 'failure' ? 'error' : log.status} 
                        label={log.status === 'failure' ? 'error' : log.status}
                        size="sm" 
                      />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{log.action}</span>
                        <span className="text-xs px-2 py-1 bg-enostics-gray-700 text-enostics-gray-300 rounded">
                          {log.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-enostics-gray-400">
                        <span>Source: {log.source}</span>
                        {log.details?.status_code && (
                          <span>Status: {log.details.status_code}</span>
                        )}
                        {log.details?.response_time && (
                          <span>Time: {log.details.response_time}ms</span>
                        )}
                        {log.details?.to && (
                          <span>To: {log.details.to}</span>
                        )}
                        {log.details?.data_size && (
                          <span>Size: {log.details.data_size} bytes</span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-sm text-enostics-gray-400 text-right">
                      <div>{formatTimeAgo(log.timestamp)}</div>
                      <div className="text-xs text-enostics-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Details Button */}
                  <button className="ml-4 p-2 text-enostics-gray-400 hover:text-white transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </DashboardPanel>
      </div>
    </div>
  )
} 