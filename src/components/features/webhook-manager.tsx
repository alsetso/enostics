'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { 
  Webhook, 
  Globe, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Save
} from 'lucide-react'

interface Endpoint {
  id: string
  name: string
  url_path: string
  webhook_url?: string
  webhook_secret?: string
  webhook_enabled?: boolean
}

interface WebhookManagerProps {
  endpoints: Endpoint[]
  onUpdate: () => void
}

export function WebhookManager({ endpoints, onUpdate }: WebhookManagerProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [webhookEnabled, setWebhookEnabled] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    duration?: number
  } | null>(null)

  useEffect(() => {
    if (selectedEndpoint) {
      setWebhookUrl(selectedEndpoint.webhook_url || '')
      setWebhookSecret(selectedEndpoint.webhook_secret || '')
      setWebhookEnabled(selectedEndpoint.webhook_enabled || false)
      setTestResult(null)
    }
  }, [selectedEndpoint])

  const validateWebhookUrl = (url: string): { valid: boolean; error?: string } => {
    if (!url.trim()) return { valid: false, error: 'URL is required' }
    
    try {
      const parsed = new URL(url)
      
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, error: 'URL must use HTTP or HTTPS protocol' }
      }
      
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return { valid: false, error: 'Localhost URLs are not allowed' }
      }
      
      return { valid: true }
    } catch {
      return { valid: false, error: 'Invalid URL format' }
    }
  }

  const generateSecret = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setWebhookSecret(result)
  }

  const saveWebhookConfig = async () => {
    if (!selectedEndpoint) return

    const validation = validateWebhookUrl(webhookUrl)
    if (webhookEnabled && !validation.valid) {
      setTestResult({ success: false, message: validation.error || 'Invalid URL' })
      return
    }

    setSaving(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/endpoints/webhook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint_id: selectedEndpoint.id,
          webhook_url: webhookEnabled ? webhookUrl : null,
          webhook_secret: webhookEnabled ? webhookSecret : null,
          webhook_enabled: webhookEnabled
        })
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult({ success: true, message: 'Webhook configuration saved successfully' })
        onUpdate()
      } else {
        setTestResult({ success: false, message: result.error || 'Failed to save configuration' })
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to save configuration' 
      })
    } finally {
      setSaving(false)
    }
  }

  const testWebhook = async () => {
    if (!selectedEndpoint || !webhookUrl) return

    const validation = validateWebhookUrl(webhookUrl)
    if (!validation.valid) {
      setTestResult({ success: false, message: validation.error || 'Invalid URL' })
      return
    }

    setSaving(true)
    setTestResult(null)

    const startTime = Date.now()

    try {
      const testPayload = {
        endpoint: {
          id: selectedEndpoint.id,
          name: selectedEndpoint.name,
          url_path: selectedEndpoint.url_path
        },
        request: {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          data: { test: true, message: 'Webhook test from Enostics' },
          timestamp: new Date().toISOString()
        },
        metadata: {
          request_id: 'test-' + Date.now()
        }
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Enostics-Webhook/1.0 (Test)',
          'X-Enostics-Event': 'endpoint.test',
          'X-Enostics-Endpoint': selectedEndpoint.id
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(10000)
      })

      const duration = Date.now() - startTime
      
      if (response.ok) {
        setTestResult({ 
          success: true, 
          message: `Webhook test successful (${response.status})`,
          duration 
        })
      } else {
        setTestResult({ 
          success: false, 
          message: `Webhook returned ${response.status}: ${response.statusText}`,
          duration 
        })
      }
    } catch (error) {
      const duration = Date.now() - startTime
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Webhook test failed',
        duration 
      })
    } finally {
      setSaving(false)
    }
  }

  if (endpoints.length === 0) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-enostics-gray-400">
            <Globe className="h-12 w-12 mx-auto mb-4 text-enostics-gray-600" />
            <p>Create an endpoint first to configure webhooks.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Configuration
        </CardTitle>
        <p className="text-sm text-enostics-gray-400">
          Forward incoming requests to external URLs with optional signature verification.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Endpoint Selection */}
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
                {endpoint.webhook_enabled && ' ✓'}
              </option>
            ))}
          </select>
        </div>

        {selectedEndpoint && (
          <>
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-enostics-gray-900/50 border border-enostics-gray-700 rounded-lg">
              <div>
                <div className="text-sm font-medium text-white">Enable Webhooks</div>
                <div className="text-xs text-enostics-gray-400">
                  Forward all incoming requests to the configured URL
                </div>
              </div>
                             <Button
                 variant={webhookEnabled ? "primary" : "outline"}
                 size="sm"
                 onClick={() => setWebhookEnabled(!webhookEnabled)}
               >
                 {webhookEnabled ? "Enabled" : "Disabled"}
               </Button>
            </div>

            {webhookEnabled && (
              <>
                {/* Webhook URL */}
                <div>
                  <label className="block text-sm font-medium text-enostics-gray-300 mb-2">
                    Webhook URL *
                  </label>
                  <Input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-app.com/webhooks/enostics"
                    className="font-mono"
                  />
                  <p className="text-xs text-enostics-gray-400 mt-1">
                    HTTPS URLs are recommended for security
                  </p>
                </div>

                {/* Webhook Secret */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-enostics-gray-300">
                      Webhook Secret (Optional)
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateSecret}
                      type="button"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="Optional secret for HMAC-SHA256 verification"
                      className="font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showSecret ? (
                        <EyeOff className="h-4 w-4 text-enostics-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-enostics-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-enostics-gray-400 mt-1">
                    Used to generate X-Enostics-Signature header for verification
                  </p>
                </div>

                {/* Test Result */}
                {testResult && (
                  <div className={`p-3 rounded-lg border ${
                    testResult.success 
                      ? 'bg-green-900/20 border-green-500/30 text-green-300'
                      : 'bg-red-900/20 border-red-500/30 text-red-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm">{testResult.message}</span>
                      {testResult.duration && (
                        <Badge variant="outline" className="ml-auto">
                          {testResult.duration}ms
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={saveWebhookConfig}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Configuration
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={testWebhook}
                    disabled={isLoading || !webhookUrl}
                  >
                    Test Webhook
                  </Button>
                </div>

                {/* Webhook Info */}
                <div className="p-4 bg-enostics-blue/10 border border-enostics-blue/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-enostics-blue mt-0.5" />
                    <div className="text-sm">
                      <p className="text-enostics-blue font-medium mb-2">Webhook Headers</p>
                      <div className="space-y-1 text-enostics-gray-300 font-mono text-xs">
                        <div>Content-Type: application/json</div>
                        <div>User-Agent: Enostics-Webhook/1.0</div>
                        <div>X-Enostics-Event: endpoint.request</div>
                        <div>X-Enostics-Endpoint: {selectedEndpoint.id}</div>
                        <div>X-Enostics-Timestamp: [ISO timestamp]</div>
                        {webhookSecret && <div>X-Enostics-Signature: sha256=[signature]</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 