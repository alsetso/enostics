'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Bell,
  Activity,
  Menu
} from 'lucide-react'
import { NotificationBell } from '@/components/ui/notification-bell'
import { createClientSupabaseClient } from '@/lib/supabase'

interface GlobalNavbarProps {
  variant?: 'homepage' | 'docs' | 'dashboard' | 'default'
  showNotifications?: boolean
  showMobileMenuButton?: boolean
  onMobileMenuClick?: () => void
}

export function GlobalNavbar({ 
  variant = 'default',
  showNotifications = false,
  showMobileMenuButton = false,
  onMobileMenuClick
}: GlobalNavbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientSupabaseClient()

  // Check user authentication status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    setIsSettingsOpen(false)
  }

  // Determine logo link based on user state
  const logoHref = user ? '/dashboard' : '/'

  // Get navigation links based on context
  const getNavigationLinks = () => {
    if (variant === 'dashboard') {
      return [
        { href: '/dashboard', label: 'Dashboard', active: pathname === '/dashboard' },
        { href: '/dashboard/data', label: 'Data', active: pathname.startsWith('/dashboard/data') },
        { href: '/dashboard/analytics', label: 'Analytics', active: pathname.startsWith('/dashboard/analytics') },
        { href: '/docs', label: 'Documentation', active: pathname.startsWith('/docs') },
      ]
    }
    
    return [
      { href: '/playground', label: 'Playground', active: pathname.startsWith('/playground') },
      { href: '/docs', label: 'Documentation', active: pathname.startsWith('/docs') },
    ]
  }

  // Get dropdown menu items based on user state
  const getDropdownItems = () => {
    if (user) {
      // Logged in user menu
      const baseItems = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/profile', label: 'Profile' },
      ]

      // Add dashboard-specific items if on dashboard
      if (variant === 'dashboard') {
        baseItems.push(
          { href: '/dashboard/endpoints', label: 'Endpoints' },
          { href: '/dashboard/security', label: 'Security' },
          { href: '/dashboard/data-management', label: 'Data Management' }
        )
      } else {
        baseItems.push({ href: '/settings', label: 'Settings' })
      }

      return baseItems
    }
    
    // Logged out user menu
    return [
      { href: '/login', label: 'Sign In' },
      { href: '/register', label: 'Sign Up' },
    ]
  }

  const navigationLinks = getNavigationLinks()
  const dropdownItems = getDropdownItems()

  return (
    <nav className={`fixed top-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10 ${
      variant === 'dashboard' 
        ? 'left-0 right-0 lg:left-64 lg:right-0' 
        : 'left-0 right-0'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={logoHref} className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-enostics-blue" />
              <span className="text-xl font-bold text-white">
                Enostics
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  link.active 
                    ? 'text-white font-medium' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side - Notifications & Settings */}
          <div className="flex items-center space-x-4">
            {/* Notifications (only show if enabled) */}
            {showNotifications && user && (
              <NotificationBell />
            )}

            {/* Settings Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent hover:bg-white/10 text-white/70 hover:text-white focus:ring-white/30 h-10 w-10"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isSettingsOpen && !loading && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl py-2 z-50">
                  {dropdownItems.map((item) => (
                    <a 
                      key={item.href}
                      href={item.href} 
                      className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                  
                  {user && (
                    <>
                      <div className="border-t border-white/10 my-2"></div>
                      <button 
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button (only show if enabled) */}
            {showMobileMenuButton && (
              <button 
                onClick={onMobileMenuClick}
                className="md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-white/10 hover:bg-white/20 text-white h-10 px-4 py-2"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsSettingsOpen(false)}
        />
      )}
    </nav>
  )
} 