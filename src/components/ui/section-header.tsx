import { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  }
  action?: ReactNode
  lastUpdated?: Date
  className?: string
}

export function SectionHeader({ 
  title, 
  subtitle, 
  icon, 
  badge, 
  action, 
  lastUpdated, 
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-enostics-blue">{icon}</div>}
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              {title}
              {badge && (
                <Badge variant={badge.variant || 'outline'} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </h2>
            {subtitle && (
              <p className="text-sm text-enostics-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {lastUpdated && (
        <p className="text-xs text-enostics-gray-500">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}
    </div>
  )
} 