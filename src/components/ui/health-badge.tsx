import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react'

interface HealthBadgeProps {
  successRate: number
  totalRequests: number
  showIcon?: boolean
  showText?: boolean
  className?: string
}

export function HealthBadge({ 
  successRate, 
  totalRequests, 
  showIcon = true, 
  showText = true,
  className 
}: HealthBadgeProps) {
  const getHealthStatus = () => {
    if (totalRequests === 0) {
      return {
        status: 'unknown',
        variant: 'outline' as const,
        icon: Activity,
        text: 'No Data',
        color: 'text-enostics-gray-400'
      }
    }
    
    if (successRate >= 0.9) {
      return {
        status: 'healthy',
        variant: 'success' as const,
        icon: CheckCircle,
        text: 'Healthy',
        color: 'text-green-400'
      }
    } else if (successRate >= 0.7) {
      return {
        status: 'degraded',
        variant: 'warning' as const,
        icon: AlertTriangle,
        text: 'Degraded',
        color: 'text-yellow-400'
      }
    } else {
      return {
        status: 'erroring',
        variant: 'destructive' as const,
        icon: XCircle,
        text: 'Erroring',
        color: 'text-red-400'
      }
    }
  }

  const health = getHealthStatus()
  const Icon = health.icon

  return (
    <Badge variant={health.variant} className={className}>
      <div className="flex items-center gap-1">
        {showIcon && <Icon className="h-3 w-3" />}
        {showText && (
          <span className="text-xs">
            {health.text}
            {totalRequests > 0 && (
              <span className="ml-1 opacity-75">
                ({Math.round(successRate * 100)}%)
              </span>
            )}
          </span>
        )}
      </div>
    </Badge>
  )
}

// Helper hook to calculate health from analytics data
export function useEndpointHealth(analytics: {
  totalRequests: number
  successRequests: number
}) {
  const successRate = analytics.totalRequests > 0 
    ? analytics.successRequests / analytics.totalRequests 
    : 0

  return {
    successRate,
    totalRequests: analytics.totalRequests,
    isHealthy: successRate >= 0.9,
    isDegraded: successRate >= 0.7 && successRate < 0.9,
    isErroring: successRate < 0.7 && analytics.totalRequests > 0
  }
} 