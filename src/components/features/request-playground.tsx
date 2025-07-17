'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Terminal,
  Code,
  Send,
  Clock,
  Database,
  Key,
  Globe,
  Settings
} from 'lucide-react'

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
  const [requestMethod, setRequestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST')
  const [requestBody, setRequestBody] = useState(`{
  "message": "Hello from console!",
  "timestamp": "${new Date().toISOString()}",
  "metadata": {
    "source": "developer-console",
    "environment": "localhost:3000"
  }
}`)
  const [response, setResponse] = useState<{
    status?: number
    data?: any
    error?: string
    duration?: number
    timestamp?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [requestHistory, setRequestHistory] = useState<any[]>([])

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
      setResponse({ 
        error: 'Missing endpoint or API key',
        timestamp: new Date().toISOString()
      })
      return
    }

    setIsLoading(true)
    setResponse(null)

    const startTime = Date.now()
    
    try {
      // Parse request body for POST/PUT requests
      let parsedBody = null
      if (['POST', 'PUT'].includes(requestMethod)) {
        try {
          parsedBody = JSON.parse(requestBody)
        } catch (e) {
          setResponse({ 
            error: 'Invalid JSON in request body',
            timestamp: new Date().toISOString()
          })
          setIsLoading(false)
          return
        }
      }

      // Find the actual API key value
      const apiKeyData = userApiKeys.find(key => key.id === selectedApiKey)
      if (!apiKeyData) {
        setResponse({ 
          error: 'Selected API key not found',
          timestamp: new Date().toISOString()
        })
        setIsLoading(false)
        return
      }

      // Make the request
      const endpointUrl = `${window.location.origin}/api/v1/${username}/${selectedEndpoint.url_path}`
      
      const requestOptions: RequestInit = {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKeyData.key_prefix.replace('...', '') // This won't work with real keys, but shows the format
        }
      }

      if (parsedBody) {
        requestOptions.body = JSON.stringify(parsedBody)
      }

      const response = await fetch(endpointUrl, requestOptions)

      const duration = Date.now() - startTime
      const responseData = await response.json()
      const timestamp = new Date().toISOString()

      const newResponse = {
        status: response.status,
        data: responseData,
        duration,
        timestamp
      }

      setResponse(newResponse)
      
      // Add to history
      setRequestHistory(prev => [{
        method: requestMethod,
        endpoint: selectedEndpoint.url_path,
        status: response.status,
        duration,
        timestamp
      }, ...prev.slice(0, 9)]) // Keep last 10 requests

    } catch (error) {
      const duration = Date.now() - startTime
      setResponse({
        error: error instanceof Error ? error.message : 'Request failed',
        duration,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateCurlCommand = () => {
    if (!selectedEndpoint || !selectedApiKey) return ''

    const endpointUrl = `${window.location.origin}/api/v1/${username}/${selectedEndpoint.url_path}`
    let curlCommand = `curl -X ${requestMethod} "${endpointUrl}" \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: YOUR_API_KEY_HERE"`
    
    if (['POST', 'PUT'].includes(requestMethod)) {
      curlCommand += ` \\\n  -d '${requestBody.replace(/\n/g, '').replace(/\s+/g, ' ')}'`
    }

    return curlCommand
  }

  const copyRequest = async () => {
    const curlCommand = generateCurlCommand()
    if (!curlCommand) return

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

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE']

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Request Configuration */}
      <div className="lg:col-span-2 space-y-6">
        <Card variant="glass" className="border-enostics-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Terminal className="h-5 w-5" />
              Request Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Method and Endpoint */}
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-enostics-gray-300 mb-2 font-mono">
                  METHOD
                </label>
                <select
                  value={requestMethod}
                  onChange={(e) => setRequestMethod(e.target.value as any)}
                  className="w-full p-3 bg-enostics-gray-900 border border-enostics-gray-600 rounded-lg text-white font-mono focus:ring-2 focus:ring-enostics-blue focus:border-transparent"
                >
                  {httpMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-enostics-gray-300 mb-2 font-mono">
                  ENDPOINT
                </label>
                <select
                  value={selectedEndpoint?.id || ''}
                  onChange={(e) => {
                    const endpoint = endpoints.find(ep => ep.id === e.target.value)
                    setSelectedEndpoint(endpoint || null)
                  }}
                  className="w-full p-3 bg-enostics-gray-900 border border-enostics-gray-600 rounded-lg text-white font-mono focus:ring-2 focus:ring-enostics-blue focus:border-transparent"
                >
                  <option value="">Select endpoint...</option>
                  {endpoints.map((endpoint) => (
                    <option key={endpoint.id} value={endpoint.id}>
                      /{endpoint.url_path}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-enostics-gray-300 mb-2 font-mono">
                API KEY
              </label>
              <select
                value={selectedApiKey}
                onChange={(e) => setSelectedApiKey(e.target.value)}
                className="w-full p-3 bg-enostics-gray-900 border border-enostics-gray-600 rounded-lg text-white font-mono focus:ring-2 focus:ring-enostics-blue focus:border-transparent"
              >
                <option value="">Select API key...</option>
                {userApiKeys.map((apiKey) => (
                  <option key={apiKey.id} value={apiKey.id}>
                    {apiKey.name} ({apiKey.key_prefix})
                  </option>
                ))}
              </select>
            </div>

            {/* Request Body (for POST/PUT) */}
            {['POST', 'PUT'].includes(requestMethod) && (
              <div>
                <label className="block text-sm font-medium text-enostics-gray-300 mb-2 font-mono">
                  REQUEST BODY (JSON)
                </label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full h-48 p-4 bg-black border border-enostics-gray-600 rounded-lg text-green-400 font-mono text-sm focus:ring-2 focus:ring-enostics-blue focus:border-transparent resize-none"
                  placeholder="Enter your JSON payload here..."
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={sendRequest}
                disabled={isLoading || !selectedEndpoint || !selectedApiKey}
                className="flex-1 font-mono"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    SENDING...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    SEND REQUEST
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={copyRequest}
                disabled={!selectedEndpoint || !selectedApiKey}
                className="font-mono"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* cURL Command Preview */}
        <Card variant="glass" className="border-enostics-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Code className="h-5 w-5" />
              cURL Command
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black p-4 rounded-lg">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                {generateCurlCommand() || '# Select endpoint and API key to generate command'}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response and History */}
      <div className="space-y-6">
        {/* Response */}
        {response && (
          <Card variant="glass" className="border-enostics-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-mono">
                  <Terminal className="h-5 w-5" />
                  RESPONSE
                </CardTitle>
                <div className="flex items-center gap-2">
                  {response.duration && (
                    <Badge variant="outline" className="font-mono">
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
            </CardHeader>
            <CardContent>
              <div className="bg-black p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {response.error 
                    ? `ERROR: ${response.error}`
                    : JSON.stringify(response.data, null, 2)
                  }
                </pre>
              </div>
              {response.timestamp && (
                <div className="mt-2 text-xs text-enostics-gray-500 font-mono">
                  {response.timestamp}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Request History */}
        {requestHistory.length > 0 && (
          <Card variant="glass" className="border-enostics-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono">
                <Clock className="h-5 w-5" />
                HISTORY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {requestHistory.map((req, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-enostics-gray-900 rounded border border-enostics-gray-700">
                  <div className="flex items-center gap-2">
                    <Badge variant={req.status >= 200 && req.status < 300 ? 'default' : 'destructive'} className="font-mono text-xs">
                      {req.method}
                    </Badge>
                    <span className="text-sm text-enostics-gray-300 font-mono">
                      /{req.endpoint}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-mono ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                    <span className="text-enostics-gray-500 font-mono">
                      {req.duration}ms
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Console Info */}
        <Card variant="glass" className="border-enostics-gray-700">
          <CardContent className="p-4">
            <div className="space-y-2 text-xs text-enostics-gray-400 font-mono">
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                <span>localhost:3000</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                <span>{endpoints.length} endpoints available</span>
              </div>
              <div className="flex items-center gap-2">
                <Key className="h-3 w-3" />
                <span>{userApiKeys.length} API keys configured</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 