'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { 
  Home,
  Settings,
  Database,
  X,
  LogOut,
  User,
  Mail,
  BarChart3,
  Key,
  Globe,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Bot,
  BookOpen,
  Workflow,
  Plug,
  Server,
  Wrench
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UpgradeModal } from '@/components/features/upgrade-modal'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Main MVP navigation items
const mainNavigation = [
  { 
    name: 'Chat', 
    href: '/dashboard/chat', 
    icon: Bot, 
    description: 'Chat with your AI models',
    status: 'live'
  },
  { 
    name: 'Inbox', 
    href: '/dashboard', 
    icon: Mail, 
    description: 'Your universal personal inbox',
    status: 'live'
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3, 
    description: 'Real-time monitoring and insights',
    status: 'live'
  },
]

// Coming Soon features
const comingSoonNavigation = [
  { 
    name: 'Endpoints', 
    href: '/dashboard/endpoints', 
    icon: Server, 
    description: 'Manage your API endpoints',
    locked: true
  },
  { 
    name: 'Agents', 
    href: '/dashboard/agents', 
    icon: Bot, 
    description: 'AI agent management',
    locked: true
  },
  { 
    name: 'Workflows', 
    href: '/dashboard/workflows', 
    icon: Workflow, 
    description: 'Automate your processes',
    locked: true
  },
  { 
    name: 'Integrations', 
    href: '/dashboard/integrations', 
    icon: Plug, 
    description: 'Connect external services',
    locked: true
  },
  { 
    name: 'API Keys', 
    href: '/dashboard/keys', 
    icon: Key, 
    description: 'Manage authentication keys',
    locked: true
  },
  { 
    name: 'Data', 
    href: '/dashboard/data', 
    icon: Database, 
    description: 'View and manage your data',
    locked: true
  },
  { 
    name: 'Business', 
    href: '/dashboard/business', 
    icon: Home, 
    description: 'Multi-endpoint management',
    locked: true
  },
  { 
    name: 'AI Tools', 
    href: '/dashboard/ai-tools', 
    icon: Wrench, 
    description: 'Advanced AI utilities',
    locked: true
  },
  { 
    name: 'Domains', 
    href: '/dashboard/domains', 
    icon: Globe, 
    description: 'Custom domain management',
    locked: true
  },
]

// Bottom navigation items
const bottomNavigation = [
  { 
    name: 'Documentation', 
    href: '/docs', 
    icon: BookOpen, 
    description: 'API documentation and guides'
  },
  { 
    name: 'Profile', 
    href: '/dashboard/profile', 
    icon: User, 
    description: 'Personal settings'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings, 
    description: 'Account settings'
  },
]

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
  const [sidebarState, setSidebarState] = useState<SidebarState>('default')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userTier, setUserTier] = useState<'free' | 'developer' | 'business'>('free')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    comingSoon: false
  })

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleSidebarStateChange = (newState: SidebarState) => {
    setSidebarState(newState)
    onSidebarStateChange?.(newState)
  }

  const getStatusIndicator = (status?: string) => {
    if (!status) return null
    
    const statusColors = {
      live: 'bg-green-500',
      new: 'bg-blue-500',
      beta: 'bg-orange-500',
      active: 'bg-blue-500'
    }

    return (
      <div 
        className={clsx(
          'w-2 h-2 rounded-full',
          statusColors[status as keyof typeof statusColors] || 'bg-gray-500'
        )}
      />
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={clsx(
        'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300',
        sidebarState === 'collapsed' ? 'lg:w-16' : 
        sidebarState === 'expanded' ? 'lg:w-80' : 'lg:w-64',
        className
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--border-color))]">
          <SidebarContent
            user={user}
            pathname={pathname}
            onSignOut={handleSignOut}
            loading={loading}
            userTier={userTier}
            sidebarState={sidebarState}
            setSidebarState={handleSidebarStateChange}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            getStatusIndicator={getStatusIndicator}
            onShowUpgrade={(feature) => {
              setUpgradeFeature(feature)
              setShowUpgradeModal(true)
            }}
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
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            getStatusIndicator={getStatusIndicator}
            onShowUpgrade={(feature) => {
              setUpgradeFeature(feature)
              setShowUpgradeModal(true)
            }}
            onClose={onClose}
          />
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
      />
    </>
  )
}

