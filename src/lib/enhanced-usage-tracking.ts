import { createServerSupabaseClient } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface UsageMetrics {
  requests_today: number
  requests_this_month: number
  data_bytes_this_month: number
  webhook_calls_this_month: number
  ai_executions_this_month: number
  total_storage_bytes: number
  endpoints_count: number
  api_keys_count: number
}

export interface PlanLimits {
  monthly_requests: number
  monthly_webhooks: number
  monthly_ai_executions: number
  max_payload_size: number
  max_storage_bytes: number
  plan_name: string
}

export interface UsageCheckResult {
  allowed: boolean
  reason?: string
  current_usage?: number
  limit?: number
  percentage_used?: number
  days_until_reset?: number
  limit_type?: 'requests' | 'payload_size' | 'storage' | 'webhooks' | 'ai'
}

export interface UsageStats {
  usage: UsageMetrics
  limits: PlanLimits
  percentages: {
    requests: number
    webhooks: number
    ai_executions: number
    storage: number
  }
}

export class EnhancedUsageTracker {
  private async getSupabase(): Promise<SupabaseClient> {
    return await createServerSupabaseClient()
  }

  /**
   * Check if user can make a request with optional payload size
   */
  async checkUsageLimits(
    userId: string,
    payloadSize: number = 0
  ): Promise<UsageCheckResult> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .rpc('can_user_make_request_v2', {
          user_uuid: userId,
          payload_size: payloadSize
        })

      if (error) {
        console.error('Error checking usage limits:', error)
        return { allowed: false, reason: 'Error checking usage limits' }
      }

      if (!data.allowed) {
        return {
          allowed: false,
          reason: data.reason,
          current_usage: data.current_usage,
          limit: data.limit,
          limit_type: data.limit_type,
          percentage_used: data.limit_type === 'requests' ? (data.current_usage / data.limit) * 100 : undefined,
          days_until_reset: this.getDaysUntilMonthEnd()
        }
      }

