'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { JsonEditor } from './json-editor'
import { useEndpointTest, TestRequest } from '@/hooks/useEndpointTest'
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  History,
  Zap,
  FileText,
  Download,
  Settings
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface Endpoint {
  id: string
  name: string
  description?: string
  url_path: string
  is_active: boolean
  auth_type: string
}

export function EndpointTester() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [payload, setPayload] = useState('')
  const [username, setUsername] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const {
    requests,
    templates,
    isLoading,
    sendTestRequest,
    clearHistory,
    removeRequest
  } = useEndpointTest()

  useEffect(() => {
    fetchEndpoints()
    fetchUserInfo()
  }, [])

  useEffect(() => {
    // Set default payload when component mounts
    if (!payload && templates.length > 0) {
      setPayload(templates[0].payload)
      setSelectedTemplate(templates[0].id)
    }
  }, [templates, payload])

  const fetchUserInfo = async () => {
    try {
      const supabase = createClientSupabaseClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      if (profile?.full_name) {
        setUsername(profile.full_name.toLowerCase().replace(/\s+/g, '-'))
      } else {
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
        const activeEndpoints = result.endpoints?.filter((ep: Endpoint) => ep.is_active) || []
        setEndpoints(activeEndpoints)
        
        // Auto-select first endpoint if none selected
        if (activeEndpoints.length > 0 && !selectedEndpoint) {
          setSelectedEndpoint(activeEndpoints[0])
        }
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error)
    }
  }

  const handleTest = async () => {
    if (!selectedEndpoint || !payload.trim()) return

    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/v1/${username}/${selectedEndpoint.url_path}`
      : `http://localhost:3000/api/v1/${username}/${selectedEndpoint.url_path}`

    await sendTestRequest(
      selectedEndpoint.id,
      selectedEndpoint.name,
      url,
      payload
    )

    // Show history after sending request
    setShowHistory(true)
  }

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setPayload(template.payload)
      setSelectedTemplate(templateId)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4 animate-spin" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="space-y-8">
      <Card variant="integrated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Endpoint Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Endpoint Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Select Endpoint</label>
              <Select
                value={selectedEndpoint?.id || ''}
                onValueChange={(value) => {
                  const endpoint = endpoints.find(ep => ep.id === value)
                  setSelectedEndpoint(endpoint || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an endpoint to test" />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((endpoint) => (
                    <SelectItem key={endpoint.id} value={endpoint.id}>
                      <div className="flex items-center gap-2">
                        <span>{endpoint.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {endpoint.auth_type === 'none' ? 'Public' : endpoint.auth_type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEndpoint && (
                <div className="text-xs text-enostics-gray-400">
                  <code>api.enostics.com/v1/{username}/{selectedEndpoint.url_path}</code>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Test Template</label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-gray-400">{template.description}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* JSON Payload Editor */}
          <JsonEditor
            value={payload}
            onChange={setPayload}
            label="JSON Payload"
            height="300px"
            placeholder='{\n  "message": "Hello Enostics!",\n  "data": {\n    "value": 123\n  }\n}'
          />

          {/* Test Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleTest}
                disabled={!selectedEndpoint || !payload.trim() || isLoading}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isLoading ? 'Sending...' : 'Send Request'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                History ({requests.length})
              </Button>
            </div>

            {requests.length > 0 && (
              <Button
                variant="ghost"
                onClick={clearHistory}
                className="text-red-400 hover:text-red-300"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear History
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request History */}
      {showHistory && requests.length > 0 && (
        <Card variant="integrated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Request History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.slice(0, 10).map((request) => (
                <RequestHistoryItem
                  key={request.id}
                  request={request}
                  onRemove={() => removeRequest(request.id)}
                />
              ))}
              
              {requests.length > 10 && (
                <div className="text-center py-4 text-enostics-gray-400 text-sm">
                  Showing 10 most recent requests. {requests.length - 10} more in history.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function RequestHistoryItem({ 
  request, 
  onRemove 
}: { 
  request: TestRequest
  onRemove: () => void 
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="border border-enostics-gray-800 rounded-lg p-4 hover:border-enostics-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 ${getStatusColor(request.status)}`}>
            {getStatusIcon(request.status)}
            <span className="font-medium">{request.endpointName}</span>
          </div>
          
          {request.response && (
            <Badge 
              variant={request.response.status >= 200 && request.response.status < 300 ? 'default' : 'destructive'}
              className="text-xs"
            >
              {request.response.status} {request.response.statusText}
            </Badge>
          )}
          
          {request.response?.duration && (
            <span className="text-xs text-enostics-gray-400">
              {formatDuration(request.response.duration)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs"
          >
            <FileText className="h-3 w-3 mr-1" />
            {showDetails ? 'Hide' : 'Details'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 p-1"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="text-xs text-enostics-gray-500 mb-2">
        {request.timestamp.toLocaleString()}
      </div>

      {request.error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2 mb-2">
          {request.error}
        </div>
      )}

      {showDetails && (
        <div className="space-y-3 mt-3 pt-3 border-t border-enostics-gray-800">
          <div>
            <div className="text-xs font-medium text-enostics-gray-300 mb-1">Request URL</div>
            <code className="text-xs text-enostics-gray-400 bg-enostics-gray-900/50 p-2 rounded block">
              POST {request.url}
            </code>
          </div>

          <div>
            <div className="text-xs font-medium text-enostics-gray-300 mb-1">Request Payload</div>
            <JsonEditor
              value={request.payload}
              onChange={() => {}} // Read-only
              readOnly
              height="120px"
            />
          </div>

          {request.response && (
            <div>
              <div className="text-xs font-medium text-enostics-gray-300 mb-1">Response</div>
              <JsonEditor
                value={JSON.stringify(request.response.data, null, 2)}
                onChange={() => {}} // Read-only
                readOnly
                height="120px"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helper functions (defined outside component to avoid recreation)
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'success': return 'text-green-400'
    case 'error': return 'text-red-400'
    case 'pending': return 'text-yellow-400'
    default: return 'text-gray-400'
  }
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'success': return <CheckCircle className="h-4 w-4" />
    case 'error': return <XCircle className="h-4 w-4" />
    case 'pending': return <Clock className="h-4 w-4 animate-spin" />
    default: return <Clock className="h-4 w-4" />
  }
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
} 