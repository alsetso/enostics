// 🔐 Enostics Permissions & Subscription Management
// Centralized role-based access control and plan enforcement

import { createServerSupabaseClient } from '@/lib/supabase'

// Types for subscription and permissions
export interface UserPlanLimits {
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

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing'
  billing_cycle: 'monthly' | 'yearly'
  current_month_requests: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_start?: string
  current_period_end?: string
}

export interface PermissionCheck {
  allowed: boolean
  reason?: string
  current_usage?: number
  limit?: number
  upgrade_required?: boolean
}

/**
 * Get user's current plan limits and features
 */
export async function getUserPlanLimits(userId: string): Promise<UserPlanLimits | null> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .rpc('get_user_plan_limits', { user_uuid: userId })
      .single()
    
    if (error) {
      console.error('Error fetching user plan limits:', error)
      return null
    }
    
    return data as UserPlanLimits
  } catch (error) {
    console.error('Error in getUserPlanLimits:', error)
    return null
  }
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('enostics_user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getUserSubscription:', error)
    return null
  }
}

/**
 * Check if user can create a new endpoint
 */
export async function canCreateEndpoint(userId: string): Promise<PermissionCheck> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: canCreate, error } = await supabase
      .rpc('can_user_create_endpoint', { user_uuid: userId })
    
    if (error) {
      console.error('Error checking endpoint creation permission:', error)
      return { allowed: false, reason: 'Error checking permissions' }
    }
    
    if (!canCreate) {
      const limits = await getUserPlanLimits(userId)
      return {
        allowed: false,
        reason: 'Endpoint limit reached',
        limit: limits?.max_endpoints || 1,
        upgrade_required: true
      }
    }
    
    return { allowed: true }
  } catch (error) {
    console.error('Error in canCreateEndpoint:', error)
    return { allowed: false, reason: 'Error checking permissions' }
  }
}

/**
 * Check if user can make API request
 */
export async function canMakeRequest(userId: string): Promise<PermissionCheck> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: canRequest, error } = await supabase
      .rpc('can_user_make_request', { user_uuid: userId })
    
    if (error) {
      console.error('Error checking request permission:', error)
      return { allowed: false, reason: 'Error checking permissions' }
    }
    
    if (!canRequest) {
      const limits = await getUserPlanLimits(userId)
      return {
        allowed: false,
        reason: 'Monthly request limit reached',
        current_usage: limits?.current_month_requests || 0,
        limit: limits?.max_requests_per_month || 1000,
        upgrade_required: true
      }
    }
    
    return { allowed: true }
  } catch (error) {
    console.error('Error in canMakeRequest:', error)
    return { allowed: false, reason: 'Error checking permissions' }
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  userId: string, 
  feature: keyof Pick<UserPlanLimits, 
    'has_ai_insights' | 'has_custom_webhooks' | 'has_advanced_analytics' | 
    'has_team_management' | 'has_custom_integrations' | 'has_priority_support' |
    'has_sla_guarantee' | 'has_custom_branding'
  >
): Promise<PermissionCheck> {
  try {
    const limits = await getUserPlanLimits(userId)
    
    if (!limits) {
      return { allowed: false, reason: 'Unable to determine plan limits' }
    }
    
    const hasAccess = limits[feature]
    
    return {
      allowed: hasAccess,
      reason: hasAccess ? undefined : `Feature requires plan upgrade`,
      upgrade_required: !hasAccess
    }
  } catch (error) {
    console.error('Error in hasFeatureAccess:', error)
    return { allowed: false, reason: 'Error checking feature access' }
  }
}

/**
 * Increment user's usage counter
 */
export async function incrementUsage(
  userId: string,
  endpointId?: string,
  requestCount: number = 1,
  dataBytes: number = 0
): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .rpc('increment_user_usage', {
        user_uuid: userId,
        endpoint_uuid: endpointId || null,
        request_count: requestCount,
        data_bytes: dataBytes
      })
    
    if (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
    
    return data
  } catch (error) {
    console.error('Error in incrementUsage:', error)
    return false
  }
}

/**
 * Get user's current usage statistics
 */
