'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { 
  Home,
  Settings,
  Database,
  Activity,
  Plus,
  Menu,
  X,
  LogOut,
  User,
  Mail,
  BarChart3,
  Play,
  Webhook,
  Key,
  Globe,
  FileText,
  Lock,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UpgradeModal } from '@/components/features/upgrade-modal'
import { ComposeMessageModal } from '@/components/features/compose-message-modal'

// Updated navigation with subscription-based structure and sub-pages
const navigation = [
  { name: 'Inbox', href: '/dashboard', icon: Mail, description: 'Your universal personal inbox for receiving data', tier: 'free' },
  { name: 'Business', href: '/dashboard/business', icon: Home, description: 'Multi-endpoint management and business features', tier: 'business' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Real-time monitoring and performance metrics', tier: 'business', isSubPage: true },
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook, description: 'Forward requests to external URLs', tier: 'business', isSubPage: true },
  { name: 'API Keys', href: '/dashboard/keys', icon: Key, description: 'Manage authentication keys', tier: 'business', isSubPage: true },
  { name: 'Data', href: '/dashboard/data', icon: Database, description: 'View and manage your data', tier: 'business', isSubPage: true },
  { name: 'Playground', href: '/dashboard/playground', icon: Play, description: 'Test endpoints with custom payloads', tier: 'free' },
  { name: 'Profile', href: '/dashboard/profile', icon: User, description: 'Personal information and settings', tier: 'free' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'Account and system settings', tier: 'free' },
]

