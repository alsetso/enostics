'use client'

import { useState, useEffect } from 'react'
import { DashboardPanel } from '@/components/ui/dashboard-panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusIndicator } from '@/components/ui/dashboard-tabs'
import { 
  Mail, 
  Copy, 
  QrCode, 
  Globe, 
  Shield, 
  Clock, 
  ExternalLink,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { generateInboxUrl } from '@/lib/public-inbox-simple'

interface InboxOverviewProps {
  username: string
  userId: string
}

interface InboxConfig {
  id: string
  user_id: string
  is_public: boolean
  requires_api_key: boolean
  allowed_api_key_id?: string
  max_payload_size: number
  rate_limit_per_hour: number
  rate_limit_per_day: number
}

interface RecentRequest {
  id: string
  payload_type: string
  payload_source: string
  is_authenticated: boolean
  is_suspicious: boolean
  created_at: string
}

export function InboxOverview({ username, userId }: InboxOverviewProps) {
  const [config, setConfig] = useState<InboxConfig | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const inboxUrl = generateInboxUrl(username)

  useEffect(() => {
    fetchInboxData()
  }, [userId])

  const fetchInboxData = async () => {
    try {
      // Fetch inbox config and recent requests in parallel
      const [configResponse, requestsResponse] = await Promise.all([
        fetch('/api/inbox/config'),
        fetch('/api/inbox/recent?limit=5')
      ])

      if (configResponse.ok) {
        const configData = await configResponse.json()
        setConfig(configData.config)
      }

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRecentRequests(requestsData.requests || [])
      }
    } catch (error) {
      console.error('Error fetching inbox data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inboxUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inboxUrl)}`
    window.open(qrUrl, '_blank')
  }

  const testInbox = () => {
    window.open(`${inboxUrl}`, '_blank')
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getStatusIcon = (request: RecentRequest) => {
    if (request.is_suspicious) return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    if (request.is_authenticated) return <Shield className="h-4 w-4 text-green-400" />
    return <CheckCircle className="h-4 w-4 text-blue-400" />
  }

  return (
    <div className="space-y-6">
      {/* Main Inbox Info */}
      <DashboardPanel
        title="Public Inbox"
        subtitle={`Your universal endpoint at ${inboxUrl}`}
        icon={<Mail className="h-5 w-5" />}
        badge={
          config ? {
            text: config.is_public ? "Public" : "Private",
            variant: config.is_public ? "success" : "warning"
          } : undefined
        }
        loading={loading}
      >
        <div className="space-y-6">
          {/* URL Display */}
          <div className="bg-enostics-gray-900/50 rounded-lg p-4 border border-enostics-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Your Inbox URL</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateQRCode}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testInbox}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Test
                </Button>
              </div>
            </div>
            <div className="bg-enostics-gray-800 rounded-lg p-3 font-mono text-sm text-enostics-blue break-all">
              {inboxUrl}
            </div>
            <p className="text-xs text-enostics-gray-400 mt-2">
              Accept any POST request with JSON or text data. Works with curl, fetch, webhooks, IoT devices, and more.
            </p>
          </div>

          {/* Configuration Summary */}
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-enostics-gray-900/50 rounded-lg p-4 border border-enostics-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-enostics-blue" />
                  <span className="font-medium text-white">Access</span>
                </div>
                <StatusIndicator
                  status={config.is_public ? 'success' : 'warning'}
                  label={config.is_public ? 'Public' : 'Private'}
                  size="sm"
                />
                <p className="text-xs text-enostics-gray-400 mt-1">
                  {config.is_public ? 'Anyone can send requests' : 'Requires authentication'}
                </p>
              </div>

              <div className="bg-enostics-gray-900/50 rounded-lg p-4 border border-enostics-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-enostics-blue" />
                  <span className="font-medium text-white">Security</span>
                </div>
                <StatusIndicator
                  status={config.requires_api_key ? 'info' : 'success'}
                  label={config.requires_api_key ? 'API Key Required' : 'Open Access'}
                  size="sm"
                />
                <p className="text-xs text-enostics-gray-400 mt-1">
                  {config.requires_api_key ? 'Authenticated requests only' : 'No authentication required'}
                </p>
              </div>

              <div className="bg-enostics-gray-900/50 rounded-lg p-4 border border-enostics-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-enostics-blue" />
                  <span className="font-medium text-white">Rate Limit</span>
                </div>
                <div className="text-sm text-white font-medium">
                  {config.rate_limit_per_hour.toLocaleString()}/hour
                </div>
                <p className="text-xs text-enostics-gray-400 mt-1">
                  Max requests per hour per IP
                </p>
              </div>
            </div>
          )}

          {/* Usage Examples */}
          <div className="bg-enostics-gray-900/50 rounded-lg p-4 border border-enostics-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Examples</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-enostics-gray-300 mb-1">cURL</div>
                <div className="bg-enostics-gray-800 rounded p-2 text-xs font-mono text-enostics-gray-300 overflow-x-auto">
                  {`curl -X POST ${inboxUrl} -H "Content-Type: application/json" -d '{"type":"message","data":"Hello!"}'`}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-enostics-gray-300 mb-1">JavaScript</div>
                <div className="bg-enostics-gray-800 rounded p-2 text-xs font-mono text-enostics-gray-300 overflow-x-auto">
                  {`fetch('${inboxUrl}', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'event', data: { temperature: 23.5 } }) })`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardPanel>

      {/* Recent Requests */}
      <DashboardPanel
        title="Recent Requests"
        subtitle={`Last ${recentRequests.length} requests received`}
        icon={<Clock className="h-5 w-5" />}
        loading={loading}
      >
        {recentRequests.length === 0 ? (
          <div className="text-center py-8 text-enostics-gray-400">
            <Mail className="h-16 w-16 mx-auto mb-4 text-enostics-gray-600" />
            <p className="text-lg font-medium mb-2">No requests yet</p>
            <p className="text-sm">
              Send your first request to get started! Try the examples above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-enostics-gray-900/50 rounded-lg border border-enostics-gray-800"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(request)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {request.payload_type}
                      </Badge>
                      <span className="text-sm text-enostics-gray-300">
                        from {request.payload_source}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-enostics-gray-400">
                      {request.is_authenticated && (
                        <Badge variant="success" className="text-xs">
                          Authenticated
                        </Badge>
                      )}
                      {request.is_suspicious && (
                        <Badge variant="warning" className="text-xs">
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-enostics-gray-400">
                  {formatTimeAgo(request.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </div>
  )
} 