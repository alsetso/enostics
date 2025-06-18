'use client'

import { useState } from 'react'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'

interface DashboardLayoutClientProps {
  children: React.ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMobileMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <PageWrapper 
      variant="dashboard"
      navbarVariant="none"
      onMobileMenuClick={handleMobileMenuClick}
      sidebar={<DashboardSidebar mobileMenuOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />}
    >
      {children}
    </PageWrapper>
  )
} 