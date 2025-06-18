import { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SectionHeader } from '@/components/ui/section-header'
import { cn } from '@/lib/utils'

interface DashboardPanelProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  }
  action?: ReactNode
  lastUpdated?: Date
  children: ReactNode
  className?: string
  contentClassName?: string
  loading?: boolean
  error?: string | null
}

export function DashboardPanel({
  title,
  subtitle,
  icon,
  badge,
  action,
  lastUpdated,
  children,
  className,
  contentClassName,
  loading = false,
  error = null
}: DashboardPanelProps) {
  return (
    <Card variant="glass" className={cn('rounded-2xl', className)}>
      <CardHeader className="p-6 pb-4">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          badge={badge}
          action={action}
          lastUpdated={lastUpdated}
        />
      </CardHeader>
      <CardContent className={cn('p-6 pt-0', contentClassName)}>
        {error ? (
          <div className="flex items-center justify-center py-8 text-red-400">
            <div className="text-center">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm text-enostics-gray-400 mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-enostics-blue mx-auto" />
              <p className="text-sm text-enostics-gray-400">Loading...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

// Specialized panels for common patterns
export function DataPanel({ 
  title, 
  subtitle, 
  icon, 
  data, 
  emptyMessage = 'No data available', 
  emptyIcon,
  children,
  ...props 
}: DashboardPanelProps & { 
  data?: any[] 
  emptyMessage?: string
  emptyIcon?: ReactNode
}) {
  const isEmpty = !data || data.length === 0

  return (
    <DashboardPanel
      title={title}
      subtitle={subtitle}
      icon={icon}
      {...props}
    >
      {isEmpty ? (
        <div className="text-center py-12 text-enostics-gray-400">
          {emptyIcon && <div className="mb-4 flex justify-center">{emptyIcon}</div>}
          <p className="text-lg font-medium mb-2">No Data</p>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </DashboardPanel>
  )
}

export function FormPanel({ 
  title, 
  subtitle, 
  icon, 
  onSubmit,
  submitLabel = 'Save',
  submitDisabled = false,
  submitLoading = false,
  children,
  ...props 
}: DashboardPanelProps & {
  onSubmit?: () => void
  submitLabel?: string
  submitDisabled?: boolean
  submitLoading?: boolean
}) {
  return (
    <DashboardPanel
      title={title}
      subtitle={subtitle}
      icon={icon}
      {...props}
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit?.() }} className="space-y-6">
        {children}
        {onSubmit && (
          <div className="flex justify-end pt-4 border-t border-enostics-gray-700">
            <button
              type="submit"
              disabled={submitDisabled || submitLoading}
              className="px-6 py-2 bg-enostics-blue text-white rounded-lg hover:bg-enostics-blue/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              {submitLabel}
            </button>
          </div>
        )}
      </form>
    </DashboardPanel>
  )
} 