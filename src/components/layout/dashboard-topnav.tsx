'use client'

import { Bell, HelpCircle, CreditCard, Settings, User, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClientSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

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
    await supabase.auth.signOut()
    router.push('/login')
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
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-[hsl(var(--hover-bg))]">
          <Bell className="h-5 w-5 text-[hsl(var(--text-muted))]" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-[hsl(var(--hover-bg))]">
          <HelpCircle className="h-5 w-5 text-[hsl(var(--text-muted))]" />
        </Button>

        {/* Billing */}
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-[hsl(var(--hover-bg))]">
          <CreditCard className="h-5 w-5 text-[hsl(var(--text-muted))]" />
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-[hsl(var(--hover-bg))]">
          <Settings className="h-5 w-5 text-[hsl(var(--text-muted))]" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 ml-2">
              <div className="h-7 w-7 bg-[hsl(var(--text-muted))] rounded-full flex items-center justify-center text-[hsl(var(--text-primary))] text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[hsl(var(--primary-bg))] border-[hsl(var(--border-color))]">
            <DropdownMenuItem className="text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--hover-bg))]">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[hsl(var(--border-color))]" />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--hover-bg))]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 