      return {
        allowed: true,
        current_usage: data.current_requests,
        limit: data.request_limit,
        percentage_used: (data.current_requests / data.request_limit) * 100
      }
    } catch (error) {
      console.error('Error in checkUsageLimits:', error)
      return { allowed: false, reason: 'Error checking usage limits' }
    }
  }

  /**
   * Track usage for a user/endpoint
   */
  async trackUsage(
    userId: string,
    endpointId: string,
    metrics: {
      request_count?: number
      data_bytes?: number
      webhook_calls?: number
      ai_executions?: number
    }
  ): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .rpc('increment_usage_v2', {
          user_uuid: userId,
          endpoint_uuid: endpointId,
          request_count: metrics.request_count || 0,
          data_bytes: metrics.data_bytes || 0,
          webhook_calls: metrics.webhook_calls || 0,
          ai_executions: metrics.ai_executions || 0
        })

      if (error) {
        console.error('Error tracking usage:', error)
        return false
      }

      return data.success
    } catch (error) {
      console.error('Error in trackUsage:', error)
      return false
    }
  }

  /**
   * Get comprehensive usage statistics for a user
   */
  async getUserUsageStats(userId: string): Promise<UsageStats | null> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .rpc('get_user_usage_stats', {
          user_uuid: userId
        })

      if (error) {
        console.error('Error getting usage stats:', error)
        return null
      }

      return {
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
          plan_name: 'citizen' // Default for now
        },
        percentages: {
          requests: data.usage_percentages.requests,
          webhooks: data.usage_percentages.webhooks,
          ai_executions: data.usage_percentages.ai_executions,
          storage: data.usage_percentages.storage
        }
      }
    } catch (error) {
      console.error('Error in getUserUsageStats:', error)
      return null
    }
  }

  /**
   * Check if user is approaching any limits (80%+ usage)
   */
  async checkUsageWarnings(userId: string): Promise<{
    hasWarnings: boolean
    warnings: Array<{
      type: 'requests' | 'storage' | 'webhooks' | 'ai'
      percentage: number
      current: number
      limit: number
      message: string
    }>
  }> {
    const stats = await this.getUserUsageStats(userId)
    if (!stats) {
      return { hasWarnings: false, warnings: [] }
    }

    const warnings = []
    const { usage, limits, percentages } = stats

    // Check requests (80%+ warning)
    if (percentages.requests >= 80) {
      warnings.push({
        type: 'requests' as const,
        percentage: percentages.requests,
        current: usage.requests_this_month,
        limit: limits.monthly_requests,
        message: `You've used ${Math.round(percentages.requests)}% of your monthly API requests`
      })
    }

    // Check storage (80%+ warning)
    if (percentages.storage >= 80) {
      warnings.push({
        type: 'storage' as const,
        percentage: percentages.storage,
        current: usage.total_storage_bytes,
        limit: limits.max_storage_bytes,
        message: `You've used ${Math.round(percentages.storage)}% of your storage space`
      })
    }

    // Check webhooks (80%+ warning)
    if (percentages.webhooks >= 80) {
      warnings.push({
        type: 'webhooks' as const,
        percentage: percentages.webhooks,
        current: usage.webhook_calls_this_month,
        limit: limits.monthly_webhooks,
        message: `You've used ${Math.round(percentages.webhooks)}% of your monthly webhook calls`
      })
    }

    // Check AI executions (80%+ warning)
    if (percentages.ai_executions >= 80) {
      warnings.push({
        type: 'ai' as const,
        percentage: percentages.ai_executions,
        current: usage.ai_executions_this_month,
        limit: limits.monthly_ai_executions,
        message: `You've used ${Math.round(percentages.ai_executions)}% of your monthly AI executions`
      })
    }

    return {
      hasWarnings: warnings.length > 0,
      warnings
    }
  }

  /**
   * Get usage trend data for the past 30 days
   */
  async getUsageTrend(userId: string): Promise<Array<{
    date: string
    requests: number
    data_bytes: number
    webhook_calls: number
  }> | null> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('enostics_usage_tracking')
        .select('tracking_date, request_count, data_bytes, webhook_calls')
        .eq('user_id', userId)
        .gte('tracking_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('tracking_date', { ascending: true })

      if (error) {
        console.error('Error getting usage trend:', error)
        return null
      }

      // Aggregate by date (in case multiple endpoints per day)
      const trendMap = new Map<string, { requests: number; data_bytes: number; webhook_calls: number }>()
      
      data.forEach((row: any) => {
        const date = row.tracking_date
        const existing = trendMap.get(date) || { requests: 0, data_bytes: 0, webhook_calls: 0 }
        trendMap.set(date, {
          requests: existing.requests + row.request_count,
          data_bytes: existing.data_bytes + row.data_bytes,
          webhook_calls: existing.webhook_calls + row.webhook_calls
        })
      })

      return Array.from(trendMap.entries()).map(([date, metrics]) => ({
        date,
        requests: metrics.requests,
        data_bytes: metrics.data_bytes,
        webhook_calls: metrics.webhook_calls
      }))
    } catch (error) {
      console.error('Error in getUsageTrend:', error)
      return null
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Format number with commas
   */
  formatNumber(num: number): string {
    return num.toLocaleString()
  }

  /**
   * Get days until month end
   */
  private getDaysUntilMonthEnd(): number {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return Math.ceil((lastDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Check if user can perform webhook action
   */
  async canTriggerWebhook(userId: string): Promise<UsageCheckResult> {
    const stats = await this.getUserUsageStats(userId)
    if (!stats) {
      return { allowed: false, reason: 'Unable to check usage' }
    }

    const { usage, limits } = stats
    
    if (usage.webhook_calls_this_month >= limits.monthly_webhooks) {
      return {
        allowed: false,
        reason: 'Monthly webhook limit exceeded',
        current_usage: usage.webhook_calls_this_month,
        limit: limits.monthly_webhooks,
        limit_type: 'webhooks',
        percentage_used: 100,
        days_until_reset: this.getDaysUntilMonthEnd()
      }
    }

    return {
      allowed: true,
      current_usage: usage.webhook_calls_this_month,
      limit: limits.monthly_webhooks,
      percentage_used: (usage.webhook_calls_this_month / limits.monthly_webhooks) * 100
    }
  }

  /**
   * Check if user can perform AI action
   */
  async canExecuteAI(userId: string): Promise<UsageCheckResult> {
    const stats = await this.getUserUsageStats(userId)
    if (!stats) {
      return { allowed: false, reason: 'Unable to check usage' }
    }

    const { usage, limits } = stats
    
    if (usage.ai_executions_this_month >= limits.monthly_ai_executions) {
      return {
        allowed: false,
        reason: 'Monthly AI execution limit exceeded',
        current_usage: usage.ai_executions_this_month,
        limit: limits.monthly_ai_executions,
        limit_type: 'ai',
        percentage_used: 100,
        days_until_reset: this.getDaysUntilMonthEnd()
      }
    }

    return {
      allowed: true,
      current_usage: usage.ai_executions_this_month,
      limit: limits.monthly_ai_executions,
      percentage_used: (usage.ai_executions_this_month / limits.monthly_ai_executions) * 100
    }
  }
}

// Singleton instance
export const enhancedUsageTracker = new EnhancedUsageTracker()

// Export individual functions for convenience
export const checkUsageLimits = (userId: string, payloadSize?: number) => 
  enhancedUsageTracker.checkUsageLimits(userId, payloadSize)

export const trackUsage = (userId: string, endpointId: string, metrics: any) =>
  enhancedUsageTracker.trackUsage(userId, endpointId, metrics)

export const getUserUsageStats = (userId: string) =>
  enhancedUsageTracker.getUserUsageStats(userId)

export const checkUsageWarnings = (userId: string) =>
  enhancedUsageTracker.checkUsageWarnings(userId)

export const getUsageTrend = (userId: string) =>
  enhancedUsageTracker.getUsageTrend(userId)

export const canTriggerWebhook = (userId: string) =>
  enhancedUsageTracker.canTriggerWebhook(userId)

export const canExecuteAI = (userId: string) =>
  enhancedUsageTracker.canExecuteAI(userId) 