interface DashboardSidebarProps {
  className?: string
  mobileMenuOpen?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ className = '', mobileMenuOpen = false, onClose }: DashboardSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userTier, setUserTier] = useState<'free' | 'developer' | 'business'>('free')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState<string>('')
  const [businessExpanded, setBusinessExpanded] = useState(false)
  const [stats, setStats] = useState({
    endpoints: 0,
    apiKeys: 0,
    totalRequests: 0
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
          if (user?.id) {
            await fetchStats(user.id)
          }
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchStats(session.user.id)
        }
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Remove supabase.auth from dependencies to prevent unnecessary re-renders

  const fetchStats = async (userId: string) => {
    if (!userId) return

    try {
      // Fetch user profile to get subscription info
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('user_id', userId)
        .single()

      // Set user tier (default to free if no subscription info)
      const tier = profile?.subscription_tier
      setUserTier(tier === 'business' ? 'business' : tier === 'developer' ? 'developer' : 'free')

      // Fetch endpoints count
      const { data: endpoints } = await supabase
        .from('enostics_endpoints')
        .select('id')
        .eq('user_id', userId)

      // Fetch API keys count
      const { data: apiKeys } = await supabase
        .from('enostics_api_keys')
        .select('id')
        .eq('user_id', userId)

      // Fetch total requests count
      const { data: requests } = await supabase
        .from('enostics_data')
        .select('id')
        .eq('user_id', userId)

      setStats({
        endpoints: endpoints?.length || 0,
        apiKeys: apiKeys?.length || 0,
        totalRequests: requests?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleClose = () => {
    setSidebarOpen(false)
    onClose?.()
  }

  // Use external mobile menu state if provided, otherwise use internal state
  const isOpen = mobileMenuOpen !== undefined ? mobileMenuOpen : sidebarOpen

  const getNavItemBadge = (item: any) => {
    // Show lock icon for business features if user is on free tier
    if (item.tier === 'business' && userTier === 'free') {
      return 'LOCK'
    }
    
    switch (item.name) {
      case 'Business':
        return stats.endpoints > 0 ? stats.endpoints : undefined
      case 'API Keys':
        return stats.apiKeys > 0 ? stats.apiKeys : undefined
      case 'Analytics':
      case 'Data':
        return stats.totalRequests > 0 ? stats.totalRequests : undefined
      default:
        return undefined
    }
  }

  const isNavItemDisabled = (item: any) => {
    // Business tier features require subscription (developer tier gets some access)
    if (item.tier === 'business' && userTier === 'free') {
      return true
    }
    
    // Some features require at least one endpoint
    switch (item.name) {
      case 'Analytics':
      case 'Data':
        return stats.endpoints === 0
      default:
        return false
    }
  }

  return (
    <>
      {/* Mobile menu button - shows when sidebar is closed */}
      <button
        onClick={() => {
          setSidebarOpen(true)
          onClose?.()
        }}
        className={clsx(
          "fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-enostics-gray-900 border border-enostics-gray-700 text-white transition-transform duration-300",
          isOpen ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Mobile sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-enostics-gray-950 border-r border-enostics-gray-800 transform lg:hidden transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent 
          user={user} 
          pathname={pathname} 
          onSignOut={handleSignOut}
          onClose={handleClose}
          loading={loading}
          navigation={navigation}
          getNavItemBadge={getNavItemBadge}
          isNavItemDisabled={isNavItemDisabled}
          userTier={userTier}
          onShowUpgrade={(feature) => {
            setUpgradeFeature(feature)
            setShowUpgradeModal(true)
          }}
          onShowCompose={() => setShowComposeModal(true)}
          businessExpanded={businessExpanded}
          onToggleBusiness={() => setBusinessExpanded(!businessExpanded)}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-enostics-gray-950 border-r border-enostics-gray-800 z-40 lg:block hidden">
        <SidebarContent 
          user={user} 
          pathname={pathname} 
          onSignOut={handleSignOut}
          loading={loading}
          navigation={navigation}
          getNavItemBadge={getNavItemBadge}
          isNavItemDisabled={isNavItemDisabled}
          userTier={userTier}
          onShowUpgrade={(feature) => {
            setUpgradeFeature(feature)
            setShowUpgradeModal(true)
          }}
          onShowCompose={() => setShowComposeModal(true)}
          businessExpanded={businessExpanded}
          onToggleBusiness={() => setBusinessExpanded(!businessExpanded)}
        />
      </div>

      {/* Modals */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
      />
      
      <ComposeMessageModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        userTier={userTier}
        currentUser={user}
      />
    </>
  )
}

interface SidebarContentProps {
  user?: any
  pathname: string
  onSignOut: () => void
  onClose?: () => void
  loading?: boolean
  navigation: any[]
  getNavItemBadge: (item: any) => number | string | undefined
  isNavItemDisabled: (item: any) => boolean
  userTier: 'free' | 'developer' | 'business'
  onShowUpgrade: (feature: string) => void
  onShowCompose: () => void
  businessExpanded: boolean
  onToggleBusiness: () => void
}

function SidebarContent({ 
  user, 
  pathname, 
  onSignOut, 
  onClose, 
  loading = false,
  navigation,
  getNavItemBadge,
  isNavItemDisabled,
  userTier,
  onShowUpgrade,
  onShowCompose,
  businessExpanded,
  onToggleBusiness
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between p-6 pt-6 border-b border-enostics-gray-800">
        <div className="flex items-center">
          <Link href="/dashboard" onClick={onClose}>
            <h1 className="text-xl font-bold text-white hover:text-enostics-blue transition-colors">
              enostics
            </h1>
          </Link>
        </div>
        {onClose && (
          <button
            type="button"
            className="text-enostics-gray-400 hover:text-white lg:hidden"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Quick action */}
      <div className="p-6 pb-4">
        <Button 
          className="w-full justify-start gap-2" 
          onClick={() => {
            if (userTier === 'free') {
              onShowUpgrade('Compose Message')
            } else {
              onShowCompose()
            }
            onClose?.()
          }}
        >
          <Plus className="h-4 w-4" />
          Compose Message
          {userTier === 'free' && (
            <Lock className="h-4 w-4 opacity-70 ml-auto" />
          )}
        </Button>
      </div>

      {/* Navigation - Scrollable middle section */}
      <nav className="flex-1 px-6 overflow-y-auto">
        <ul role="list" className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/dashboard') ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            const badge = getNavItemBadge(item)
            const disabled = isNavItemDisabled(item)
            
            // Hide sub-pages when business section is collapsed
            if (item.isSubPage && !businessExpanded) {
              return null
            }
            
            return (
              <li key={item.name}>
                {item.name === 'Business' ? (
                  // Special handling for Business section with expand/collapse
                  <button
                    onClick={() => {
                      if (disabled) {
                        onShowUpgrade(item.name)
                      } else {
                        onToggleBusiness()
                      }
                    }}
                    className={clsx(
                      'group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-all duration-200 relative w-full',
                      isActive
                        ? 'bg-enostics-blue text-white shadow-lg'
                        : disabled
                        ? 'text-enostics-gray-600 cursor-not-allowed'
                        : 'text-enostics-gray-300 hover:text-white hover:bg-enostics-gray-800'
                    )}
                    title={disabled ? `${item.description} (Upgrade to Business Plan)` : item.description}
                  >
                    <item.icon
                      className={clsx(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-white'
                          : disabled
                          ? 'text-enostics-gray-600'
                          : 'text-enostics-gray-400 group-hover:text-white'
                      )}
                    />
                    <span className="flex-1 text-left">{item.name}</span>
                    {badge && (typeof badge === 'string' || badge > 0) && (
                      <>
                        {badge === 'LOCK' ? (
                          <Lock className="h-3 w-3 text-enostics-gray-500" />
                        ) : (
                          <Badge 
                            variant={isActive ? "secondary" : "outline"} 
                            className={clsx(
                              "text-xs px-2 py-0.5 mr-2",
                              isActive 
                                ? "bg-white/20 text-white border-white/30" 
                                : "bg-enostics-gray-700 text-enostics-gray-300 border-enostics-gray-600"
                            )}
                          >
                            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {!disabled && (
                      businessExpanded ? (
                        <ChevronDown className="h-4 w-4 text-enostics-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-enostics-gray-400" />
                      )
                    )}
                    {disabled && (
                      <div className="absolute inset-0 bg-enostics-gray-900/50 rounded-md" />
                    )}
                  </button>
                ) : (
                  // Regular navigation items
                  <Link
                    href={disabled ? '#' : item.href}
                    onClick={(e) => {
                      if (disabled) {
                        e.preventDefault()
                        onShowUpgrade(item.name)
                        return
                      }
                      onClose?.()
                    }}
                    className={clsx(
                      'group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-all duration-200 relative',
                      item.isSubPage && 'ml-6 pl-6 border-l border-enostics-gray-700',
                      isActive
                        ? 'bg-enostics-blue text-white shadow-lg'
                        : disabled
                        ? 'text-enostics-gray-600 cursor-not-allowed'
                        : 'text-enostics-gray-300 hover:text-white hover:bg-enostics-gray-800'
                    )}
                    title={disabled ? `${item.description} (Upgrade to Business Plan)` : item.description}
                  >
                    <item.icon
                      className={clsx(
                        item.isSubPage ? 'h-4 w-4' : 'h-5 w-5',
                        'shrink-0 transition-colors',
                        isActive
                          ? 'text-white'
                          : disabled
                          ? 'text-enostics-gray-600'
                          : 'text-enostics-gray-400 group-hover:text-white'
                      )}
                    />
                    <span className={clsx(
                      "flex-1",
                      item.isSubPage && "text-sm"
                    )}>{item.name}</span>
                    {badge && (typeof badge === 'string' || badge > 0) && (
                      <>
                        {badge === 'LOCK' ? (
                          <Lock className="h-3 w-3 text-enostics-gray-500" />
                        ) : (
                          <Badge 
                            variant={isActive ? "secondary" : "outline"} 
                            className={clsx(
                              "text-xs px-2 py-0.5",
                              isActive 
                                ? "bg-white/20 text-white border-white/30" 
                                : "bg-enostics-gray-700 text-enostics-gray-300 border-enostics-gray-600"
                            )}
                          >
                            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {disabled && (
                      <div className="absolute inset-0 bg-enostics-gray-900/50 rounded-md" />
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section - Fixed at bottom */}
      <div className="border-t border-enostics-gray-800 p-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-enostics-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-enostics-gray-700 rounded w-3/4"></div>
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 bg-enostics-blue rounded-full flex items-center justify-center text-white font-medium">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user.email}
                </p>
                <p className="text-enostics-gray-400 text-xs">
                  Active user
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="w-full justify-start gap-2 text-enostics-gray-300 border-enostics-gray-600 hover:bg-enostics-gray-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="text-center text-enostics-gray-400">
            <p className="text-sm">Not signed in</p>
          </div>
        )}
      </div>
    </div>
  )
} 