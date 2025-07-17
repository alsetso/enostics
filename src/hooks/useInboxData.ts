'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { parseSource } from '@/lib/inbox-utils'

export interface InboxItem {
  id: string
  sender: string
  source: string
  type: string
  subject: string
  preview: string
  timestamp: string
  isRead: boolean
  isStarred: boolean
  data: any
  sourceIcon: string
  receivedAt: string
  sourceIp?: string
  userAgent?: string
}

export interface UseInboxDataReturn {
  items: InboxItem[]
  loading: boolean
  error: string | null
  unreadCount: number
  starredCount: number
  fetchData: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  toggleStar: (id: string) => Promise<void>
  markMultipleAsRead: (ids: string[]) => Promise<void>
  refreshData: () => Promise<void>
}

export const useInboxData = (): UseInboxDataReturn => {
  const [items, setItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()
  const subscriptionRef = useRef<any>(null)

  // Get timestamp from various possible sources
  const getTimestamp = (item: any) => {
    if (item.created_at) return item.created_at
    if (item.timestamp) return item.timestamp
    if (item.data?.timestamp) return item.data.timestamp
    if (item.data?.created_at) return item.data.created_at
    return new Date().toISOString()
  }

  const transformApiResponse = (rawData: any[]): InboxItem[] => {
    return rawData.map(item => {
      const { label, icon } = parseSource(item.source, item.user_agent)
      const timestamp = getTimestamp(item)
      
      return {
        id: item.id,
        sender: label,
        source: item.source || 'api_endpoint',
        type: item.type || 'data',
        subject: item.subject || 'Data received',
        preview: item.preview || 'No preview available',
        timestamp: new Date(timestamp).toLocaleString(),
        isRead: item.is_read || false,
        isStarred: item.is_starred || false,
        data: item.data || {},
        sourceIcon: icon,
        receivedAt: timestamp,
        sourceIp: item.source_ip,
        userAgent: item.user_agent,
      }
    })
  }

  const transformRealtimePayload = (payload: any): InboxItem => {
    const { label, icon } = parseSource(payload.source, payload.user_agent)
    const timestamp = getTimestamp(payload)
    
    return {
      id: payload.id,
      sender: label,
      source: payload.source || 'api_endpoint',
      type: payload.type || 'data',
      subject: payload.subject || 'Data received',
      preview: payload.preview || 'No preview available',
      timestamp: new Date(timestamp).toLocaleString(),
      isRead: payload.is_read || false,
      isStarred: payload.is_starred || false,
      data: payload.data || {},
      sourceIcon: icon,
      receivedAt: timestamp,
      sourceIp: payload.source_ip,
      userAgent: payload.user_agent,
    }
  }

  const fetchData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/inbox/recent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        console.error('API returned error:', result.error)
        throw new Error(result.error)
      }

      if (result.items) {
        const transformedItems = transformApiResponse(result.items)
        setItems(transformedItems)
      }

    } catch (err) {
      console.error('Error fetching inbox data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const markAsRead = async (id: string) => {
    // Optimistic update
    const previousItems = [...items]
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, isRead: true } : item
      )
    )

    try {
      const response = await fetch('/api/inbox/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark as read')
      }
    } catch (err) {
      console.error('Error marking as read:', err)
      // Revert optimistic update
      setItems(previousItems)
      setError(err instanceof Error ? err.message : 'Failed to mark as read')
    }
  }

  const toggleStar = async (id: string) => {
    // Optimistic update
    const previousItems = [...items]
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      )
    )

    try {
      const response = await fetch('/api/inbox/star', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle star')
      }
    } catch (err) {
      console.error('Error toggling star:', err)
      // Revert optimistic update
      setItems(previousItems)
      setError(err instanceof Error ? err.message : 'Failed to toggle star')
    }
  }

  const markMultipleAsRead = async (ids: string[]) => {
    // Optimistic update
    const previousItems = [...items]
    setItems(prevItems => 
      prevItems.map(item => 
        ids.includes(item.id) ? { ...item, isRead: true } : item
      )
    )

    try {
      const response = await fetch('/api/inbox/read-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark multiple as read')
      }
    } catch (err) {
      console.error('Error marking multiple as read:', err)
      // Revert optimistic update
      setItems(previousItems)
      setError(err instanceof Error ? err.message : 'Failed to mark multiple as read')
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await fetchData()
    setLoading(false)
  }

  const initializeData = async () => {
    setLoading(true)
    await fetchData()
    setLoading(false)
  }

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log('No user found, skipping realtime subscription')
          return
        }

        // Get user's endpoints to filter realtime data
        const { data: endpoints } = await supabase
          .from('endpoints')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (!endpoints || endpoints.length === 0) {
          console.log('No endpoints found, skipping realtime subscription')
          return
        }

        const endpointIds = endpoints.map(ep => ep.id)

        // Clean up existing subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe()
        }

        // Set up realtime subscription for data table
        subscriptionRef.current = supabase
          .channel('inbox_data_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'data',
              filter: `endpoint_id=in.(${endpointIds.join(',')})`
            },
            (payload) => {
              console.log('Realtime data change:', payload)
              
              if (payload.eventType === 'INSERT') {
                const newItem = transformRealtimePayload(payload.new)
                setItems(prevItems => [newItem, ...prevItems])
              } else if (payload.eventType === 'UPDATE') {
                const updatedItem = transformRealtimePayload(payload.new)
                setItems(prevItems => 
                  prevItems.map(item => 
                    item.id === updatedItem.id ? updatedItem : item
                  )
                )
              } else if (payload.eventType === 'DELETE') {
                setItems(prevItems => 
                  prevItems.filter(item => item.id !== payload.old.id)
                )
              }
            }
          )
          .subscribe()

      } catch (error) {
        console.error('Error setting up realtime subscription:', error)
      }
    }

    setupRealtimeSubscription()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [supabase])

  // Calculate counts
  const unreadCount = items.filter(item => !item.isRead).length
  const starredCount = items.filter(item => item.isStarred).length

  return {
    items,
    loading,
    error,
    unreadCount,
    starredCount,
    fetchData,
    markAsRead,
    toggleStar,
    markMultipleAsRead,
    refreshData,
  }
} 