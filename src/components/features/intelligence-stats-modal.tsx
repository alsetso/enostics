'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  TrendingUp,
  Zap,
  DollarSign,
  Activity,
  Database,
  Plus,
  Eye,
  Target,
  Sparkles,
  Timer,
  ArrowRight,
  Users,
  BarChart3
} from 'lucide-react'
import { useIntelligenceSelector } from '@/hooks/useIntelligenceSelector'

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

interface BatchInfo {
  id: string
  name: string
  status: string
  total_records: number
  processed_records: number
  failed_records: number
  estimated_cost_cents: number
  actual_cost_cents: number
  created_at: string
  completed_at?: string
  processing_plan: string
}

interface IntelligenceStatsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function IntelligenceStatsModal({ isOpen, onClose }: IntelligenceStatsModalProps) {
  const [stats, setStats] = useState<ProcessorStats | null>(null)
  const [batches, setBatches] = useState<BatchInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const { 
    enterSelectorMode, 
    closeStatsModal, 
    currentBatchId, 
    openDetailModal 
  } = useIntelligenceSelector()

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/data-processor/stats?timeframe=7d')
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.basic_stats || data.analytics || {})
      } else {
        // Mock data for demo
        setStats({
          total_items: 127,
          pending: 23,
          processing: 5,
          completed: 89,
          failed: 8,
          paused: 2,
          cancelled: 0,
          avg_processing_time_seconds: 45.2,
          total_cost_cents: 1547,
          high_priority_pending: 6,
          business_domains: ['healthcare', 'finance', 'iot', 'general']
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Mock fallback data
      setStats({
        total_items: 127,
        pending: 23,
        processing: 5,
        completed: 89,
        failed: 8,
        paused: 2,
        cancelled: 0,
        avg_processing_time_seconds: 45.2,
        total_cost_cents: 1547,
        high_priority_pending: 6,
        business_domains: ['healthcare', 'finance', 'iot', 'general']
      })
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/data-processor/batches?limit=5')
      
      if (response.ok) {
        const data = await response.json()
        setBatches(data.batches || [])
      } else {
        // Mock batch data
        setBatches([
          {
            id: 'batch_1',
            name: 'Health Data Analysis',
            status: 'completed',
            total_records: 45,
            processed_records: 45,
            failed_records: 0,
            estimated_cost_cents: 290,
            actual_cost_cents: 267,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            completed_at: new Date(Date.now() - 1800000).toISOString(),
            processing_plan: 'auto_advanced'
          },
          {
            id: 'batch_2',
            name: 'IoT Sensor Data',
            status: 'processing',
            total_records: 128,
            processed_records: 67,
            failed_records: 2,
            estimated_cost_cents: 356,
            actual_cost_cents: 189,
            created_at: new Date(Date.now() - 1800000).toISOString(),
            processing_plan: 'auto_basic'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
      setBatches([])
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchStats()
      fetchBatches()
    }
  }, [isOpen])

  const handleAddToQueue = () => {
    closeStatsModal()
    enterSelectorMode()
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchStats(), fetchBatches()])
    setRefreshing(false)
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
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      case 'paused': return <Clock className="h-4 w-4" />
      case 'pending': return <Timer className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatCost = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatTime = (seconds: number) => {
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

  const getSuccessRate = () => {
    if (!stats) return 0
    const total = stats.total_items
    if (total === 0) return 0
    return (stats.completed / total) * 100
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--primary-bg))] border-[hsl(var(--border-color))]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--text-primary))]">
            <Brain className="h-5 w-5 text-purple-400" />
            Universal Data Processor
            <Badge variant="outline" className="ml-2">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-[hsl(var(--text-primary))]">
                AI-Powered Data Processing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={handleAddToQueue}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Queue
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-[hsl(var(--hover-bg))] rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[hsl(var(--card-bg))] border-[hsl(var(--border-color))]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-400" />
                      <div>
                        <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                          {stats?.total_items || 0}
                        </div>
                        <div className="text-xs text-[hsl(var(--text-muted))]">Total Items</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--card-bg))] border-[hsl(var(--border-color))]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <div>
                        <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                          {stats?.pending || 0}
                        </div>
                        <div className="text-xs text-[hsl(var(--text-muted))]">Pending</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--card-bg))] border-[hsl(var(--border-color))]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <div>
                        <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                          {stats?.completed || 0}
                        </div>
                        <div className="text-xs text-[hsl(var(--text-muted))]">Completed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--card-bg))] border-[hsl(var(--border-color))]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <div>
                        <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                          {formatCost(stats?.total_cost_cents || 0)}
                        </div>
                        <div className="text-xs text-[hsl(var(--text-muted))]">Total Cost</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress and Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Progress Overview */}
                <Card className="bg-[hsl(var(--card-bg))] border-[hsl(var(--border-color))]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      Processing Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[hsl(var(--text-primary))]">
                        Overall Progress
                      </span>
                      <span className="text-sm text-[hsl(var(--text-muted))]">
                        {calculateProgress().toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                    <div className="flex justify-between text-xs text-[hsl(var(--text-muted))]">
                      <span>{stats?.processing || 0} processing</span>
                      <span>{stats?.high_priority_pending || 0} high priority</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="bg-[hsl(var(--card-bg))] border-[hsl(var(--border-color))]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--text-muted))]">Avg Processing Time</span>
                      <span className="text-blue-400">
                        {formatTime(stats?.avg_processing_time_seconds || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--text-muted))]">Success Rate</span>
                      <span className="text-green-400">
                        {getSuccessRate().toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--text-muted))]">Active Domains</span>
                      <span className="text-purple-400">
                        {stats?.business_domains?.length || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Batches */}
              {batches.length > 0 && (
                <Card className="bg-[hsl(var(--card-bg))] border-[hsl(var(--border-color))]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-400" />
                      Recent Batches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {batches.map((batch) => (
                        <div 
                          key={batch.id}
                          className="flex items-center justify-between p-3 bg-[hsl(var(--hover-bg))] rounded-lg hover:bg-[hsl(var(--hover-bg))]/80 transition-colors cursor-pointer"
                          onClick={() => openDetailModal(batch.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`${getStatusColor(batch.status)}`}>
                              {getStatusIcon(batch.status)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[hsl(var(--text-primary))]">
                                {batch.name}
                              </div>
                              <div className="text-xs text-[hsl(var(--text-muted))]">
                                {batch.processed_records}/{batch.total_records} records • {formatCost(batch.actual_cost_cents || batch.estimated_cost_cents)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {batch.processing_plan}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-400" />
                      <div>
                        <div className="text-sm font-medium text-[hsl(var(--text-primary))]">
                          Ready to Process More Data?
                        </div>
                        <div className="text-xs text-[hsl(var(--text-muted))]">
                          Select records from your inbox to add them to the processing queue
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddToQueue}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Queue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 