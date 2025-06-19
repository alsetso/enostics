'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { 
  Webhook, 
  Plus, 
  Play, 
  Settings, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Zap,
  MessageSquare,
  Home,
  Mail,
  Smartphone
} from 'lucide-react'

interface WebhookData {
  id: string
  endpoint_id: string
  name: string
  description?: string
  webhook_url: string
  webhook_secret?: string
  trigger_events: string[]
  trigger_conditions: any
  is_active: boolean
  timeout_seconds: number
  max_retries: number
  retry_backoff: string
  calls_this_month: number
  successful_calls: number
  failed_calls: number
  total_calls: number
  last_triggered_at?: string
  last_successful_at?: string
  avg_response_time_ms: number
  created_at: string
  updated_at: string
  endpoint?: {
    id: string
    name: string
    url_path: string
  }
}

interface WebhookTemplate {
  id: string
  name: string
  description: string
  category: string
  provider: string
  icon_url?: string
  template_config: any
  example_payload: any
  setup_instructions: string
  usage_count: number
}

interface WebhookLog {
  id: string
  webhook_id: string
  trigger_event: string
  request_url: string
  response_status?: number
  response_time_ms?: number
  is_successful: boolean
  error_message?: string
  error_type?: string
  executed_at: string
  webhook?: {
    id: string
    name: string
    webhook_url: string
  }
}

