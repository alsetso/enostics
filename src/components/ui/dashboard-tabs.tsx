'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabItem {
  key: string
  label: string
  icon: ReactNode
  description: string
  count?: number
  disabled?: boolean
}

interface DashboardTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (key: string) => void
  className?: string
}

export function DashboardTabs({ tabs, activeTab, onTabChange, className }: DashboardTabsProps) {
  return (
    <div className={cn('border-b border-enostics-gray-700', className)}>
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          const isDisabled = tab.disabled
          
          return (
            <button
              key={tab.key}
              onClick={() => !isDisabled && onTabChange(tab.key)}
              disabled={isDisabled}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 group relative',
                'focus:outline-none focus:ring-2 focus:ring-enostics-blue focus:ring-offset-2 focus:ring-offset-enostics-gray-900',
                isActive
                  ? 'border-enostics-blue text-enostics-blue'
                  : isDisabled
                  ? 'border-transparent text-enostics-gray-600 cursor-not-allowed'
                  : 'border-transparent text-enostics-gray-400 hover:text-enostics-gray-300 hover:border-enostics-gray-300'
              )}
              title={tab.description}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  'transition-colors',
                  isActive ? 'text-enostics-blue' : 'text-inherit'
                )}>
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={cn(
                    'ml-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    isActive
                      ? 'bg-enostics-blue/20 text-enostics-blue'
                      : 'bg-enostics-gray-700 text-enostics-gray-300'
                  )}>
                    {tab.count}
                  </span>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                <div className="bg-enostics-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-enostics-gray-600 shadow-lg">
                  {tab.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="border-4 border-transparent border-t-enostics-gray-800"></div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// Breadcrumb component for sub-navigation
interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg
              className="flex-shrink-0 h-4 w-4 text-enostics-gray-500 mx-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          
          <div className="flex items-center gap-1">
            {item.icon && (
              <div className="text-enostics-gray-400">{item.icon}</div>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="text-enostics-gray-400 hover:text-enostics-gray-300 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className={cn(
                index === items.length - 1
                  ? 'text-white font-medium'
                  : 'text-enostics-gray-400'
              )}>
                {item.label}
              </span>
            )}
          </div>
        </div>
      ))}
    </nav>
  )
}

// Status indicator component for consistency
interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending'
  label: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function StatusIndicator({ status, label, size = 'md', showIcon = true }: StatusIndicatorProps) {
  const statusConfig = {
    success: {
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      borderColor: 'border-green-400/30',
      icon: '●'
    },
    warning: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
      borderColor: 'border-yellow-400/30',
      icon: '▲'
    },
    error: {
      color: 'text-red-400',
      bgColor: 'bg-red-400/20',
      borderColor: 'border-red-400/30',
      icon: '✕'
    },
    info: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      borderColor: 'border-blue-400/30',
      icon: 'ⓘ'
    },
    pending: {
      color: 'text-enostics-gray-400',
      bgColor: 'bg-enostics-gray-400/20',
      borderColor: 'border-enostics-gray-400/30',
      icon: '○'
    }
  }

  const config = statusConfig[status]
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border font-medium',
      config.bgColor,
      config.borderColor,
      config.color,
      sizeClasses[size]
    )}>
      {showIcon && <span>{config.icon}</span>}
      {label}
    </span>
  )
} 