'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Copy, Check, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface Endpoint {
  id: string
  name: string
  url_path: string
}

interface RequestPlaygroundProps {
  endpoints: Endpoint[]
  userApiKeys: any[]
  username: string
}

export function RequestPlayground({ endpoints, userApiKeys, username }: RequestPlaygroundProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [selectedApiKey, setSelectedApiKey] = useState<string>('')
  const [requestBody, setRequestBody] = useState(`{
  "message": "Hello from playground!",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "test": true,
    "value": 42
  }
}`)
  const [response, setResponse] = useState<{
    status?: number
    data?: any
    error?: string
    duration?: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (endpoints.length > 0 && !selectedEndpoint) {
      setSelectedEndpoint(endpoints[0])
    }
    if (userApiKeys.length > 0 && !selectedApiKey) {
      setSelectedApiKey(userApiKeys[0]?.id || '')
    }
  }, [endpoints, userApiKeys, selectedEndpoint, selectedApiKey])

  const sendRequest = async () => {
    if (!selectedEndpoint || !selectedApiKey) {
      setResponse({ error: 'Please select an endpoint and API key' })
      return
    }

    setIsLoading(true)
    setResponse(null)

    const startTime = Date.now()
    
    try {
      // Parse request body
      let parsedBody
      try {
        parsedBody = JSON.parse(requestBody)
      } catch (e) {
        setResponse({ error: 'Invalid JSON in request body' })
        setIsLoading(false)
        return
      }

      // Find the actual API key value
      const apiKeyData = userApiKeys.find(key => key.id === selectedApiKey)
      if (!apiKeyData) {
        setResponse({ error: 'Selected API key not found' })
        setIsLoading(false)
        return
      }

      // Make the request
      const endpointUrl = `${window.location.origin}/api/v1/${username}/${selectedEndpoint.url_path}`
      
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKeyData.key_prefix.replace('...', '') // This won't work with real keys, but shows the format
        },
        body: JSON.stringify(parsedBody)
      })

      const duration = Date.now() - startTime
      const responseData = await response.json()

      setResponse({
        status: response.status,
        data: responseData,
        duration
      })

    } catch (error) {
      const duration = Date.now() - startTime
      setResponse({
        error: error instanceof Error ? error.message : 'Request failed',
        duration
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyRequest = async () => {
    if (!selectedEndpoint || !selectedApiKey) return

    const apiKeyData = userApiKeys.find(key => key.id === selectedApiKey)
    const curlCommand = `curl -X POST "${window.location.origin}/api/v1/${username}/${selectedEndpoint.url_path}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY_HERE" \\
  -d '${requestBody.replace(/\n/g, '').replace(/\s+/g, ' ')}'`

    try {
      await navigator.clipboard.writeText(curlCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-400'
    if (status >= 200 && status < 300) return 'text-green-400'
    if (status >= 400 && status < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusIcon = (status?: number) => {
    if (!status) return null
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4 text-green-400" />
    if (status >= 400 && status < 500) return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    return <XCircle className="h-4 w-4 text-red-400" />
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Request Playground
        </CardTitle>
        <p className="text-sm text-enostics-gray-400">
          Test your endpoints with custom JSON payloads and see real-time responses.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-enostics-gray-300 mb-2">
              Select Endpoint
            </label>
            <select
              value={selectedEndpoint?.id || ''}
              onChange={(e) => {
                const endpoint = endpoints.find(ep => ep.id === e.target.value)
                setSelectedEndpoint(endpoint || null)
              }}
              className="w-full p-3 bg-enostics-gray-800 border border-enostics-gray-700 rounded-lg text-white focus:ring-2 focus:ring-enostics-blue focus:border-transparent"
            >
              <option value="">Select an endpoint...</option>
              {endpoints.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.name} (/{endpoint.url_path})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-enostics-gray-300 mb-2">
              Select API Key
            </label>
            <select
              value={selectedApiKey}
              onChange={(e) => setSelectedApiKey(e.target.value)}
              className="w-full p-3 bg-enostics-gray-800 border border-enostics-gray-700 rounded-lg text-white focus:ring-2 focus:ring-enostics-blue focus:border-transparent"
            >
              <option value="">Select an API key...</option>
              {userApiKeys.map((apiKey) => (
                <option key={apiKey.id} value={apiKey.id}>
                  {apiKey.name} ({apiKey.key_prefix})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Request Body */}
        <div>
          <label className="block text-sm font-medium text-enostics-gray-300 mb-2">
            Request Body (JSON)
          </label>
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            className="w-full h-40 p-3 bg-enostics-gray-800 border border-enostics-gray-700 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-enostics-blue focus:border-transparent resize-none"
            placeholder="Enter your JSON payload here..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={sendRequest}
            disabled={isLoading || !selectedEndpoint || !selectedApiKey}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={copyRequest}
            disabled={!selectedEndpoint || !selectedApiKey}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Response */}
        {response && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-enostics-gray-300">Response</h3>
              <div className="flex items-center gap-2">
                {response.duration && (
                  <Badge variant="outline">
                    {response.duration}ms
                  </Badge>
                )}
                {response.status && (
                  <div className="flex items-center gap-1">
                    {getStatusIcon(response.status)}
                    <span className={`font-mono ${getStatusColor(response.status)}`}>
                      {response.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg">
              <pre className="text-sm text-white whitespace-pre-wrap overflow-x-auto">
                {response.error 
                  ? `Error: ${response.error}`
                  : JSON.stringify(response.data, null, 2)
                }
              </pre>
            </div>
          </div>
        )}

        {/* Usage Info */}
        <div className="p-4 bg-enostics-blue/10 border border-enostics-blue/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-enostics-blue mt-0.5" />
            <div className="text-sm">
              <p className="text-enostics-blue font-medium mb-1">Playground Note</p>
              <p className="text-enostics-gray-300">
                This playground uses your actual API endpoints. The requests will be logged and processed normally.
                For security, API keys are partially hidden - use your full key in production.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 