interface SidebarContentProps {
  user?: any
  pathname: string
  onSignOut: () => void
  loading?: boolean
  userTier: 'free' | 'developer' | 'business'
  sidebarState: SidebarState
  setSidebarState: (state: SidebarState) => void
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
  getStatusIndicator: (status?: string) => React.ReactNode
  onShowUpgrade: (feature: string) => void
  onClose?: () => void
}

function SidebarContent({ 
  user, 
  pathname, 
  onSignOut, 
  loading = false,
  userTier,
  sidebarState,
  setSidebarState,
  expandedSections,
  toggleSection,
  getStatusIndicator,
  onShowUpgrade,
  onClose
}: SidebarContentProps) {
  const isCollapsed = sidebarState === 'collapsed'

  const renderNavItem = (item: any, showBadge = true) => {
    const isActive = pathname === item.href || 
      (item.href === '/dashboard' && pathname === '/dashboard') ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href))

    return (
      <Link
        key={item.name}
        href={item.href}
        className={clsx(
          'group flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium transition-all duration-200 relative',
          isActive
            ? 'bg-[hsl(var(--hover-bg))] text-[hsl(var(--text-primary))]'
            : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--hover-bg))]',
          isCollapsed ? 'justify-center' : ''
        )}
        title={isCollapsed ? item.description : undefined}
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
            {item.locked && (
              <Badge 
                variant="outline" 
                className="text-xs px-1.5 py-0.5 border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
              >
                Soon
              </Badge>
            )}
          </>
        )}
      </Link>
    )
  }

  const renderSection = (title: string, items: any[], sectionKey?: string) => {
    const isExpanded = sectionKey ? expandedSections[sectionKey] : true
    
    return (
      <div className="space-y-1">
        {!isCollapsed && sectionKey && (
          <button
            onClick={() => toggleSection(sectionKey)}
            className="flex items-center justify-between w-full p-2 text-xs font-semibold text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))] transition-colors"
          >
            <span>{title}</span>
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        {(isExpanded || isCollapsed) && (
          <div className="space-y-1">
            {items.map(item => renderNavItem(item))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border-color))]">
        {!isCollapsed && (
          <Link href="/dashboard">
            <h1 className="text-lg font-bold text-[hsl(var(--text-primary))]">
              enostics
            </h1>
          </Link>
        )}
        
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarState(
              sidebarState === 'collapsed' ? 'default' : 
              sidebarState === 'default' ? 'expanded' : 'collapsed'
            )}
            className="h-8 w-8 p-1 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--hover-bg))] hidden lg:flex"
          >
            {sidebarState === 'collapsed' ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-1 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--hover-bg))] lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavigation.map(item => renderNavItem(item))}
        </div>

        {/* Coming Soon Section */}
        {renderSection('Coming Soon', comingSoonNavigation, 'comingSoon')}

        {/* Bottom Navigation */}
        {!isCollapsed && (
          <div className="space-y-1">
            {bottomNavigation.map(item => renderNavItem(item, false))}
          </div>
        )}

        {/* Theme Toggle Section */}
        {!isCollapsed && (
          <div className="space-y-1">
            <div className="p-2 text-xs font-semibold text-gray-400 dark:text-gray-400">
              Appearance
            </div>
            <div className="flex items-center justify-between p-2 text-sm text-gray-300 dark:text-gray-300">
              <span>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-[hsl(var(--border-color))] p-4">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[hsl(var(--text-primary))] font-medium truncate">
                    {user.email}
                  </p>
                  <p className="text-[hsl(var(--text-muted))] text-xs">
                    {userTier} plan
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSignOut}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        ) : (
          !isCollapsed && (
            <div className="text-center text-gray-400">
              <p className="text-sm">Not signed in</p>
            </div>
          )
        )}
      </div>
    </div>
  )
} 