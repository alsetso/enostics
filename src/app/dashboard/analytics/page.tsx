'use client'

import { useState, useEffect } from 'react'
import { RealTimeAnalyticsV2 } from '@/components/features/real-time-analytics-v2'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, Activity, TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
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
      setError('Failed to load analytics data')
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
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-96 bg-enostics-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-enostics-blue" />
            Analytics
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <TrendingUp className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Analytics</h3>
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
          <BarChart3 className="h-8 w-8 text-enostics-blue" />
          Analytics
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Real-time
          </Badge>
        </h1>
        <p className="text-enostics-gray-400 mt-2">
          Monitor real-time request activity, performance metrics, and endpoint health across all your API endpoints.
        </p>
      </div>

      {/* Analytics Content */}
      {endpoints.length > 0 ? (
        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <RealTimeAnalyticsV2
              key={endpoint.id || endpoint.name || `endpoint-${index}`}
              endpointId={endpoint.id}
              endpointName={endpoint.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-enostics-gray-400">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-enostics-gray-600" />
          <h3 className="text-lg font-medium mb-2">No Analytics Available</h3>
          <p className="mb-4">Create an endpoint first to see real-time analytics and monitoring.</p>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Create Your First Endpoint
          </Button>
        </div>
      )}
    </div>
  )
} 