export async function getUserUsageStats(userId: string): Promise<{
  current_month_requests: number
  endpoints_count: number
  api_keys_count: number
} | null> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get subscription data for request count
    const { data: subscription } = await supabase
      .from('enostics_user_subscriptions')
      .select('current_month_requests')
      .eq('user_id', userId)
      .single()
    
    // Get endpoints count
    const { count: endpointsCount } = await supabase
      .from('enostics_endpoints')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)
    
    // Get API keys count
    const { count: apiKeysCount } = await supabase
      .from('enostics_api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)
    
    return {
      current_month_requests: subscription?.current_month_requests || 0,
      endpoints_count: endpointsCount || 0,
      api_keys_count: apiKeysCount || 0
    }
  } catch (error) {
    console.error('Error in getUserUsageStats:', error)
    return null
  }
}

/**
 * Check multiple permissions at once
 */
export async function checkPermissions(userId: string, checks: string[]): Promise<Record<string, PermissionCheck>> {
  const results: Record<string, PermissionCheck> = {}
  
  for (const check of checks) {
    switch (check) {
      case 'create_endpoint':
        results[check] = await canCreateEndpoint(userId)
        break
      case 'make_request':
        results[check] = await canMakeRequest(userId)
        break
      case 'ai_insights':
        results[check] = await hasFeatureAccess(userId, 'has_ai_insights')
        break
      case 'custom_webhooks':
        results[check] = await hasFeatureAccess(userId, 'has_custom_webhooks')
        break
      case 'advanced_analytics':
        results[check] = await hasFeatureAccess(userId, 'has_advanced_analytics')
        break
      case 'team_management':
        results[check] = await hasFeatureAccess(userId, 'has_team_management')
        break
      default:
        results[check] = { allowed: false, reason: 'Unknown permission check' }
    }
  }
  
  return results
}

/**
 * Upgrade user to a new plan
 */
export async function upgradePlan(
  userId: string, 
  newPlanId: string,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Update user profile
    await supabase
      .from('user_profiles')
      .update({ current_plan: newPlanId })
      .eq('user_id', userId)
    
    // Update subscription
    const { error } = await supabase
      .from('enostics_user_subscriptions')
      .update({
        plan_id: newPlanId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error upgrading plan:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in upgradePlan:', error)
    return false
  }
}

/**
 * Get plan comparison data for billing page
 */
export async function getPlansComparison() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: plans, error } = await supabase
      .from('enostics_subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true })
    
    if (error) {
      console.error('Error fetching plans:', error)
      return []
    }
    
    return plans
  } catch (error) {
    console.error('Error in getPlansComparison:', error)
    return []
  }
}

/**
 * Permission middleware for API routes
 */
export class PermissionMiddleware {
  static async checkEndpointCreation(userId: string) {
    const permission = await canCreateEndpoint(userId)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Endpoint creation not allowed')
    }
    return permission
  }
  
  static async checkApiRequest(userId: string) {
    const permission = await canMakeRequest(userId)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'API request not allowed')
    }
    return permission
  }
  
  static async checkFeature(userId: string, feature: string) {
    const featureMap: Record<string, keyof Pick<UserPlanLimits, 
      'has_ai_insights' | 'has_custom_webhooks' | 'has_advanced_analytics' | 
      'has_team_management' | 'has_custom_integrations' | 'has_priority_support' |
      'has_sla_guarantee' | 'has_custom_branding'
    >> = {
      'ai_insights': 'has_ai_insights',
      'custom_webhooks': 'has_custom_webhooks',
      'advanced_analytics': 'has_advanced_analytics',
      'team_management': 'has_team_management',
      'custom_integrations': 'has_custom_integrations',
      'priority_support': 'has_priority_support',
      'sla_guarantee': 'has_sla_guarantee',
      'custom_branding': 'has_custom_branding'
    }
    
    const featureKey = featureMap[feature]
    if (!featureKey) {
      throw new Error('Unknown feature')
    }
    
    const permission = await hasFeatureAccess(userId, featureKey)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Feature access denied')
    }
    return permission
  }
} 