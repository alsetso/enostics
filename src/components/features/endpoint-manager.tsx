'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Globe, Settings, Copy, Check, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react'
import { CreateEndpointModal } from './create-endpoint-modal'
import { createClientSupabaseClient } from '@/lib/supabase'

interface Endpoint {
  id: string
  name: string
  description?: string
  url_path: string
  is_active: boolean
  auth_type: string
  created_at: string
  updated_at: string
}

export function EndpointManager() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)
  const [username, setUsername] = useState('')

  useEffect(() => {
    fetchEndpoints()
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      if (profile?.full_name) {
        setUsername(profile.full_name.toLowerCase().replace(/\s+/g, '-'))
      } else {
        // Fallback to email username
        const emailUsername = user.email?.split('@')[0] || 'user'
        setUsername(emailUsername)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const fetchEndpoints = async () => {
    try {
      const response = await fetch('/api/endpoints')
      const result = await response.json()
      
      if (response.ok) {
        setEndpoints(result.endpoints || [])
      } else {
        console.error('Failed to fetch endpoints:', result.error)
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEndpointStatus = async (endpoint: Endpoint) => {
    try {
      const response = await fetch('/api/endpoints', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...endpoint,
          is_active: !endpoint.is_active
        })
      })

      if (response.ok) {
        setEndpoints(prev => 
          prev.map(ep => 
            ep.id === endpoint.id 
              ? { ...ep, is_active: !ep.is_active }
              : ep
          )
        )
      }
    } catch (error) {
      console.error('Error toggling endpoint status:', error)
    }
  }

  const deleteEndpoint = async (endpointId: string) => {
    if (!confirm('Are you sure you want to delete this endpoint? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/endpoints?id=${endpointId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEndpoints(prev => prev.filter(ep => ep.id !== endpointId))
      }
    } catch (error) {
      console.error('Error deleting endpoint:', error)
    }
  }

  const copyEndpointUrl = async (endpoint: Endpoint) => {
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/v1/${username}/${endpoint.url_path}`
      : `http://localhost:3000/api/v1/${username}/${endpoint.url_path}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopiedEndpoint(endpoint.id)
      setTimeout(() => setCopiedEndpoint(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const testEndpoint = async (endpoint: Endpoint) => {
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/v1/${username}/${endpoint.url_path}`
      : `http://localhost:3000/api/v1/${username}/${endpoint.url_path}`

    try {
      const testData = {
        test: true,
        endpoint_name: endpoint.name,
        message: 'Test data from endpoint manager',
        timestamp: new Date().toISOString(),
        value: Math.random()
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })

      if (response.ok) {
        alert(`Test data sent successfully to ${endpoint.name}!`)
      } else {
        alert(`Failed to send test data to ${endpoint.name}`)
      }
    } catch (error) {
      console.error('Test failed:', error)
      alert('Test failed - check console for details')
    }
  }

  if (loading) {
    return (
      <Card variant="integrated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Your Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-enostics-gray-800/30 rounded" />
            <div className="h-20 bg-enostics-gray-800/30 rounded" />
            <div className="h-20 bg-enostics-gray-800/30 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card variant="integrated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Your Endpoints ({endpoints.length})
            </CardTitle>
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Endpoint
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {endpoints.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-enostics-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No endpoints yet</h3>
              <p className="text-enostics-gray-400 mb-4">
                Create your first endpoint to start receiving data
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Endpoint
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className="p-4 bg-enostics-gray-900/50 rounded-lg border border-enostics-gray-800 hover:border-enostics-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-white">{endpoint.name}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          endpoint.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {endpoint.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      {endpoint.description && (
                        <p className="text-sm text-enostics-gray-400 mb-2">{endpoint.description}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm text-enostics-green font-mono bg-enostics-gray-800/50 px-2 py-1 rounded">
                          api.enostics.com/v1/{username}/{endpoint.url_path}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyEndpointUrl(endpoint)}
                          className="p-1 h-8 w-8"
                        >
                          {copiedEndpoint === endpoint.id ? (
                            <Check className="h-4 w-4 text-enostics-green" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-enostics-gray-500">
                        <span>Auth: {endpoint.auth_type === 'none' ? 'Public' : endpoint.auth_type}</span>
                        <span>•</span>
                        <span>Created: {new Date(endpoint.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const docUrl = `/docs/${username}`
                          window.open(docUrl, '_blank')
                        }}
                        className="p-2 h-8 w-8"
                        title="View API documentation"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleEndpointStatus(endpoint)}
                        className="p-2 h-8 w-8"
                        title={endpoint.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {endpoint.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => testEndpoint(endpoint)}
                        className="p-2 h-8 w-8"
                        title="Send test data"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteEndpoint(endpoint.id)}
                        className="p-2 h-8 w-8 text-red-400 hover:text-red-300"
                        title="Delete endpoint"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateEndpointModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchEndpoints()
          setShowCreateModal(false)
        }}
      />
    </div>
  )
} 