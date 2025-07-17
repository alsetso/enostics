'use client'

import { 
  HelpCircle, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  CreditCard, 
  UserCircle,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

import { createClientSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type SidebarState = 'collapsed' | 'default' | 'expanded'

interface DashboardTopNavProps {
  title?: string
  subtitle?: string
  className?: string
  onMobileMenuClick?: () => void
  sidebarState?: SidebarState
}

export function DashboardTopNav({ title = "Dashboard", subtitle, className = "", onMobileMenuClick, sidebarState = 'default' }: DashboardTopNavProps) {
  const [user, setUser] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleMenuItemClick = (action: () => void) => {
    setDropdownOpen(false)
    action()
  }

  const getLeftMargin = () => {
    switch (sidebarState) {
      case 'collapsed':
        return 'lg:left-16'
      case 'expanded':
        return 'lg:left-80'
      default:
        return 'lg:left-64'
    }
  }

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ')
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || 'User'
  }

  return (
    <div className={`fixed top-0 left-0 right-0 h-20 bg-[hsl(var(--primary-bg))] border-b border-[hsl(var(--border-color))] flex items-center justify-between px-6 z-30 transition-all duration-300 ${getLeftMargin()} ${className}`}>
      {/* Left side - Mobile menu button and title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        {onMobileMenuClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuClick}
            className="h-10 w-10 p-0 lg:hidden hover:bg-[hsl(var(--hover-bg))]"
          >
            <Menu className="h-5 w-5 text-[hsl(var(--text-muted))]" />
          </Button>
        )}
        
        {/* Title and subtitle */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-[hsl(var(--text-primary))]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[hsl(var(--text-muted))]">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right side - Account controls */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        {/* <NotificationBell /> */}
        
        {/* Billing */}
        <Link href="/dashboard/settings/billing">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 p-0 hover:bg-[hsl(var(--hover-bg))] transition-colors"
            title="Billing & Subscription"
          >
            <CreditCard className="h-4 w-4 text-[hsl(var(--text-muted))]" />
          </Button>
        </Link>

        {/* User Menu */}
        <div className="relative">
          <Button 
            variant="ghost" 
            className="h-10 w-10 p-0 hover:bg-[hsl(var(--hover-bg))] transition-colors rounded-full"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-enostics-blue text-white text-sm font-medium">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
          
          {dropdownOpen && (
            <>
              {/* Backdrop to close on outside click */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              />
              
              {/* Dropdown Content */}
              <div className="absolute right-0 top-full mt-1 w-64 z-20 bg-[hsl(var(--primary-bg))] border border-[hsl(var(--border-color))] shadow-lg rounded-md overflow-hidden">
                {/* User Info Header */}
                <div className="px-3 py-3 border-b border-[hsl(var(--border-color))]">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-enostics-blue text-white font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-[hsl(var(--text-primary))]">
                        {getUserDisplayName()}
                      </span>
                      <span className="text-xs text-[hsl(var(--text-muted))]">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile */}
                <div 
                  onClick={() => handleMenuItemClick(() => router.push('/dashboard/profile'))}
                  className="px-3 py-2 text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--hover-bg))] cursor-pointer flex items-center"
                >
                  <UserCircle className="mr-3 h-4 w-4" />
                  Profile
                </div>

                {/* Settings */}
                <div 
                  onClick={() => handleMenuItemClick(() => router.push('/dashboard/settings'))}
                  className="px-3 py-2 text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--hover-bg))] cursor-pointer flex items-center"
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </div>

                {/* Billing */}
                <div 
                  onClick={() => handleMenuItemClick(() => router.push('/dashboard/settings/billing'))}
                  className="px-3 py-2 text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--hover-bg))] cursor-pointer flex items-center"
                >
                  <CreditCard className="mr-3 h-4 w-4" />
                  Billing
                </div>

                <div className="my-1 h-px bg-[hsl(var(--border-color))]" />

                {/* Theme Toggle */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <Palette className="mr-3 h-4 w-4 text-[hsl(var(--text-secondary))]" />
                    <span className="text-sm text-[hsl(var(--text-secondary))]">Theme</span>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="my-1 h-px bg-[hsl(var(--border-color))]" />

                {/* Sign Out */}
                <div 
                  onClick={handleSignOut}
                  className="px-3 py-2 text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--hover-bg))] focus:bg-red-500/10 focus:text-red-500 cursor-pointer flex items-center"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 