'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { 
  Home,
  Database,
  X,
  Mail,
  BarChart3,
  Key,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Bot,
  Workflow,
  Plug,
  Server,
  Wrench,
  Activity
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Main navigation items - now includes all features
const mainNavigation = [
  { 
    name: 'Chat', 
    href: '/dashboard/chat', 
    icon: Bot, 
    description: 'Chat with your AI models'
  },
  { 
    name: 'Inbox', 
    href: '/dashboard', 
    icon: Mail, 
    description: 'Your universal personal inbox'
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3, 
    description: 'Real-time monitoring and insights'
  },
  { 
    name: 'Endpoints', 
    href: '/dashboard/endpoints', 
    icon: Server, 
    description: 'Manage your API endpoints'
  },
  { 
    name: 'Agents', 
    href: '/dashboard/agents', 
    icon: Bot, 
    description: 'AI agent management'
  },
  { 
    name: 'Workflows', 
    href: '/dashboard/workflows', 
    icon: Workflow, 
    description: 'Automate your processes'
  },
  { 
    name: 'Keys', 
    href: '/dashboard/keys', 
    icon: Key, 
    description: 'Manage authentication keys'
  },
  { 
    name: 'Data', 
    href: '/dashboard/data', 
    icon: Database, 
    description: 'View and manage your data'
  },
  { 
    name: 'Business', 
    href: '/dashboard/business', 
    icon: Home, 
    description: 'Multi-endpoint management'
  },
  { 
    name: 'Tools', 
    href: '/dashboard/ai-tools', 
    icon: Wrench, 
    description: 'Advanced AI utilities'
  },
  { 
    name: 'Domains', 
    href: '/dashboard/domains', 
    icon: Globe, 
    description: 'Custom domain management'
  },
]

// Bottom navigation items - removed to simplify
const bottomNavigation: any[] = []

type SidebarState = 'collapsed' | 'default' | 'expanded'

interface EnhancedDashboardSidebarProps {
  className?: string
  mobileMenuOpen?: boolean
  onClose?: () => void
  onSidebarStateChange?: (state: SidebarState) => void
}

export function EnhancedDashboardSidebar({ 
  className = '', 
  mobileMenuOpen = false, 
  onClose,
  onSidebarStateChange
}: EnhancedDashboardSidebarProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>('collapsed')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userTier, setUserTier] = useState<'free' | 'developer' | 'business'>('free')

  const pathname = usePathname()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting user:', error)
          return
        }
        
        if (mounted) {
          setUser(user)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error in getUser:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getUser()

    return () => {
      mounted = false
    }
  }, [supabase.auth])

  const toggleSection = (section: string) => {
    // No longer needed - removed coming soon sections
  }

  const handleSidebarStateChange = (newState: SidebarState) => {
    setSidebarState(newState)
    onSidebarStateChange?.(newState)
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getStatusIndicator = (status?: string) => {
    // Remove status indicators for Chat, Inbox, and Analytics
    return null
  }

  const handleMouseEnter = () => {
    if (sidebarState === 'collapsed') {
      handleSidebarStateChange('default')
    }
  }

  const handleMouseLeave = () => {
    if (sidebarState === 'default') {
      handleSidebarStateChange('collapsed')
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={clsx(
          'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300',
          sidebarState === 'collapsed' ? 'lg:w-16' : 
          sidebarState === 'expanded' ? 'lg:w-80' : 'lg:w-64',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--border-color))]">
          <SidebarContent
            user={user}
            pathname={pathname}
            onSignOut={handleSignOut}
            loading={loading}
            userTier={userTier}
            sidebarState={sidebarState}
            setSidebarState={handleSidebarStateChange}
            getStatusIndicator={getStatusIndicator}
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={clsx(
        'lg:hidden fixed inset-0 z-50 transition-opacity duration-300',
        mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        {/* Backdrop */}
        <div 
          className={clsx(
            'fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={onClose}
        />
        
        {/* Sidebar */}
        <div className={clsx(
          'fixed left-0 top-0 h-full w-64 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--border-color))] transform transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <SidebarContent
            user={user}
            pathname={pathname}
            onSignOut={handleSignOut}
            loading={loading}
            userTier={userTier}
            sidebarState={sidebarState}
            setSidebarState={handleSidebarStateChange}
            getStatusIndicator={getStatusIndicator}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  )
}

interface SidebarContentProps {
  user: any
  pathname: string
  onSignOut: () => void
  loading: boolean
  userTier: 'free' | 'developer' | 'business'
  sidebarState: SidebarState
  setSidebarState: (state: SidebarState) => void
  getStatusIndicator: (status?: string) => React.ReactNode
  onClose?: () => void
}

function SidebarContent({
  user,
  pathname,
  onSignOut,
  loading,
  userTier,
  sidebarState,
  setSidebarState,
  getStatusIndicator,
  onClose
}: SidebarContentProps) {
  const isCollapsed = sidebarState === 'collapsed'

  const renderNavItem = (item: any, showBadge = true) => {
    const isActive = pathname === item.href
    
    return (
      <Link
        key={item.name}
        href={item.href}
        className={clsx(
          'flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium transition-all duration-200',
          isActive 
            ? 'bg-[hsl(var(--nav-active-bg))] text-[hsl(var(--nav-active-text))]' 
            : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--hover-bg))]',
          isCollapsed ? 'justify-center' : ''
        )}
      >
        <div className="flex items-center gap-2">
          <item.icon className="h-5 w-5 shrink-0" />
          {getStatusIndicator(item.status)}
        </div>
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.name}</span>
            {showBadge && item.status && (
              <Badge 
                variant="outline" 
                className="text-xs px-1.5 py-0.5 border-current opacity-60"
              >
                {item.status}
              </Badge>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border-color))]">
        <div className="px-3 py-4">
          <Link 
            href="/" 
            className={clsx(
              'flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium transition-all duration-200 hover:bg-[hsl(var(--hover-bg))] h-9',
              isCollapsed ? 'justify-center' : ''
            )}
          >
            <img src="/enostics.png" alt="Enostics" className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <h1 className="text-lg font-bold text-[hsl(var(--text-primary))]">
                enostics
              </h1>
            )}
          </Link>
        </div>
        
        {onClose && (
          <div className="absolute top-4 right-4 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-1 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--hover-bg))]"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavigation.map(item => renderNavItem(item))}
        </div>

        {/* Bottom Navigation */}
        {!isCollapsed && (
          <div className="space-y-1">
            {bottomNavigation.map(item => renderNavItem(item, false))}
          </div>
        )}
      </nav>

      {/* Usage section */}
      <div className="border-t border-[hsl(var(--border-color))] px-3 py-4">
        <Link 
          href="/dashboard/usage"
          className={clsx(
            'flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium transition-all duration-200',
            pathname === '/dashboard/usage' 
              ? 'bg-[hsl(var(--nav-active-bg))] text-[hsl(var(--nav-active-text))]' 
              : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--hover-bg))]',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 shrink-0" />
          </div>
          {!isCollapsed && (
            <span className="flex-1">Usage</span>
          )}
        </Link>
      </div>
    </div>
  )
} 