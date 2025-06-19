import { ReactNode } from 'react'
import { DashboardLayoutClient } from './layout-client'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-[hsl(var(--secondary-bg))]">
      <DashboardLayoutClient>
        {children}
      </DashboardLayoutClient>
    </div>
  )
} 