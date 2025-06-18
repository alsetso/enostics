'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, Plus, Copy, Check, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  is_active: boolean
  last_used_at?: string
  created_at: string
  expires_at: string
  endpoint_id?: string
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState<string | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys')
      const result = await response.json()
      
      if (response.ok) {
        setApiKeys(result.apiKeys || [])
      } else {
        console.error('Failed to fetch API keys:', result.error)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    const name = prompt('Enter a name for the API key:')
    if (!name) return

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      })

      const result = await response.json()
      
      if (response.ok) {
        // Show the new API key to the user
        alert(`API Key created successfully!\n\nKey: ${result.apiKey}\n\nIMPORTANT: Save this key now - you won't be able to see it again!`)
        fetchApiKeys()
      } else {
        alert(`Failed to create API key: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      alert('Error creating API key')
    }
  }

  const toggleApiKey = async (keyId: string, isActive: boolean) => {
    const action = isActive ? 'deactivate' : 'reactivate'
    
    try {
      const response = await fetch('/api/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId, action })
      })

      if (response.ok) {
        fetchApiKeys()
      }
    } catch (error) {
      console.error('Error toggling API key:', error)
    }
  }

  const deleteApiKey = async (keyId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the API key "${name}"? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchApiKeys()
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
    }
  }

  const copyKeyPrefix = async (keyPrefix: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(keyPrefix)
      setCopiedKey(keyId)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-enostics-gray-800/50 rounded" />
            <div className="h-20 bg-enostics-gray-800/50 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys ({apiKeys.length})
          </CardTitle>
          <Button onClick={createApiKey} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Key
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-12 w-12 text-enostics-gray-600 mx-auto mb-4" />
            <p className="text-enostics-gray-400 mb-4">No API keys created yet</p>
            <Button onClick={createApiKey} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First API Key
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-enostics-gray-800 rounded-lg p-4 bg-enostics-gray-900/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-white">{apiKey.name}</h3>
                    <div className="flex gap-2">
                      <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {isExpired(apiKey.expires_at) && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleApiKey(apiKey.id, apiKey.is_active)}
                    >
                      {apiKey.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteApiKey(apiKey.id, apiKey.name)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-enostics-gray-800 px-2 py-1 rounded font-mono text-enostics-gray-300">
                      {apiKey.key_prefix}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyKeyPrefix(apiKey.key_prefix, apiKey.id)}
                    >
                      {copiedKey === apiKey.id ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-enostics-gray-400">
                    <span>Created: {formatDate(apiKey.created_at)}</span>
                    <span>Expires: {formatDate(apiKey.expires_at)}</span>
                    {apiKey.last_used_at && (
                      <span>Last used: {formatDate(apiKey.last_used_at)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-enostics-blue/10 border border-enostics-blue/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-enostics-blue mt-0.5" />
            <div className="text-sm">
              <p className="text-enostics-blue font-medium mb-1">Security Notice</p>
              <p className="text-enostics-gray-300">
                API keys are only shown once during creation. Store them securely and never commit them to version control.
                Use the <code className="bg-enostics-gray-800 px-1 rounded">x-api-key</code> header or <code className="bg-enostics-gray-800 px-1 rounded">Authorization: Bearer</code> header to authenticate requests.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 