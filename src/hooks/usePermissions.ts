'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface PermissionCheck {
  allowed: boolean
  reason?: string
  current_usage?: number
  limit?: number
  upgrade_required?: boolean
}

interface UserPermissions {
  can_create_endpoint: PermissionCheck
  can_make_request: PermissionCheck
  [key: string]: PermissionCheck
}

interface PlanLimits {
  plan_id: string
  max_endpoints: number
  max_requests_per_month: number
  max_api_keys: number
  current_month_requests: number
  has_ai_insights: boolean
  has_custom_webhooks: boolean
  has_advanced_analytics: boolean
  has_team_management: boolean
  has_custom_integrations: boolean
  has_priority_support: boolean
  has_sla_guarantee: boolean
  has_custom_branding: boolean
}

interface UsageStats {
  current_month_requests: number
  endpoints_count: number
  api_keys_count: number
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClientSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/user/permissions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch permissions')
      }

      const data = await response.json()
      
      setPermissions(data.permissions)
      setPlanLimits(data.plan_limits)
      setUsageStats(data.usage_stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  const checkPermission = (permission: string): PermissionCheck => {
    if (!permissions) {
      return { allowed: false, reason: 'Permissions not loaded' }
    }
    
    return permissions[permission] || { allowed: false, reason: 'Unknown permission' }
  }

  const hasFeature = (feature: keyof PlanLimits): boolean => {
    if (!planLimits) return false
    return Boolean(planLimits[feature])
  }

  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0
    return Math.min((current / limit) * 100, 100)
  }

  const isNearLimit = (current: number, limit: number, threshold = 80): boolean => {
    if (limit === -1) return false
    return getUsagePercentage(current, limit) >= threshold
  }

  return {
    permissions,
    planLimits,
    usageStats,
    loading,
    error,
    checkPermission,
    hasFeature,
    getUsagePercentage,
    isNearLimit,
    refetch: fetchPermissions
  }
} 