'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Inbox, 
  Copy, 
  Check, 
  QrCode, 
  Settings, 
  Globe, 
  Shield, 
  Zap,
  Eye,
  Filter,
  Sparkles
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import QRCodeLib from 'qrcode'

interface InboxConfig {
  is_public: boolean
  requires_api_key: boolean
  max_payload_size: number
  rate_limit_per_hour: number
  rate_limit_per_day: number
  webhook_enabled: boolean
  webhook_url?: string
}

interface RecentRequest {
  id: string
  payload_type: string
  payload_source: string
  is_authenticated: boolean
  abuse_score: number
  created_at: string
  payload: any
}

export function UniversalInboxViewer() {
  const [config, setConfig] = useState<InboxConfig | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [inboxUrl, setInboxUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    fetchUserInfo()
    fetchInboxConfig()
    fetchRecentRequests()
  }, [])

  useEffect(() => {
    if (username) {
      const url = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/v1/${username}`
        : `https://api.enostics.com/v1/${username}`
      setInboxUrl(url)
      generateQRCode(url)
    }
  }, [username])

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

  const fetchInboxConfig = async () => {
    try {
      const response = await fetch('/api/inbox/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Error fetching inbox config:', error)
    }
  }

  const fetchRecentRequests = async () => {
    try {
      const response = await fetch('/api/inbox/recent?limit=10')
      if (response.ok) {
        const data = await response.json()
        setRecentRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching recent requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (url: string) => {
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCode(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'sensor_data': 'bg-green-500/20 text-green-400',
      'health_data': 'bg-red-500/20 text-red-400',
      'financial_data': 'bg-yellow-500/20 text-yellow-400',
      'location_data': 'bg-blue-500/20 text-blue-400',
      'message': 'bg-purple-500/20 text-purple-400',
      'event': 'bg-orange-500/20 text-orange-400',
      'task': 'bg-cyan-500/20 text-cyan-400',
      'note': 'bg-gray-500/20 text-gray-400',
      'unknown': 'bg-gray-500/20 text-gray-400'
    }
    return colors[type] || colors.unknown
  }

  const getSourceIcon = (source: string) => {
    const icons: Record<string, React.ReactNode> = {
      'iot_device': <Zap className="h-3 w-3" />,
      'mobile_app': <Globe className="h-3 w-3" />,
      'web_app': <Globe className="h-3 w-3" />,
      'webhook': <Settings className="h-3 w-3" />,
      'gpt_agent': <Sparkles className="h-3 w-3" />,
      'api_client': <Settings className="h-3 w-3" />
    }
    return icons[source] || <Settings className="h-3 w-3" />
  }

  if (loading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Universal Inbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-enostics-gray-800/50 rounded" />
            <div className="h-20 bg-enostics-gray-800/50 rounded" />
            <div className="h-20 bg-enostics-gray-800/50 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Inbox Card */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Your Universal Inbox
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={config?.is_public ? "default" : "secondary"}>
                {config?.is_public ? 'Public' : 'Private'}
              </Badge>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inbox URL Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Your Endpoint</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-enostics-gray-900/50 rounded-lg border border-enostics-gray-800">
              <code className="flex-1 text-sm text-enostics-green font-mono">
                {inboxUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="p-2 h-8 w-8"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-enostics-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {showQR && qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCode} alt="QR Code for inbox URL" className="w-48 h-48" />
              </div>
            )}
          </div>

          {/* Configuration Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-enostics-blue" />
                <span className="text-sm font-medium text-enostics-gray-300">Access</span>
              </div>
              <p className="text-white">
                {config?.is_public ? 'Public' : 'Private'}
              </p>
              <p className="text-xs text-enostics-gray-400">
                Anyone can send data
              </p>
            </div>

            <div className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-enostics-green" />
                <span className="text-sm font-medium text-enostics-gray-300">Security</span>
              </div>
              <p className="text-white">
                {config?.requires_api_key ? 'API Key Required' : 'Open'}
              </p>
              <p className="text-xs text-enostics-gray-400">
                Authentication level
              </p>
            </div>

            <div className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-enostics-yellow" />
                <span className="text-sm font-medium text-enostics-gray-300">Rate Limit</span>
              </div>
              <p className="text-white">
                {config?.rate_limit_per_hour || 1000}/hour
              </p>
              <p className="text-xs text-enostics-gray-400">
                Requests per hour
              </p>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Quick Examples</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
                <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">cURL</h4>
                <code className="text-xs text-enostics-gray-400 block whitespace-pre-wrap">
{`curl -X POST ${inboxUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"type": "note", "content": "Hello!"}'`}
                </code>
              </div>
              <div className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
                <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">JavaScript</h4>
                <code className="text-xs text-enostics-gray-400 block whitespace-pre-wrap">
{`fetch('${inboxUrl}', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({type: 'event', data: 42})
})`}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Requests ({recentRequests.length})
            </CardTitle>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="h-12 w-12 text-enostics-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No requests yet</h3>
              <p className="text-enostics-gray-400 mb-4">
                Start sending data to your universal inbox
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800 hover:border-enostics-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getTypeColor(request.payload_type)}>
                        {request.payload_type}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-enostics-gray-400">
                        {getSourceIcon(request.payload_source)}
                        <span>{request.payload_source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.is_authenticated && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Auth
                        </Badge>
                      )}
                      <span className="text-xs text-enostics-gray-500">
                        {new Date(request.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-enostics-gray-300 truncate">
                    {JSON.stringify(request.payload).substring(0, 100)}...
                  </div>
                  
                  {request.abuse_score > 30 && (
                    <div className="mt-2">
                      <Badge variant="destructive" className="text-xs">
                        Abuse Score: {request.abuse_score}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 