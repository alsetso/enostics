'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, User, Settings, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClientSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'onboarding' | 'system' | 'security' | 'feature'
  title: string
  message: string
  action?: {
    label: string
    href: string
  }
  priority: 'high' | 'medium' | 'low'
  read: boolean
  created_at: string
}

interface OnboardingStatus {
  profile_completed: boolean
  username_set: boolean
  endpoint_created: boolean
  first_request_sent: boolean
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    profile_completed: false,
    username_set: false,
    endpoint_created: false,
    first_request_sent: false
  })
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    checkOnboardingStatus()
    
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check profile completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, bio, job_title, company')
        .eq('id', user.id)
        .single()

      // Check if user has endpoints
      const { data: endpoints } = await supabase
        .from('enostics_endpoints')
        .select('id')
        .eq('user_id', user.id)

      // Check if user has received any data
      const { data: requests } = await supabase
        .from('enostics_data')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      const status: OnboardingStatus = {
        profile_completed: !!(profile?.full_name && profile?.username && profile?.bio),
        username_set: !!profile?.username,
        endpoint_created: !!(endpoints && endpoints.length > 0),
        first_request_sent: !!(requests && requests.length > 0)
      }

      setOnboardingStatus(status)
      generateOnboardingNotifications(status)
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateOnboardingNotifications = (status: OnboardingStatus) => {
    const notifications: Notification[] = []

    if (!status.profile_completed) {
      notifications.push({
        id: 'complete-profile',
        type: 'onboarding',
        title: 'Complete Your Profile',
        message: 'Set up your profile to activate your personal API endpoint at https://api.enostics.com/v1/{username}',
        action: {
          label: 'Complete Profile',
          href: '/dashboard/profile'
        },
        priority: 'high',
        read: false,
        created_at: new Date().toISOString()
      })
    }

    if (!status.username_set) {
      notifications.push({
        id: 'set-username',
        type: 'onboarding',
        title: 'Choose Your Username',
        message: 'Your username will be your unique API endpoint URL. Choose wisely!',
        action: {
          label: 'Set Username',
          href: '/dashboard/profile'
        },
        priority: 'high',
        read: false,
        created_at: new Date().toISOString()
      })
    }

    if (status.profile_completed && !status.endpoint_created) {
      notifications.push({
        id: 'create-endpoint',
        type: 'onboarding',
        title: 'Create Your First Endpoint',
        message: 'Start receiving data by creating your first API endpoint',
        action: {
          label: 'Create Endpoint',
          href: '/dashboard'
        },
        priority: 'medium',
        read: false,
        created_at: new Date().toISOString()
      })
    }

    if (status.endpoint_created && !status.first_request_sent) {
      notifications.push({
        id: 'test-endpoint',
        type: 'onboarding',
        title: 'Test Your Endpoint',
        message: 'Send your first request to see your endpoint in action',
        action: {
          label: 'Test Now',
          href: '/dashboard/playground'
        },
        priority: 'medium',
        read: false,
        created_at: new Date().toISOString()
      })
    }

    // Add welcome notification for new users
    if (!status.profile_completed && !status.username_set) {
      notifications.unshift({
        id: 'welcome',
        type: 'onboarding',
        title: 'Welcome to Enostics! 🎉',
        message: 'Complete your setup to get your personal API endpoint up and running',
        action: {
          label: 'Get Started',
          href: '/dashboard/profile'
        },
        priority: 'high',
        read: false,
        created_at: new Date().toISOString()
      })
    }

    setNotifications(notifications)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const hasHighPriorityUnread = notifications.some(n => !n.read && n.priority === 'high')

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'onboarding':
        return <User className="h-4 w-4" />
      case 'security':
        return <AlertTriangle className="h-4 w-4" />
      case 'system':
        return <Settings className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      default:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  if (loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
        disabled
      >
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center ${
            hasHighPriorityUnread 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-enostics-blue text-white'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-enostics-gray-900 backdrop-blur-md rounded-lg border border-enostics-gray-700 shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-enostics-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-sm text-enostics-gray-300 mb-1">All caught up!</p>
              <p className="text-xs text-enostics-gray-500">You're all set with your Enostics setup</p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-enostics-gray-800/50 transition-colors border-l-2 ${
                    notification.read 
                      ? 'border-transparent opacity-60' 
                      : `border-l-2 ${getPriorityColor(notification.priority).split(' ')[0]}`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-enostics-blue rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-enostics-gray-400 mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.action && (
                        <Link 
                          href={notification.action.href}
                          onClick={() => {
                            markAsRead(notification.id)
                            setIsOpen(false)
                          }}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-3 text-enostics-blue border-enostics-blue/30 hover:bg-enostics-blue/10"
                          >
                            {notification.action.label}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-enostics-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                }}
                className="w-full text-xs text-enostics-gray-400 hover:text-white"
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 