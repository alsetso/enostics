'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Webhook, 
  Plus, 
  Play, 
  Activity, 
  CheckCircle, 
  ExternalLink,
  Edit,
  Trash2,
  Zap,
  MessageSquare,
  Home,
  Mail
} from 'lucide-react'

interface WebhookData {
  id: string
  endpoint_id: string
  name: string
  description?: string
  webhook_url: string
  is_active: boolean
  calls_this_month: number
  successful_calls: number
  total_calls: number
  avg_response_time_ms: number
}

interface WebhookTemplate {
  id: string
  name: string
  description: string
  category: string
  provider: string
}

export function WebhookDashboard() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [templates, setTemplates] = useState<WebhookTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'webhooks' | 'templates'>('webhooks')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchWebhooks(),
        fetchTemplates()
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
      } else {
        // Fallback templates when database isn't set up
        setTemplates([
          {
            id: 'slack-fallback',
            name: 'Slack Notifications',
            description: 'Send messages to Slack channels when data arrives',
            category: 'Communication',
            provider: 'slack'
          },
          {
            id: 'discord-fallback',
            name: 'Discord Webhook',
            description: 'Post updates to Discord servers',
            category: 'Communication',
            provider: 'discord'
          },
          {
            id: 'zapier-fallback',
            name: 'Zapier Integration',
            description: 'Connect to 5000+ apps via Zapier',
            category: 'Automation',
            provider: 'zapier'
          },
          {
            id: 'email-fallback',
            name: 'Email Notifications',
            description: 'Send email alerts when conditions are met',
            category: 'Communication',
            provider: 'email'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      // Fallback templates on error
      setTemplates([
        {
          id: 'slack-fallback',
          name: 'Slack Notifications',
          description: 'Send messages to Slack channels when data arrives',
          category: 'Communication',
          provider: 'slack'
        },
        {
          id: 'discord-fallback',
          name: 'Discord Webhook',
          description: 'Post updates to Discord servers',
          category: 'Communication',
          provider: 'discord'
        },
        {
          id: 'zapier-fallback',
          name: 'Zapier Integration',
          description: 'Connect to 5000+ apps via Zapier',
          category: 'Automation',
          provider: 'zapier'
        },
        {
          id: 'email-fallback',
          name: 'Email Notifications',
          description: 'Send email alerts when conditions are met',
          category: 'Communication',
          provider: 'email'
        }
      ])
    }
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
            variant="outline" 
            className="gap-2"
            onClick={() => setShowTestModal(true)}
          >
            <Play className="h-4 w-4" />
            Test Webhook
          </Button>
          <Button 
            className="gap-2"
            onClick={() => setShowCreateModal(true)}
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
            { id: 'templates', label: 'Templates', count: templates.length }
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

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          {webhooks.length === 0 ? (
            <Card className="p-8 text-center">
              <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first webhook to start automating your data flow
              </p>
              <Button 
                className="gap-2"
                onClick={() => setShowCreateModal(true)}
              >
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
                        {webhook.avg_response_time_ms > 0 && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            {webhook.avg_response_time_ms}ms avg
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700">
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

      {/* Templates Tab */}
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
                    className="gap-1"
                    onClick={() => {
                      alert('Phase 2 database schema needs to be applied first. Check APPLY_SCHEMA_INSTRUCTIONS.md')
                    }}
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

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Create Webhook</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Slack Webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="What does this webhook do?"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => {
                alert('Phase 2 database schema needs to be applied first. Check APPLY_SCHEMA_INSTRUCTIONS.md')
                setShowCreateModal(false)
              }}>
                Create Webhook
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Test Webhook Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium mb-4">Test Webhook</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://webhook.site/unique-id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Data (JSON)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={4}
                  defaultValue='{"test": true, "message": "Hello from Enostics!"}'
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowTestModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => {
                alert('Phase 2 database schema needs to be applied first. Check APPLY_SCHEMA_INSTRUCTIONS.md')
                setShowTestModal(false)
              }}>
                <Play className="h-4 w-4 mr-2" />
                Test Webhook
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 