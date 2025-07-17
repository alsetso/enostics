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
  Play,
  Webhook,
  Key,
  Sparkles,
  MessageCircle
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UpgradeModal } from '@/components/features/upgrade-modal'

// Simplified navigation - core features only
const navigation = [
  { name: 'Inbox', href: '/dashboard', icon: Mail, description: 'Your universal personal inbox for receiving data' },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageCircle, description: 'Chat with your local AI models' },
  { name: 'Business', href: '/dashboard/business', icon: Home, description: 'Multi-endpoint management and business features' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Real-time monitoring and performance metrics' },
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook, description: 'Forward requests to external URLs' },
  { name: 'API Keys', href: '/dashboard/keys', icon: Key, description: 'Manage authentication keys' },
  { name: 'Data', href: '/dashboard/data', icon: Database, description: 'View and manage your data' },
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
  const [upgradeFeature, setUpgradeFeature] = useState<string>('')

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
    switch (item.name) {
      case 'Chat':
        return item.badge || undefined
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
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 flex z-50 lg:hidden',
        isOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={handleClose} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-enostics-gray-900 dark:bg-gray-900">
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
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
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
        />
      </div>

      {/* Modals */}
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
  onClose?: () => void
  loading?: boolean
  navigation: any[]
  getNavItemBadge: (item: any) => number | string | undefined
  isNavItemDisabled: (item: any) => boolean
  userTier: 'free' | 'developer' | 'business'
  onShowUpgrade: (feature: string) => void
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
  onShowUpgrade
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between p-6 pt-6 border-b border-enostics-gray-800 dark:border-gray-800 light:border-gray-200">
        <div className="flex items-center">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <img src="/enostics.png" alt="Enostics" className="h-6 w-6" />
            <h1 className="text-xl font-bold text-white dark:text-white light:text-gray-900 hover:text-enostics-blue transition-colors">
              enostics
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              className="text-enostics-gray-400 hover:text-white lg:hidden dark:text-gray-400 dark:hover:text-white light:text-gray-600 light:hover:text-gray-900"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Quick actions */}
      {/* Removed all quick action buttons for Upgrade/View Plans */}

      {/* Navigation - Scrollable middle section */}
      <nav className="flex-1 px-6 overflow-y-auto">
        <ul role="list" className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/dashboard') ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            const badge = getNavItemBadge(item)
            const disabled = isNavItemDisabled(item)
            
            return (
              <li key={item.name}>
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
                    isActive
                      ? 'bg-white/10 dark:bg-white/10 light:bg-gray-100 text-white dark:text-white light:text-gray-900 shadow-lg'
                      : disabled
                      ? 'text-enostics-gray-600 dark:text-gray-600 light:text-gray-400 cursor-not-allowed'
                      : 'text-enostics-gray-300 dark:text-gray-300 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-enostics-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-100'
                  )}
                  title={disabled ? `${item.description} (Create an endpoint first)` : item.description}
                >
                  <item.icon
                    className={clsx(
                      'h-5 w-5 shrink-0 transition-colors',
                      isActive
                        ? 'text-white dark:text-white light:text-gray-900'
                        : disabled
                        ? 'text-enostics-gray-600 dark:text-gray-600 light:text-gray-400'
                        : 'text-enostics-gray-400 dark:text-gray-400 light:text-gray-500 group-hover:text-white dark:group-hover:text-white light:group-hover:text-gray-900'
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {badge && (typeof badge === 'string' || badge > 0) && (
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
                  {disabled && (
                    <div className="absolute inset-0 bg-enostics-gray-900/50 rounded-md" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section - Beta button and Enostics info */}
      <div className="border-t border-enostics-gray-800 dark:border-gray-800 light:border-gray-200 p-6 flex flex-col gap-4">
        <Link href="/beta" passHref legacyBehavior>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-enostics-blue border-enostics-blue hover:bg-enostics-blue hover:text-white transition-colors"
        >
          <Sparkles className="h-4 w-4" />
            Beta
        </Button>
        </Link>
        <div className="mt-4 text-xs text-enostics-gray-400 leading-snug select-none">
          <div className="font-bold text-enostics-blue mb-1">enostics</div>
          <div className="mb-1">v.1.0.0.1</div>
          <div>The system by which a person receives, processes, and store intelligent data through a personal interface</div>
        </div>
      </div>
    </div>
  )
} 