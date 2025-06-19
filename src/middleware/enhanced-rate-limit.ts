import { NextRequest, NextResponse } from 'next/server'
import { checkUsageLimits, trackUsage } from '@/lib/enhanced-usage-tracking'
import { rateLimitMiddleware } from './rate-limit'

export interface EnhancedRateLimitResult {
  success: true
  headers?: Record<string, string>
}

export interface EnhancedRateLimitError {
  success: false
  response: NextResponse
}

export type EnhancedRateLimitResponse = EnhancedRateLimitResult | EnhancedRateLimitError

/**
 * Enhanced rate limiting middleware that enforces both hourly and monthly limits
 */
export async function enhancedRateLimitMiddleware(
  request: NextRequest,
  userId?: string,
  endpointId?: string
): Promise<EnhancedRateLimitResponse> {
  
  if (!userId) {
    return { 
      success: false, 
      response: NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 }) 
    }
  }

  // Get payload size
  const payloadSize = parseInt(request.headers.get('content-length') || '0')

  try {
    // Check monthly limits first (most restrictive)
    const monthlyCheck = await checkUsageLimits(userId, payloadSize)
    
    if (!monthlyCheck.allowed) {
      const upgradeMessage = getUpgradeMessage(monthlyCheck.limit_type)
      
      return {
        success: false,
        response: NextResponse.json({
          error: 'Usage limit exceeded',
          message: monthlyCheck.reason,
          code: 'USAGE_LIMIT_EXCEEDED',
          limit_type: monthlyCheck.limit_type,
          current_usage: monthlyCheck.current_usage,
          limit: monthlyCheck.limit,
          percentage_used: monthlyCheck.percentage_used,
          days_until_reset: monthlyCheck.days_until_reset,
          upgrade_message: upgradeMessage,
          upgrade_url: 'https://enostics.com/dashboard/settings/billing'
        }, {
          status: 429,
          headers: {
            'X-Usage-Limit-Type': monthlyCheck.limit_type || 'unknown',
            'X-Usage-Limit': monthlyCheck.limit?.toString() || '10000',
            'X-Usage-Current': monthlyCheck.current_usage?.toString() || '0',
            'X-Usage-Remaining': monthlyCheck.limit && monthlyCheck.current_usage 
              ? (monthlyCheck.limit - monthlyCheck.current_usage).toString() 
              : '0',
            'X-Usage-Reset-Days': monthlyCheck.days_until_reset?.toString() || '0',
                         'Retry-After': ((monthlyCheck.days_until_reset || 1) * 24 * 60 * 60).toString() // seconds
          }
        })
      }
    }

    // Also check hourly rate limits (existing logic)
    const hourlyCheck = await rateLimitMiddleware(request, userId)
    if (!hourlyCheck.success) {
      return hourlyCheck
    }

    // Track the usage after successful checks
    if (endpointId) {
      await trackUsage(userId, endpointId, {
        request_count: 1,
        data_bytes: payloadSize
      })
    }

    return {
      success: true,
      headers: {
        'X-Usage-Limit': monthlyCheck.limit?.toString() || '10000',
        'X-Usage-Current': ((monthlyCheck.current_usage || 0) + 1).toString(),
        'X-Usage-Remaining': monthlyCheck.limit && monthlyCheck.current_usage 
          ? (monthlyCheck.limit - monthlyCheck.current_usage - 1).toString()
          : '9999',
        'X-Usage-Percentage': monthlyCheck.percentage_used 
          ? Math.round(monthlyCheck.percentage_used + (100 / (monthlyCheck.limit || 10000))).toString()
          : '0',
        'X-Plan-Type': 'citizen'
      }
    }
  } catch (error) {
    console.error('Error in enhanced rate limiting:', error)
    
    // Fall back to basic rate limiting if enhanced fails
    const hourlyCheck = await rateLimitMiddleware(request, userId)
    if (!hourlyCheck.success) {
      return hourlyCheck
    }

    return { success: true }
  }
}

/**
 * Get appropriate upgrade message based on limit type
 */
function getUpgradeMessage(limitType?: string): string {
  switch (limitType) {
    case 'requests':
      return 'Upgrade to Developer plan for 50,000 requests/month, or Business plan for 500,000 requests/month'
    case 'storage':
      return 'Upgrade to Developer plan for 1GB storage, or Business plan for 10GB storage'
    case 'payload_size':
      return 'Upgrade to Developer plan for 10MB payloads, or Business plan for 100MB payloads'
    case 'webhooks':
      return 'Upgrade to Developer plan for 10,000 webhook calls/month, or Business plan for unlimited webhooks'
    case 'ai':
      return 'Upgrade to Developer plan for 1,000 AI executions/month, or Business plan for unlimited AI executions'
    default:
      return 'Upgrade to Developer plan ($29/month) or Business plan ($99/month) for higher limits'
  }
}

/**
 * Check if user is near any limits and should see upgrade prompts
 */
export async function shouldShowUpgradePrompt(userId: string): Promise<{
  show: boolean
  reason?: string
  percentage?: number
  limit_type?: string
}> {
  try {
    const usageCheck = await checkUsageLimits(userId)
    
    if (!usageCheck.allowed) {
      return {
        show: true,
        reason: 'Limit exceeded',
        percentage: 100,
        limit_type: usageCheck.limit_type
      }
    }

    // Show upgrade prompt if over 80% usage
    if (usageCheck.percentage_used && usageCheck.percentage_used >= 80) {
      return {
        show: true,
        reason: `You're using ${Math.round(usageCheck.percentage_used)}% of your monthly limit`,
        percentage: usageCheck.percentage_used,
        limit_type: 'requests'
      }
    }

    return { show: false }
  } catch (error) {
    console.error('Error checking upgrade prompt:', error)
    return { show: false }
  }
}

/**
 * Create response headers for successful requests
 */
export function createEnhancedUsageHeaders(
  currentUsage: number,
  limit: number,
  planType: string = 'citizen'
): Record<string, string> {
  const remaining = Math.max(0, limit - currentUsage)
  const percentage = Math.min(100, (currentUsage / limit) * 100)
  
  return {
    'X-Usage-Limit': limit.toString(),
    'X-Usage-Current': currentUsage.toString(), 
    'X-Usage-Remaining': remaining.toString(),
    'X-Usage-Percentage': Math.round(percentage).toString(),
    'X-Plan-Type': planType,
    'X-Days-Until-Reset': new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate().toString()
  }
}

/**
 * Middleware for webhook usage tracking
 */
export async function trackWebhookUsage(
  userId: string,
  endpointId: string
): Promise<boolean> {
  try {
    return await trackUsage(userId, endpointId, {
      webhook_calls: 1
    })
  } catch (error) {
    console.error('Error tracking webhook usage:', error)
    return false
  }
}

/**
 * Middleware for AI execution usage tracking
 */
export async function trackAIUsage(
  userId: string,
  endpointId: string
): Promise<boolean> {
  try {
    return await trackUsage(userId, endpointId, {
      ai_executions: 1
    })
  } catch (error) {
    console.error('Error tracking AI usage:', error)
    return false
  }
} 