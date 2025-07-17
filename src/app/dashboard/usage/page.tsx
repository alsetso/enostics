'use client'

import { EnhancedUsageDashboard } from '@/components/features/enhanced-usage-dashboard'

export default function UsagePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Usage</h1>
        <p className="text-[hsl(var(--text-secondary))]">
          Monitor your API usage, track performance metrics, and manage your plan limits.
        </p>
      </div>
      
      <EnhancedUsageDashboard />
    </div>
  )
} 