'use client'

import { useState, useEffect } from 'react'
import { RequestPlayground } from '@/components/features/request-playground'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Activity, Zap } from 'lucide-react'

export default function PlaygroundPage() {
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch endpoints
      const endpointsResponse = await fetch('/api/endpoints')
      if (endpointsResponse.ok) {
        const endpointsData = await endpointsResponse.json()
        setEndpoints(Array.isArray(endpointsData.endpoints) ? endpointsData.endpoints : [])
      }

      // Fetch API keys
      try {
        const apiKeysResponse = await fetch('/api/api-keys')
        if (apiKeysResponse.ok) {
          const apiKeysData = await apiKeysResponse.json()
          setApiKeys(Array.isArray(apiKeysData.keys) ? apiKeysData.keys : [])
        }
      } catch (apiKeyError) {
        console.warn('Error fetching API keys:', apiKeyError)
        setApiKeys([])
      }

      // Set user profile (placeholder)
      setUserProfile({ username: 'user' })
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load playground data')
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
            <Play className="h-8 w-8 text-enostics-blue" />
            Playground
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <Zap className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Playground</h3>
            <p className="text-enostics-gray-400 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
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
          <Play className="h-8 w-8 text-enostics-blue" />
          Playground
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Interactive
          </Badge>
        </h1>
        <p className="text-enostics-gray-400 mt-2">
          Test your API endpoints with custom payloads, headers, and authentication. See real-time responses and debug your integrations.
        </p>
      </div>

      {/* Playground Content */}
      {endpoints.length > 0 ? (
        <RequestPlayground
          endpoints={endpoints}
          userApiKeys={apiKeys}
          username={userProfile?.username || 'user'}
        />
      ) : (
        <div className="text-center py-12 text-enostics-gray-400">
          <Play className="h-16 w-16 mx-auto mb-4 text-enostics-gray-600" />
          <h3 className="text-lg font-medium mb-2">No Endpoints to Test</h3>
          <p className="mb-4">Create an endpoint first to start testing with the playground.</p>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Create Your First Endpoint
          </Button>
        </div>
      )}
    </div>
  )
} 