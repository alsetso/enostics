'use client'

import { useState, useEffect } from 'react'
import { WebhookManager } from '@/components/features/webhook-manager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Webhook, Activity, Link } from 'lucide-react'

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEndpoints()
  }, [])

  const fetchEndpoints = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/endpoints')
      if (response.ok) {
        const data = await response.json()
        setEndpoints(Array.isArray(data.endpoints) ? data.endpoints : [])
      } else {
        throw new Error('Failed to fetch endpoints')
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error)
      setError('Failed to load webhooks data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-enostics-gray-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-enostics-gray-700 rounded w-96"></div>
        </div>
        <div className="h-96 bg-enostics-gray-700 rounded animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Webhook className="h-8 w-8 text-enostics-blue" />
            Webhooks
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <Link className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Webhooks</h3>
            <p className="text-enostics-gray-400 mb-4">{error}</p>
            <Button onClick={fetchEndpoints} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Webhook className="h-8 w-8 text-enostics-blue" />
          Webhooks
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Auto-forward
          </Badge>
        </h1>
        <p className="text-enostics-gray-400 mt-2">
          Configure webhook forwarding to automatically send incoming requests to external URLs with retry logic and security features.
        </p>
      </div>

      {/* Webhooks Content */}
      {endpoints.length > 0 ? (
        <WebhookManager
          endpoints={endpoints}
          onUpdate={fetchEndpoints}
        />
      ) : (
        <div className="text-center py-12 text-enostics-gray-400">
          <Webhook className="h-16 w-16 mx-auto mb-4 text-enostics-gray-600" />
          <h3 className="text-lg font-medium mb-2">No Endpoints for Webhooks</h3>
          <p className="mb-4">Create an endpoint first to configure webhook forwarding.</p>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Create Your First Endpoint
          </Button>
        </div>
      )}
    </div>
  )
} 