export function SmartWebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [templates, setTemplates] = useState<WebhookTemplate[]>([])
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'webhooks' | 'templates' | 'logs'>('webhooks')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookData | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<WebhookTemplate | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    endpoint_id: '',
    name: '',
    description: '',
    webhook_url: '',
    webhook_secret: '',
    trigger_events: ['data_received'],
    timeout_seconds: 30,
    max_retries: 3,
    retry_backoff: 'exponential'
  })
  
  // Test states
  const [testUrl, setTestUrl] = useState('')
  const [testSecret, setTestSecret] = useState('')
  const [testData, setTestData] = useState('{"test": true, "message": "Hello from Enostics!"}')
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchWebhooks(),
        fetchTemplates(),
        fetchEndpoints(),
        fetchLogs()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks')
      const data = await response.json()
      if (response.ok) {
        setWebhooks(data.webhooks || [])
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/webhooks/templates')
      const data = await response.json()
      if (response.ok) {
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const fetchEndpoints = async () => {
    try {
      const response = await fetch('/api/endpoints')
      const data = await response.json()
      if (response.ok) {
        setEndpoints(data.endpoints || [])
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/webhooks/logs?limit=20')
      const data = await response.json()
      if (response.ok) {
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const handleCreateWebhook = async () => {
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        resetForm()
        fetchWebhooks()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating webhook:', error)
      alert('Failed to create webhook')
    }
  }

  const handleUpdateWebhook = async () => {
    if (!selectedWebhook) return

    try {
      const response = await fetch('/api/webhooks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedWebhook.id, ...formData })
      })

      if (response.ok) {
        setShowEditModal(false)
        setSelectedWebhook(null)
        resetForm()
        fetchWebhooks()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating webhook:', error)
      alert('Failed to update webhook')
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      const response = await fetch(`/api/webhooks?id=${webhookId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchWebhooks()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
      alert('Failed to delete webhook')
    }
  }

  const handleTestWebhook = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_url: testUrl,
          webhook_secret: testSecret || undefined,
          sample_data: JSON.parse(testData)
        })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      console.error('Error testing webhook:', error)
      setTestResult({
        success: false,
        error: 'Failed to test webhook',
        error_type: 'client_error'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleUseTemplate = async (template: WebhookTemplate) => {
    if (!endpoints.length) {
      alert('You need to create an endpoint first')
      return
    }

    const webhookUrl = prompt('Enter your webhook URL:')
    if (!webhookUrl) return

    const webhookSecret = prompt('Enter webhook secret (optional):') || undefined

    try {
      const response = await fetch('/api/webhooks/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          endpoint_id: endpoints[0].id,
          webhook_url: webhookUrl,
          webhook_secret: webhookSecret
        })
      })

      if (response.ok) {
        fetchWebhooks()
        alert('Webhook created successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating webhook from template:', error)
      alert('Failed to create webhook')
    }
  }

  const openEditModal = (webhook: WebhookData) => {
    setSelectedWebhook(webhook)
    setFormData({
      endpoint_id: webhook.endpoint_id,
      name: webhook.name,
      description: webhook.description || '',
      webhook_url: webhook.webhook_url,
      webhook_secret: webhook.webhook_secret || '',
      trigger_events: webhook.trigger_events,
      timeout_seconds: webhook.timeout_seconds,
      max_retries: webhook.max_retries,
      retry_backoff: webhook.retry_backoff
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      endpoint_id: '',
      name: '',
      description: '',
      webhook_url: '',
      webhook_secret: '',
      trigger_events: ['data_received'],
      timeout_seconds: 30,
      max_retries: 3,
      retry_backoff: 'exponential'
    })
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'slack': return <MessageSquare className="h-5 w-5" />
      case 'discord': return <MessageSquare className="h-5 w-5" />
      case 'zapier': return <Zap className="h-5 w-5" />
      case 'ifttt': return <Home className="h-5 w-5" />
      case 'email': return <Mail className="h-5 w-5" />
      default: return <Webhook className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSuccessRate = (webhook: WebhookData) => {
    if (webhook.total_calls === 0) return 0
    return Math.round((webhook.successful_calls / webhook.total_calls) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading webhooks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Webhooks</h2>
          <p className="text-gray-600">Automate your data flow with intelligent webhooks</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowTestModal(true)}
            variant="outline"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Test Webhook
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Webhook
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'webhooks', label: 'My Webhooks', count: webhooks.length },
            { id: 'templates', label: 'Templates', count: templates.length },
            { id: 'logs', label: 'Activity Logs', count: logs.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          {webhooks.length === 0 ? (
            <Card className="p-8 text-center">
              <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first webhook to start automating your data flow
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Webhook
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{webhook.name}</h3>
                        <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {webhook.is_active && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {getSuccessRate(webhook)}% success
                          </Badge>
                        )}
                      </div>
                      {webhook.description && (
                        <p className="text-gray-600 mb-3">{webhook.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          {new URL(webhook.webhook_url).hostname}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          {webhook.total_calls} calls
                        </span>
                        {webhook.last_triggered_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Last: {formatDate(webhook.last_triggered_at)}
                          </span>
                        )}
                        {webhook.avg_response_time_ms > 0 && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            {webhook.avg_response_time_ms}ms avg
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(webhook)}
                        className="gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  {getProviderIcon(template.provider)}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{template.category}</Badge>
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          {logs.length === 0 ? (
            <Card className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-600">
                Webhook execution logs will appear here once your webhooks start receiving data
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {log.is_successful ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {log.webhook?.name || 'Unknown Webhook'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {log.webhook?.webhook_url && new URL(log.webhook.webhook_url).hostname}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{formatDate(log.executed_at)}</p>
                      {log.response_time_ms && (
                        <p>{log.response_time_ms}ms</p>
                      )}
                      {log.response_status && (
                        <Badge variant={log.is_successful ? 'default' : 'destructive'}>
                          {log.response_status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {log.error_message && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      {log.error_message}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Webhook Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Create New Webhook</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Select
                    value={formData.endpoint_id}
                    onValueChange={(value) => setFormData({ ...formData, endpoint_id: value })}
                  >
                    <option value="">Select endpoint...</option>
                    {endpoints.map((endpoint) => (
                      <option key={endpoint.id} value={endpoint.id}>
                        {endpoint.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Webhook"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What does this webhook do?"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
                <div>
                  <Label htmlFor="webhook_secret">Webhook Secret (optional)</Label>
                  <Input
                    id="webhook_secret"
                    type="password"
                    value={formData.webhook_secret}
                    onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                    placeholder="For HMAC signature verification"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWebhook}>
                  Create Webhook
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Test Webhook Modal */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Test Webhook</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test_url">Webhook URL</Label>
                  <Input
                    id="test_url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://webhook.site/unique-id"
                  />
                </div>
                <div>
                  <Label htmlFor="test_secret">Webhook Secret (optional)</Label>
                  <Input
                    id="test_secret"
                    type="password"
                    value={testSecret}
                    onChange={(e) => setTestSecret(e.target.value)}
                    placeholder="For HMAC signature verification"
                  />
                </div>
                <div>
                  <Label htmlFor="test_data">Test Data (JSON)</Label>
                  <Textarea
                    id="test_data"
                    value={testData}
                    onChange={(e) => setTestData(e.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
                {testResult && (
                  <div className={`p-3 rounded border ${
                    testResult.success 
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      <span className="font-medium">
                        {testResult.success ? 'Success!' : 'Failed'}
                      </span>
                      {testResult.status_code && (
                        <Badge variant={testResult.success ? 'default' : 'destructive'}>
                          {testResult.status_code}
                        </Badge>
                      )}
                      {testResult.duration_ms && (
                        <span className="text-sm">({testResult.duration_ms}ms)</span>
                      )}
                    </div>
                    {testResult.error && (
                      <p className="text-sm">{testResult.error}</p>
                    )}
                    {testResult.response_body && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">Response</summary>
                        <pre className="mt-1 text-xs bg-white/50 p-2 rounded overflow-auto">
                          {testResult.response_body}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowTestModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={handleTestWebhook}
                  disabled={testing || !testUrl}
                  className="gap-2"
                >
                  {testing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Test Webhook
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
} 