'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Pause, 
  Play, 
  RefreshCw,
  TrendingUp,
  Zap,
  DollarSign,
  Activity,
  Database,
  Settings,
  Plus,
  Eye,
  MoreVertical,
  ArrowRight,
  Sparkles,
  Shield,
  Timer,
  Target
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface QueueItem {
  id: string
  source_data_id: string
  processing_plan: string
  priority: number
  status: string
  business_domain: string | null
  ai_models_enabled: string[]
  queued_at: string
  started_at: string | null
  completed_at: string | null
  actual_processing_time_seconds: number | null
  actual_cost_cents: number | null
  processing_results: any
  endpoints: {
    name: string
    url_path: string
  }
  data: {
    data: any
    processed_at: string | null
    business_context: string | null
  }
}

interface ProcessorStats {
  total_items: number
  pending: number
  processing: number
  completed: number
  failed: number
  paused: number
  cancelled: number
  avg_processing_time_seconds?: number
  total_cost_cents?: number
  high_priority_pending: number
  business_domains?: string[]
}

interface DataProcessorPanelProps {
  className?: string
}

export default function DataProcessorPanel({ className }: DataProcessorPanelProps) {
  const [stats, setStats] = useState<ProcessorStats | null>(null)
  const [recentItems, setRecentItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProcessorData = async () => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Fetch queue items and stats
      const [queueResponse, statsResponse] = await Promise.all([
        fetch('/api/data-processor/queue?limit=10'),
        fetch('/api/data-processor/stats?timeframe=7d')
      ])

      if (queueResponse.ok) {
        const queueData = await queueResponse.json()
        setRecentItems(queueData.items || [])
        setStats(queueData.stats || {})
      } else if (queueResponse.status === 401) {
        // Handle unauthenticated state with mock data for demo
        console.log('Using mock data for unauthenticated state')
        setRecentItems([
          {
            id: 'mock_1',
            source_data_id: 'data_123',
            processing_plan: 'auto_advanced',
            priority: 2,
            status: 'processing',
            business_domain: 'healthcare',
            ai_models_enabled: ['classification', 'quality_assessment'],
            queued_at: new Date().toISOString(),
            started_at: new Date(Date.now() - 300000).toISOString(),
            completed_at: null,
            actual_processing_time_seconds: null,
            actual_cost_cents: null,
            processing_results: null,
            endpoints: { name: 'Health Data Endpoint', url_path: 'bremercole' },
            data: { 
              data: { steps: 8432, heartRate: 78 }, 
              processed_at: new Date().toISOString(),
              business_context: 'healthcare'
            }
          },
          {
            id: 'mock_2',
            source_data_id: 'data_456',
            processing_plan: 'auto_basic',
            priority: 5,
            status: 'pending',
            business_domain: 'finance',
            ai_models_enabled: ['classification'],
            queued_at: new Date(Date.now() - 600000).toISOString(),
            started_at: null,
            completed_at: null,
            actual_processing_time_seconds: null,
            actual_cost_cents: null,
            processing_results: null,
            endpoints: { name: 'Financial Data Endpoint', url_path: 'bremercole' },
            data: { 
              data: { amount: 1299.00, currency: 'USD' }, 
              processed_at: new Date().toISOString(),
              business_context: 'finance'
            }
          }
        ])
        setStats({
          total_items: 15,
          pending: 3,
          processing: 2,
          completed: 8,
          failed: 1,
          paused: 1,
          cancelled: 0,
          avg_processing_time_seconds: 45.2,
          total_cost_cents: 127,
          high_priority_pending: 1,
          business_domains: ['healthcare', 'finance', 'iot']
        })
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.basic_stats) {
          setStats(prev => ({ ...prev, ...statsData.basic_stats }))
        }
      }
    } catch (error) {
      console.error('Error fetching processor data:', error)
             // Fallback to mock data
       setRecentItems([])
       setStats({
         total_items: 0,
         pending: 0,
         processing: 0,
         completed: 0,
         failed: 0,
         paused: 0,
         cancelled: 0,
         high_priority_pending: 0
       })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProcessorData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchProcessorData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-blue-400'
      case 'failed': return 'text-red-400'
      case 'paused': return 'text-yellow-400'
      case 'pending': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'processing': return <RefreshCw className="h-3 w-3 animate-spin" />
      case 'failed': return <AlertCircle className="h-3 w-3" />
      case 'paused': return <Pause className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-red-400'
    if (priority <= 4) return 'text-yellow-400'
    if (priority <= 7) return 'text-blue-400'
    return 'text-gray-400'
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'auto_advanced': return 'bg-purple-500/20 text-purple-400'
      case 'auto_basic': return 'bg-blue-500/20 text-blue-400'
      case 'enterprise': return 'bg-orange-500/20 text-orange-400'
      case 'custom': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatCost = (cents: number | null | undefined) => {
    if (!cents) return '$0.00'
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatTime = (seconds: number | null | undefined) => {
    if (!seconds) return 'N/A'
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
    return `${(seconds / 3600).toFixed(1)}h`
  }

  const calculateProgress = () => {
    if (!stats) return 0
    const total = stats.total_items
    if (total === 0) return 0
    return ((stats.completed + stats.failed) / total) * 100
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-purple-400 animate-pulse" />
          <span className="text-lg font-semibold text-[hsl(var(--text-primary))]">Loading Intelligence...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} variant="glass" className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-[hsl(var(--hover-bg))] rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <span className="text-lg font-semibold text-[hsl(var(--text-primary))]">Data Processor</span>
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{stats?.total_items || 0}</div>
                <div className="text-xs text-[hsl(var(--text-muted))]">Total Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{stats?.pending || 0}</div>
                <div className="text-xs text-[hsl(var(--text-muted))]">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{stats?.completed || 0}</div>
                <div className="text-xs text-[hsl(var(--text-muted))]">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{formatCost(stats?.total_cost_cents)}</div>
                <div className="text-xs text-[hsl(var(--text-muted))]">Total Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats && stats.total_items > 0 && (
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[hsl(var(--text-primary))]">Processing Progress</span>
              <span className="text-sm text-[hsl(var(--text-muted))]">{calculateProgress().toFixed(1)}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-[hsl(var(--text-muted))] mt-2">
              <span>{stats.processing || 0} processing</span>
              <span>{stats.high_priority_pending || 0} high priority</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Queue Items */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Recent Processing Queue</span>
            <Button variant="ghost" size="sm" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentItems.length === 0 ? (
            <div className="p-4 text-center text-[hsl(var(--text-muted))]">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No items in processing queue</p>
              <p className="text-xs">Data will appear here when added to processor</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[hsl(var(--hover-bg))] transition-colors">
                  <div className={`flex items-center gap-1 ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                        {item.endpoints?.name || 'Unknown Endpoint'}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPlanBadgeColor(item.processing_plan)}`}
                      >
                        {item.processing_plan}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[hsl(var(--text-muted))]">
                      <span className={getPriorityColor(item.priority)}>
                        P{item.priority}
                      </span>
                      {item.business_domain && (
                        <span>{item.business_domain}</span>
                      )}
                      <span>{new Date(item.queued_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    {item.actual_processing_time_seconds && (
                      <div className="text-blue-400">
                        {formatTime(item.actual_processing_time_seconds)}
                      </div>
                    )}
                    {item.actual_cost_cents && (
                      <div className="text-green-400">
                        {formatCost(item.actual_cost_cents)}
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="sm" className="justify-start">
          <Plus className="h-4 w-4 mr-2" />
          Add to Queue
        </Button>
        <Button variant="outline" size="sm" className="justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Performance Insights */}
      {stats && stats.avg_processing_time_seconds && (
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--text-muted))]">Avg Processing Time</span>
              <span className="text-blue-400">{formatTime(stats.avg_processing_time_seconds ?? null)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--text-muted))]">Success Rate</span>
              <span className="text-green-400">
                {stats.total_items > 0 ? (((stats.completed || 0) / stats.total_items) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--text-muted))]">Active Domains</span>
              <span className="text-purple-400">{stats.business_domains?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 