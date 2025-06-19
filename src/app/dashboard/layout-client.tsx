'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { EnhancedDashboardSidebar } from '@/components/layout/enhanced-dashboard-sidebar-new'
import { DashboardTopNav } from '@/components/layout/dashboard-topnav'

interface DashboardLayoutClientProps {
  children: React.ReactNode
}

// Page title mapping
const getPageTitle = (pathname: string) => {
  const routes: Record<string, { title: string; subtitle?: string }> = {
    '/dashboard': { title: 'Inbox', subtitle: 'Your universal personal inbox' },
    '/dashboard/chat': { title: 'Chat', subtitle: 'Chat with your AI models' },
    '/dashboard/analytics': { title: 'Analytics', subtitle: 'Real-time monitoring and insights' },
    '/dashboard/endpoints': { title: 'Endpoints', subtitle: 'Manage your API endpoints' },
    '/dashboard/agents': { title: 'AI Agents', subtitle: 'Deploy intelligent agents on your endpoints' },
    '/dashboard/workflows': { title: 'Workflows', subtitle: 'Automate data processing with custom workflows' },
    '/dashboard/integrations': { title: 'Integrations', subtitle: 'Connect with external services and platforms' },
    '/dashboard/business': { title: 'Business', subtitle: 'Multi-endpoint management' },
    '/dashboard/webhooks': { title: 'Webhooks', subtitle: 'Forward requests to external URLs' },
    '/dashboard/keys': { title: 'API Keys', subtitle: 'Manage authentication keys' },
    '/dashboard/data': { title: 'Data', subtitle: 'View and manage your data' },
    '/dashboard/ai-tools': { title: 'AI Tools', subtitle: 'Advanced AI-powered tools for data analysis' },
    '/dashboard/domains': { title: 'Custom Domains', subtitle: 'Use your own domain for endpoints' },
    '/dashboard/playground': { title: 'Playground', subtitle: 'Test endpoints with custom payloads' },
    '/dashboard/profile': { title: 'Profile', subtitle: 'Personal information and settings' },
    '/dashboard/settings': { title: 'Settings', subtitle: 'Account and system settings' },
    '/dashboard/settings/billing': { title: 'Billing', subtitle: 'Subscription and payment settings' },
    '/dashboard/settings/email': { title: 'Email Settings', subtitle: 'Configure email preferences' },
    '/dashboard/settings/usage': { title: 'Usage', subtitle: 'Monitor your usage and limits' }
  }

  return routes[pathname] || { title: 'Dashboard', subtitle: undefined }
}

type SidebarState = 'collapsed' | 'default' | 'expanded'

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dynamicSubtitle, setDynamicSubtitle] = useState<string | undefined>()
  const [sidebarState, setSidebarState] = useState<SidebarState>('default')
  const pathname = usePathname()
  const { title, subtitle } = getPageTitle(pathname)

  const handleMobileMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleSidebarStateChange = (state: SidebarState) => {
    setSidebarState(state)
  }

  const getMainContentMargin = () => {
    switch (sidebarState) {
      case 'collapsed':
        return 'lg:ml-16'
      case 'expanded':
        return 'lg:ml-80'
      default:
        return 'lg:ml-64'
    }
  }

  const getTopNavMargin = () => {
    switch (sidebarState) {
      case 'collapsed':
        return 'lg:left-16'
      case 'expanded':
        return 'lg:left-80'
      default:
        return 'lg:left-64'
    }
  }

  // Listen for dynamic subtitle updates from child components
  useEffect(() => {
    const handleSubtitleUpdate = (event: CustomEvent) => {
      setDynamicSubtitle(event.detail.subtitle)
    }

    window.addEventListener('updateSubtitle', handleSubtitleUpdate as EventListener)
    
    return () => {
      window.removeEventListener('updateSubtitle', handleSubtitleUpdate as EventListener)
    }
  }, [])

  // Reset dynamic subtitle when route changes
  useEffect(() => {
    setDynamicSubtitle(undefined)
  }, [pathname])

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <EnhancedDashboardSidebar 
        mobileMenuOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        onSidebarStateChange={handleSidebarStateChange}
      />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 bg-[hsl(var(--secondary-bg))] ${getMainContentMargin()}`}>
        {/* Global Top Navigation */}
        <DashboardTopNav 
          title={title}
          subtitle={dynamicSubtitle || subtitle}
          onMobileMenuClick={handleMobileMenuClick}
          sidebarState={sidebarState}
        />
        
        {/* Page Content */}
        <div className="pt-20 h-full">
          {children}
        </div>
      </div>
    </div>
  )
} 