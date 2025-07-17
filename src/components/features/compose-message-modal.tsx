'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Send, 
  X, 
  Loader2,
  User,
  Database,
  Globe,
  Zap,
  TestTube,
  Check,
  Copy,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Code,
  Eye,
  EyeOff,
  Terminal,
  Bookmark,
  Search
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface Endpoint {
  id: string
  name: string
  url_path: string
  is_active: boolean
  user_id: string
  description?: string
}

interface Header {
  key: string
  value: string
  enabled: boolean
}

interface ComposeMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSent?: (data: any) => void
  prefilledEndpoint?: string
  prefilledData?: any
}

export default function ComposeMessageModal({
  isOpen,
  onClose,
  onSent,
  prefilledEndpoint,
  prefilledData
}: ComposeMessageModalProps) {
  // Main state
  const [targetEndpoint, setTargetEndpoint] = useState('')
  const [customEndpoint, setCustomEndpoint] = useState('')
  const [useCustomEndpoint, setUseCustomEndpoint] = useState(true) // Start with custom endpoint mode
  const [messageData, setMessageData] = useState('')
  const [dataType, setDataType] = useState('json')
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'User-Agent', value: 'Enostics-Compose/1.0', enabled: true }
  ])

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showCurl, setShowCurl] = useState(false)
  const [showHeaders, setShowHeaders] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [searchEndpoints, setSearchEndpoints] = useState('')

  // Data state
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [recentEndpoints, setRecentEndpoints] = useState<string[]>([])
  const [favoriteEndpoints, setFavoriteEndpoints] = useState<string[]>([])
  const [sendResult, setSendResult] = useState<any>(null)
  const [error, setError] = useState('')

  // Validation state
  const [endpointValidation, setEndpointValidation] = useState<{
    isValid: boolean
    isVerifying: boolean
    message: string
    isEnosticsEndpoint: boolean
  }>({
    isValid: false,
    isVerifying: false,
    message: '',
    isEnosticsEndpoint: false
  })

  // Load endpoints and prefill data
  useEffect(() => {
    if (isOpen) {
      loadEndpoints()
      loadRecentEndpoints()
      loadFavoriteEndpoints()
      
      if (prefilledEndpoint) {
        setTargetEndpoint(prefilledEndpoint)
      }
      if (prefilledData) {
        setMessageData(typeof prefilledData === 'string' ? prefilledData : JSON.stringify(prefilledData, null, 2))
        setDataType('json')
      }
    }
  }, [isOpen, prefilledEndpoint, prefilledData])

  const loadEndpoints = async () => {
    try {
      setIsLoading(true)
      const supabase = createClientSupabaseClient()
      
      // Get all public endpoints + user's own endpoints
      const { data: publicEndpoints, error: publicError } = await supabase
        .from('enostics_endpoints')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .order('name')

      const { data: { user } } = await supabase.auth.getUser()
      let userEndpoints: Endpoint[] = []
      
      if (user) {
        const { data: userEps, error: userError } = await supabase
          .from('enostics_endpoints')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('name')
        
        if (!userError && userEps) {
          userEndpoints = userEps
        }
      }

      // Combine and deduplicate
      const allEndpoints = [...(publicEndpoints || []), ...userEndpoints]
      const uniqueEndpoints = allEndpoints.filter((ep, index, self) => 
        index === self.findIndex(e => e.id === ep.id)
      )
      
      setEndpoints(uniqueEndpoints)
    } catch (error) {
      console.error('Error loading endpoints:', error)
      setError('Failed to load endpoints')
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecentEndpoints = () => {
    const recent = localStorage.getItem('enostics_recent_endpoints')
    if (recent) {
      setRecentEndpoints(JSON.parse(recent))
    }
  }

  const loadFavoriteEndpoints = () => {
    const favorites = localStorage.getItem('enostics_favorite_endpoints')
    if (favorites) {
      setFavoriteEndpoints(JSON.parse(favorites))
    }
  }

  const addToRecent = (endpointPath: string) => {
    const recent = [...recentEndpoints.filter(ep => ep !== endpointPath), endpointPath].slice(-5)
    setRecentEndpoints(recent)
    localStorage.setItem('enostics_recent_endpoints', JSON.stringify(recent))
  }

  const toggleFavorite = (endpointPath: string) => {
    let favorites = [...favoriteEndpoints]
    if (favorites.includes(endpointPath)) {
      favorites = favorites.filter(ep => ep !== endpointPath)
    } else {
      favorites.push(endpointPath)
    }
    setFavoriteEndpoints(favorites)
    localStorage.setItem('enostics_favorite_endpoints', JSON.stringify(favorites))
  }

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }])
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers]
    newHeaders[index] = { ...newHeaders[index], [field]: value }
    setHeaders(newHeaders)
  }

  const getTargetUrl = () => {
    if (useCustomEndpoint) {
      // Check if it's an Enostics endpoint and we're in development
      if (validateEnosticsEndpoint(customEndpoint) && window.location.hostname === 'localhost') {
        const username = extractUsernameFromEndpoint(customEndpoint)
        console.log('Development mode detected, redirecting to local endpoint:', username)
        if (username) {
          const localUrl = `${window.location.origin}/api/v1/${username}`
          console.log('Using local URL:', localUrl)
          return localUrl
        }
      }
      return customEndpoint.startsWith('http') ? customEndpoint : `https://${customEndpoint}`
    }
    return `${window.location.origin}/api/v1/${targetEndpoint}`
  }

  const generateCurlCommand = () => {
    const url = getTargetUrl()
    const enabledHeaders = headers.filter(h => h.enabled && h.key && h.value)
    
    let curl = `curl -X POST "${url}"`
    
    enabledHeaders.forEach(header => {
      curl += ` \\\n  -H "${header.key}: ${header.value}"`
    })
    
    if (messageData) {
      if (dataType === 'json') {
        curl += ` \\\n  -d '${messageData}'`
      } else {
        curl += ` \\\n  --data-raw '${messageData}'`
      }
    }
    
    return curl
  }

  const validateData = () => {
    if (dataType === 'json' && messageData) {
      try {
        JSON.parse(messageData)
        return true
      } catch {
        setError('Invalid JSON format')
        return false
      }
    }
    return true
  }

  const handleSend = async () => {
    if (!targetEndpoint && !useCustomEndpoint) {
      setError('Please select or enter an endpoint')
      return
    }

    if (!messageData.trim()) {
      setError('Please enter some data to send')
      return
    }

    if (!validateData()) {
      return
    }

    setIsSending(true)
    setError('')
    setSendResult(null)

    try {
      const url = getTargetUrl()
      const enabledHeaders = headers.filter(h => h.enabled && h.key && h.value)
      
      const requestHeaders: Record<string, string> = {}
      enabledHeaders.forEach(header => {
        requestHeaders[header.key] = header.value
      })

      const startTime = Date.now()
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': dataType === 'json' ? 'application/json' : 'text/plain',
          ...requestHeaders
        },
        body: messageData
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      let responseData
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      }

      setSendResult(result)

      if (response.ok) {
        // Add to recent endpoints
        const endpointPath = useCustomEndpoint ? customEndpoint : targetEndpoint
        addToRecent(endpointPath)
        
        // Call success callback
        onSent?.(result)
        
        // Auto-close after 2 seconds if successful
        setTimeout(() => {
          onClose()
        }, 2000)
      }

    } catch (error: any) {
      console.error('Send error:', error)
      setSendResult({
        success: false,
        error: error.message || 'Network error occurred'
      })
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Endpoint validation functions
  const validateEnosticsEndpoint = (endpoint: string): boolean => {
    // Check if it matches the Enostics endpoint format
    const enosticsPattern = /^https:\/\/api\.enostics\.com\/v1\/[a-zA-Z0-9_-]+$/
    return enosticsPattern.test(endpoint)
  }

  const extractUsernameFromEndpoint = (endpoint: string): string | null => {
    const match = endpoint.match(/^https:\/\/api\.enostics\.com\/v1\/([a-zA-Z0-9_-]+)$/)
    return match ? match[1] : null
  }

  const verifyEndpoint = async (endpoint: string) => {
    console.log('Verifying endpoint:', endpoint) // Debug log
    setEndpointValidation(prev => ({ ...prev, isVerifying: true }))
    
    try {
      // Check if it's an Enostics endpoint
      const isEnosticsEndpoint = validateEnosticsEndpoint(endpoint)
      console.log('Is Enostics endpoint:', isEnosticsEndpoint) // Debug log
      
      if (isEnosticsEndpoint) {
        const username = extractUsernameFromEndpoint(endpoint)
        console.log('Extracted username:', username) // Debug log
        
        if (username) {
          // Verify the endpoint exists by making a GET request
          try {
            const response = await fetch(`/api/v1/${username}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            })
            
            console.log('API response status:', response.status) // Debug log
            
            if (response.ok || response.status === 405) { // 405 is expected for GET on POST endpoint
              setEndpointValidation({
                isValid: true,
                isVerifying: false,
                message: `✓ Valid Enostics endpoint for user: ${username}`,
                isEnosticsEndpoint: true
              })
            } else if (response.status === 404) {
              setEndpointValidation({
                isValid: false,
                isVerifying: false,
                message: `✗ User "${username}" not found on Enostics`,
                isEnosticsEndpoint: true
              })
            } else {
              setEndpointValidation({
                isValid: false,
                isVerifying: false,
                message: `✗ Unable to verify endpoint (status: ${response.status})`,
                isEnosticsEndpoint: true
              })
            }
          } catch (fetchError) {
            console.error('Fetch error:', fetchError) // Debug log
            setEndpointValidation({
              isValid: false,
              isVerifying: false,
              message: '✗ Error connecting to endpoint',
              isEnosticsEndpoint: true
            })
          }
        } else {
          setEndpointValidation({
            isValid: false,
            isVerifying: false,
            message: '✗ Invalid Enostics endpoint format',
            isEnosticsEndpoint: true
          })
        }
      } else {
        // For non-Enostics endpoints, just check if URL is valid
        try {
          new URL(endpoint)
          setEndpointValidation({
            isValid: true,
            isVerifying: false,
            message: '✓ Valid external endpoint URL',
            isEnosticsEndpoint: false
          })
        } catch {
          setEndpointValidation({
            isValid: false,
            isVerifying: false,
            message: '✗ Invalid URL format',
            isEnosticsEndpoint: false
          })
        }
      }
    } catch (error) {
      console.error('Validation error:', error) // Debug log
      setEndpointValidation({
        isValid: false,
        isVerifying: false,
        message: '✗ Error verifying endpoint',
        isEnosticsEndpoint: false
      })
    }
  }

  // Auto-validate when custom endpoint changes
  useEffect(() => {
    console.log('useEffect triggered:', { useCustomEndpoint, customEndpoint }) // Debug log
    if (useCustomEndpoint && customEndpoint.trim()) {
      // Reduce debounce time for faster feedback
      const timeoutId = setTimeout(() => {
        const fullUrl = customEndpoint.startsWith('http') ? customEndpoint : `https://${customEndpoint}`
        console.log('About to verify:', fullUrl) // Debug log
        verifyEndpoint(fullUrl)
      }, 300) // Faster validation
      
      return () => clearTimeout(timeoutId)
    } else {
      console.log('Clearing validation') // Debug log
      setEndpointValidation({
        isValid: false,
        isVerifying: false,
        message: '',
        isEnosticsEndpoint: false
      })
    }
  }, [customEndpoint, useCustomEndpoint])

  // Auto-validate when Enostics endpoint is selected
  useEffect(() => {
    if (!useCustomEndpoint && targetEndpoint.trim()) {
      const fullUrl = `${window.location.origin}/api/v1/${targetEndpoint}`
      verifyEndpoint(fullUrl)
    } else if (!useCustomEndpoint) {
      setEndpointValidation({
        isValid: false,
        isVerifying: false,
        message: '',
        isEnosticsEndpoint: false
      })
    }
  }, [targetEndpoint, useCustomEndpoint])

  const filteredEndpoints = endpoints.filter(ep => 
    ep.name.toLowerCase().includes(searchEndpoints.toLowerCase()) ||
    ep.url_path.toLowerCase().includes(searchEndpoints.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--secondary-bg))] border-[hsl(var(--border-color))]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--text-primary))]">
            <Send className="h-5 w-5" />
            Compose & Send Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Endpoint Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[hsl(var(--text-primary))]">
                Target Endpoint
              </h3>
              <div className="flex items-center gap-2">
                                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setUseCustomEndpoint(!useCustomEndpoint)}
                   className="text-xs"
                 >
                   {useCustomEndpoint ? 'Browse Endpoints' : 'Custom URL'}
                 </Button>
              </div>
            </div>

                         {!useCustomEndpoint ? (
               <div className="space-y-3">
                 {/* Search endpoints */}
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
                   <Input
                     placeholder="Search endpoints..."
                     value={searchEndpoints}
                     onChange={(e) => setSearchEndpoints(e.target.value)}
                     className="pl-10"
                   />
                 </div>

                 {/* Favorites */}
                 {favoriteEndpoints.length > 0 && (
                   <div className="space-y-2">
                     <h4 className="text-xs font-medium text-[hsl(var(--text-secondary))] flex items-center gap-1">
                       <Bookmark className="h-3 w-3" />
                       Favorites
                     </h4>
                     <div className="flex flex-wrap gap-2">
                       {favoriteEndpoints.map(ep => (
                         <Button
                           key={ep}
                           variant={targetEndpoint === ep ? "primary" : "outline"}
                           size="sm"
                           onClick={() => setTargetEndpoint(ep)}
                           className="text-xs"
                         >
                           {ep}
                         </Button>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Recent endpoints */}
                 {recentEndpoints.length > 0 && (
                   <div className="space-y-2">
                     <h4 className="text-xs font-medium text-[hsl(var(--text-secondary))]">Recent</h4>
                     <div className="flex flex-wrap gap-2">
                       {recentEndpoints.map(ep => (
                         <Button
                           key={ep}
                           variant={targetEndpoint === ep ? "primary" : "outline"}
                           size="sm"
                           onClick={() => setTargetEndpoint(ep)}
                           className="text-xs"
                         >
                           {ep}
                         </Button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             ) : (
               <div className="space-y-2">
                 <Input
                   placeholder="https://api.enostics.com/v1/username or https://api.example.com/webhook"
                   value={customEndpoint}
                   onChange={(e) => setCustomEndpoint(e.target.value)}
                 />
                 <div className="text-xs text-[hsl(var(--text-muted))] space-y-1">
                   <p><strong>Enostics format:</strong> https://api.enostics.com/v1/username</p>
                   <p><strong>External format:</strong> https://api.example.com/webhook</p>
                 </div>
               </div>
             )}

                         {/* Target URL Preview & Validation */}
             {(targetEndpoint || customEndpoint) && (
               <div className="space-y-2">
                 <div className="p-3 bg-[hsl(var(--hover-bg))] rounded-md">
                   <div className="flex items-center gap-2 text-sm">
                     <Globe className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                     <span className="text-[hsl(var(--text-secondary))]">Target URL:</span>
                     <code className="text-[hsl(var(--text-primary))] font-mono text-xs bg-[hsl(var(--primary-bg))] px-2 py-1 rounded">
                       {getTargetUrl()}
                     </code>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => copyToClipboard(getTargetUrl())}
                     >
                       <Copy className="h-3 w-3" />
                     </Button>
                   </div>
                 </div>

                 {/* Endpoint Validation Status */}
                 {(endpointValidation.message || endpointValidation.isVerifying) && (
                   <div className={`p-3 rounded-md border ${
                     endpointValidation.isVerifying 
                       ? 'bg-blue-500/10 border-blue-500/20' 
                       : endpointValidation.isValid
                       ? 'bg-green-500/10 border-green-500/20'
                       : 'bg-red-500/10 border-red-500/20'
                   }`}>
                     <div className="flex items-center gap-2 text-sm">
                       {endpointValidation.isVerifying ? (
                         <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                       ) : endpointValidation.isValid ? (
                         <Check className="h-4 w-4 text-green-400" />
                       ) : (
                         <X className="h-4 w-4 text-red-400" />
                       )}
                       <span className={`${
                         endpointValidation.isVerifying 
                           ? 'text-blue-300' 
                           : endpointValidation.isValid
                           ? 'text-green-300'
                           : 'text-red-300'
                       }`}>
                         {endpointValidation.isVerifying 
                           ? 'Verifying endpoint...' 
                           : endpointValidation.message}
                       </span>
                       {endpointValidation.isEnosticsEndpoint && !endpointValidation.isVerifying && (
                         <Badge variant="outline" className="text-xs">
                           Enostics
                         </Badge>
                       )}
                     </div>
                   </div>
                 )}
               </div>
             )}
          </div>

          {/* Data Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[hsl(var(--text-primary))]">
                Data to Send
              </h3>
              <div className="flex items-center gap-2">
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="form">Form Data</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Textarea
              placeholder={
                dataType === 'json' 
                  ? '{\n  "message": "Hello from Enostics!",\n  "timestamp": "2024-01-01T00:00:00Z",\n  "data": {\n    "key": "value"\n  }\n}'
                  : dataType === 'form'
                  ? 'key1=value1&key2=value2'
                  : 'Enter your message or data here...'
              }
              value={messageData}
              onChange={(e) => setMessageData(e.target.value)}
              className="min-h-32 font-mono text-sm"
            />

            {/* Data Preview */}
            {showPreview && messageData && dataType === 'json' && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-[hsl(var(--text-secondary))]">JSON Preview</h4>
                <div className="p-3 bg-[hsl(var(--primary-bg))] rounded-md border border-[hsl(var(--border-color))]">
                  <pre className="text-xs text-[hsl(var(--text-primary))] overflow-x-auto">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(messageData), null, 2)
                      } catch {
                        return 'Invalid JSON'
                      }
                    })()}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full justify-between"
            >
              <span>Advanced Options</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showAdvanced && (
              <div className="space-y-4 p-4 border border-[hsl(var(--border-color))] rounded-md">
                {/* Headers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-[hsl(var(--text-primary))]">
                      Headers
                    </h4>
                    <Button variant="outline" size="sm" onClick={addHeader}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Header
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <Input
                          placeholder="Header name"
                          value={header.key}
                          onChange={(e) => updateHeader(index, 'key', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Header value"
                          value={header.value}
                          onChange={(e) => updateHeader(index, 'value', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* cURL Command */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCurl(!showCurl)}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      cURL Command
                    </span>
                    {showCurl ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  {showCurl && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[hsl(var(--text-secondary))]">
                          Copy this command to test in terminal
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generateCurlCommand())}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3 bg-[hsl(var(--primary-bg))] rounded-md border border-[hsl(var(--border-color))]">
                        <pre className="text-xs text-[hsl(var(--text-primary))] overflow-x-auto whitespace-pre-wrap">
                          {generateCurlCommand()}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Send Result */}
          {sendResult && (
            <div className={`p-4 rounded-md border ${
              sendResult.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {sendResult.success ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
                <span className={`font-medium ${
                  sendResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {sendResult.success ? 'Success!' : 'Failed'}
                </span>
                {sendResult.status && (
                  <Badge variant="outline">
                    {sendResult.status} {sendResult.statusText}
                  </Badge>
                )}
                {sendResult.responseTime && (
                  <Badge variant="outline">
                    {sendResult.responseTime}ms
                  </Badge>
                )}
              </div>
              
              {sendResult.data && (
                <div className="mt-2">
                  <h5 className="text-sm font-medium mb-1 text-[hsl(var(--text-primary))]">Response:</h5>
                  <pre className="text-xs bg-[hsl(var(--hover-bg))] text-[hsl(var(--text-primary))] p-2 rounded border border-[hsl(var(--border-color))] overflow-x-auto">
                    {typeof sendResult.data === 'string' 
                      ? sendResult.data 
                      : JSON.stringify(sendResult.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {sendResult.error && (
                <p className="text-sm text-red-400 mt-2">{sendResult.error}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border-color))]">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <Button 
              onClick={handleSend}
              disabled={(() => {
                const conditions = {
                  isSending,
                  noMessageData: !messageData.trim(),
                  noEndpoint: useCustomEndpoint ? customEndpoint.trim() === '' : !targetEndpoint,
                  invalidEndpoint: endpointValidation.message !== '' && !endpointValidation.isValid
                }
                const isDisabled = conditions.isSending || conditions.noMessageData || conditions.noEndpoint || conditions.invalidEndpoint
                console.log('Button disabled conditions:', JSON.stringify(conditions, null, 2), 'Overall disabled:', isDisabled)
                console.log('Current state:', JSON.stringify({ 
                  useCustomEndpoint, 
                  customEndpoint, 
                  targetEndpoint, 
                  messageDataLength: messageData.length,
                  messageDataPreview: messageData.substring(0, 50),
                  endpointValidation 
                }, null, 2))
                return isDisabled
              })()}
              className="min-w-24"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 