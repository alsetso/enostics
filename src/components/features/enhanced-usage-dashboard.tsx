'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Zap, 
  Database, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import type { UsageStats } from '@/lib/enhanced-usage-tracking'

interface UsageMetricCardProps {
  title: string
  current: number
  limit: number
  unit?: string
  icon: React.ComponentType<any>
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  formatValue?: (value: number) => string
}

function UsageMetricCard({ 
  title, 
  current, 
  limit, 
  unit = '', 
  icon: Icon, 
  color,
  formatValue = (v) => v.toLocaleString()
}: UsageMetricCardProps) {
  const percentage = limit > 0 ? (current / limit) * 100 : 0
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  const colorClasses = {
    blue: 'text-blue-400 bg-blue-400/10',
    green: 'text-green-400 bg-green-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
    red: 'text-red-400 bg-red-400/10'
  }

  const progressColor = isAtLimit 
    ? 'bg-red-500' 
    : isNearLimit 
      ? 'bg-yellow-500' 
      : 'bg-enostics-blue'

  return (
    <Card className="bg-enostics-gray-900/50 border-enostics-gray-700 hover:border-enostics-gray-600 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-white text-sm font-medium">{title}</span>
          </div>
          {isAtLimit && (
            <Badge variant="destructive" className="text-xs">
              Limit Reached
            </Badge>
          )}
          {isNearLimit && !isAtLimit && (
            <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
              Near Limit
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Usage Numbers */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-white">
                {formatValue(current)}
              </span>
              <span className="text-sm text-enostics-gray-400 ml-1">{unit}</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-enostics-gray-400">of</div>
              <div className="text-sm font-medium text-enostics-gray-300">
                {limit === -1 ? 'Unlimited' : `${formatValue(limit)}${unit}`}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {limit !== -1 && (
            <div className="space-y-1">
              <div className="w-full bg-enostics-gray-700 rounded-full h-2">
                <div 
                  className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-enostics-gray-400">
                <span>{Math.round(percentage)}% used</span>
                <span>{formatValue(Math.max(0, limit - current))} remaining</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function EnhancedUsageDashboard() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [warnings, setWarnings] = useState<any[]>([])
  const [daysUntilReset, setDaysUntilReset] = useState(0)

  useEffect(() => {
    fetchUsageData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchUsageData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUsageData = async () => {
    try {
      const supabase = createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Try the new enhanced function first
      try {
        const { data, error } = await supabase
          .rpc('get_user_usage_stats', { user_uuid: user.id })

        if (!error && data) {
          const stats: UsageStats = {
            usage: {
              requests_today: data.requests_today,
              requests_this_month: data.requests_this_month,
              data_bytes_this_month: data.data_bytes_this_month,
              webhook_calls_this_month: data.webhook_calls_this_month,
              ai_executions_this_month: data.ai_executions_this_month,
              total_storage_bytes: data.total_storage_bytes,
              endpoints_count: data.endpoints_count,
              api_keys_count: data.api_keys_count
            },
            limits: {
              monthly_requests: data.plan_limits.monthly_requests,
              monthly_webhooks: data.plan_limits.monthly_webhooks,
              monthly_ai_executions: data.plan_limits.monthly_ai_executions,
              max_payload_size: data.plan_limits.max_payload_size,
              max_storage_bytes: data.plan_limits.max_storage_bytes,
              plan_name: 'citizen'
            },
            percentages: {
              requests: data.usage_percentages.requests,
              webhooks: data.usage_percentages.webhooks,
              ai_executions: data.usage_percentages.ai_executions,
              storage: data.usage_percentages.storage
            }
          }

          setUsageStats(stats)

          // Check for warnings
          const newWarnings = []
          if (stats.percentages.requests >= 80) {
            newWarnings.push({
              type: 'requests',
              percentage: stats.percentages.requests,
              message: `You've used ${Math.round(stats.percentages.requests)}% of your monthly API requests`
            })
          }
          if (stats.percentages.storage >= 80) {
            newWarnings.push({
              type: 'storage',
              percentage: stats.percentages.storage,
              message: `You've used ${Math.round(stats.percentages.storage)}% of your storage space`
            })
          }
          setWarnings(newWarnings)

          // Calculate days until reset
          const now = new Date()
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          setDaysUntilReset(Math.ceil((lastDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          
          setLoading(false)
          return
        }
      } catch (enhancedError) {
        console.log('Enhanced usage tracking not available, using fallback data')
      }

      // Fallback: Use existing database structure
      console.log('Using fallback usage data (Phase 1 schema not applied yet)')
      
      // Show a notice that enhanced features are available
      setWarnings([{
        type: 'info',
        percentage: 0,
        message: 'Enhanced usage tracking available! Apply the Phase 1 schema to unlock real-time monitoring, monthly limits, and detailed analytics.'
      }])
      
      // Get basic counts from existing tables
      const [endpointsResult, apiKeysResult] = await Promise.all([
        supabase.from('enostics_endpoints').select('*', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('enostics_api_keys').select('*', { count: 'exact' }).eq('user_id', user.id)
      ])

      // Get data through endpoints (since enostics_data doesn't have user_id directly)
      let dataResult: { data: any[], count: number } = { data: [], count: 0 }
      if (endpointsResult.data && endpointsResult.data.length > 0) {
        const endpointIds = endpointsResult.data.map((ep: any) => ep.id)
        const { data: dataRecords, count: dataCount } = await supabase
          .from('enostics_data')
          .select('data', { count: 'exact' })
          .in('endpoint_id', endpointIds)
        
        dataResult = { data: dataRecords || [], count: dataCount || 0 }
      }

      // Calculate storage from existing data
      let totalStorage = 0
      if (dataResult.data) {
        totalStorage = dataResult.data.reduce((total: number, item: any) => {
          return total + (item.data ? JSON.stringify(item.data).length : 0)
        }, 0)
      }

      // Create fallback stats with default limits
      const fallbackStats: UsageStats = {
        usage: {
          requests_today: 0, // Can't calculate without tracking table
          requests_this_month: dataResult.count || 0, // Use total data count as approximation
          data_bytes_this_month: totalStorage,
          webhook_calls_this_month: 0, // Not tracked yet
          ai_executions_this_month: 0, // Not tracked yet
          total_storage_bytes: totalStorage,
          endpoints_count: endpointsResult.count || 0,
          api_keys_count: apiKeysResult.count || 0
        },
        limits: {
          monthly_requests: 10000,
          monthly_webhooks: 500,
          monthly_ai_executions: 10,
          max_payload_size: 1048576, // 1MB
          max_storage_bytes: 104857600, // 100MB
          plan_name: 'citizen'
        },
        percentages: {
          requests: ((dataResult.count || 0) / 10000) * 100,
          webhooks: 0,
          ai_executions: 0,
          storage: (totalStorage / 104857600) * 100
        }
      }

      setUsageStats(fallbackStats)

      // Calculate days until reset
      const now = new Date()
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setDaysUntilReset(Math.ceil((lastDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    } catch (error) {
      console.error('Error in fetchUsageData:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-enostics-blue" />
            Usage Dashboard
          </h1>
          <p className="text-enostics-gray-400 mt-2">
            Loading your usage data...
          </p>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-enostics-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!usageStats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-enostics-blue" />
            Usage Dashboard
          </h1>
          <p className="text-enostics-gray-400 mt-2">
            Unable to load usage data
          </p>
        </div>
        <div className="text-center py-8">
          <div className="bg-enostics-gray-900/50 border border-enostics-gray-700 rounded-lg p-6">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-enostics-gray-300 mb-4">
              Usage tracking is not available yet. Apply the Phase 1 schema to enable enhanced usage monitoring.
            </p>
            <Button 
              onClick={() => alert('📋 Instructions:\n\n1. Go to Supabase Dashboard > SQL Editor\n2. Copy contents of apply-phase1-schema.sql\n3. Paste and run the SQL\n4. Refresh this page to see enhanced tracking!')}
              className="bg-enostics-blue hover:bg-enostics-blue/90"
            >
              View Setup Instructions
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { usage, limits, percentages } = usageStats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-enostics-blue" />
            Usage Dashboard
          </h1>
          <p className="text-enostics-gray-400 mt-2">
            Track your API usage and monitor your limits • Resets in {daysUntilReset} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Citizen Plan</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          {warnings.map((warning, index) => {
            const isInfo = warning.type === 'info'
            const bgColor = isInfo ? 'bg-blue-500/10 border-blue-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
            const iconColor = isInfo ? 'text-blue-400' : 'text-yellow-400'
            const textColor = isInfo ? 'text-blue-200' : 'text-yellow-200'
            const buttonColor = isInfo ? 'bg-blue-600 hover:bg-blue-700' : 'bg-yellow-600 hover:bg-yellow-700'
            const buttonText = isInfo ? 'Apply Schema' : 'Upgrade Plan'
                         const buttonAction = isInfo 
               ? () => alert('📋 Instructions:\n\n1. Go to Supabase Dashboard > SQL Editor\n2. Copy contents of apply-phase1-schema.sql\n3. Paste and run the SQL\n4. Refresh this page to see enhanced tracking!')
               : () => window.location.href = '/dashboard/settings/billing'
            
            return (
              <div key={index} className={`${bgColor} rounded-lg p-4`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
                  <div>
                    <p className={`${textColor} font-medium`}>{warning.message}</p>
                    <Button 
                      size="sm" 
                      className={`mt-2 ${buttonColor}`}
                      onClick={buttonAction}
                    >
                      {buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UsageMetricCard
          title="API Requests"
          current={usage.requests_this_month}
          limit={limits.monthly_requests}
          icon={Activity}
          color="blue"
        />

        <UsageMetricCard
          title="Data Storage"
          current={usage.total_storage_bytes}
          limit={limits.max_storage_bytes}
          icon={Database}
          color="orange"
          formatValue={formatBytes}
        />

        <UsageMetricCard
          title="Webhooks"
          current={usage.webhook_calls_this_month}
          limit={limits.monthly_webhooks}
          icon={Zap}
          color="green"
        />

        <UsageMetricCard
          title="AI Executions"
          current={usage.ai_executions_this_month}
          limit={limits.monthly_ai_executions}
          icon={Brain}
          color="purple"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-enostics-blue" />
              <span className="text-2xl font-bold text-white">
                {usage.requests_today.toLocaleString()}
              </span>
              <span className="text-sm text-enostics-gray-400">requests</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Active Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-enostics-gray-400">Endpoints</span>
                <span className="text-white">{usage.endpoints_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-enostics-gray-400">API Keys</span>
                <span className="text-white">{usage.api_keys_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Plan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-enostics-gray-400" />
                <span className="text-sm text-enostics-gray-400">
                  Resets in {daysUntilReset} days
                </span>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-enostics-blue to-purple-600 hover:from-enostics-blue/90 hover:to-purple-600/90"
                onClick={() => window.location.href = '/dashboard/settings/billing'}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="border-enostics-gray-600 text-enostics-gray-300 hover:bg-enostics-gray-800"
              onClick={() => window.location.href = '/dashboard/analytics'}
            >
              View Analytics
            </Button>
            <Button 
              variant="outline"
              className="border-enostics-gray-600 text-enostics-gray-300 hover:bg-enostics-gray-800"
              onClick={() => window.location.href = '/dashboard/webhooks'}
            >
              Manage Webhooks
            </Button>
            <Button 
              variant="outline"
              className="border-enostics-gray-600 text-enostics-gray-300 hover:bg-enostics-gray-800"
              onClick={() => window.location.href = '/docs'}
            >
              API Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 