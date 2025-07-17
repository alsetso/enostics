'use client'

import { useState, useEffect } from 'react'
import { BillingTable } from '@/components/billing/BillingTable'
import { Activity, Zap, Database } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface UsageData {
  current_month_requests: number
  endpoints_count: number
  api_keys_count: number
}

interface PlanLimits {
  plan_id: string
  max_endpoints: number
  max_requests_per_month: number
  max_api_keys: number
  current_month_requests: number
}

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState('citizen')
  const [loading, setLoading] = useState(true)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const supabase = createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get user profile with current plan
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('current_plan')
          .eq('user_id', user.id)
          .single()

        const plan = profileData?.current_plan || 'citizen'
        setCurrentPlan(plan)

        // Get plan limits and usage
        const { data: limits } = await supabase
          .rpc('get_user_plan_limits', { user_uuid: user.id })
          .single()

        if (limits) {
          setPlanLimits(limits as PlanLimits)
        }

        // Get current usage stats
        const { data: subscription } = await supabase
          .from('enostics_user_subscriptions')
          .select('current_month_requests')
          .eq('user_id', user.id)
          .single()

        const { count: endpointsCount } = await supabase
          .from('enostics_endpoints')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true)

        const { count: apiKeysCount } = await supabase
          .from('enostics_api_keys')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true)

        setUsageData({
          current_month_requests: subscription?.current_month_requests || 0,
          endpoints_count: endpointsCount || 0,
          api_keys_count: apiKeysCount || 0
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = async (planId: string) => {
    alert(`Plan change to ${planId} coming soon! This will integrate with Stripe for seamless billing.`)
  }

  const formatUsage = (current: number, limit: number) => {
    if (limit === -1) return `${current.toLocaleString()} / Unlimited`
    return `${current.toLocaleString()} / ${limit.toLocaleString()}`
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0
    return Math.min((current / limit) * 100, 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-12 pb-8">
        {/* Plans Section - Moved to top */}
        <div>
          <BillingTable 
            currentPlan={currentPlan}
            onPlanChange={handlePlanChange}
          />
        </div>

        {/* Current Usage */}
        {usageData && planLimits && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Current Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* API Requests */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">API Requests</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatUsage(usageData.current_month_requests, planLimits.max_requests_per_month)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">this month</span>
                  </div>
                  {planLimits.max_requests_per_month !== -1 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${getUsagePercentage(usageData.current_month_requests, planLimits.max_requests_per_month)}%` 
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Endpoints */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Endpoints</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatUsage(usageData.endpoints_count, planLimits.max_endpoints)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">active</span>
                  </div>
                  {planLimits.max_endpoints !== -1 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${getUsagePercentage(usageData.endpoints_count, planLimits.max_endpoints)}%` 
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* API Keys */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">API Keys</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatUsage(usageData.api_keys_count, planLimits.max_api_keys)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">active</span>
                  </div>
                  {planLimits.max_api_keys !== -1 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${getUsagePercentage(usageData.api_keys_count, planLimits.max_api_keys)}%` 
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 