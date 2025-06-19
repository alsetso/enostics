'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Mail, 
  Settings, 
  Brain, 
  Copy, 
  Check, 
  QrCode, 
  Globe, 
  Shield, 
  Zap,
  Sparkles,
  Clock,
  Archive,
  Star,
  MoreVertical,
  ChevronDown,
  Filter,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  Smartphone,
  Bot,
  Monitor,
  Activity,
  ChevronRight,
  Home,
  ExternalLink,
  FileText,
  Calendar,
  User,
  MapPin,
  Database,
  Plus,
  Send,
  Link,
  Inbox
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import QRCodeLib from 'qrcode'
import ComposeMessageModal from '@/components/features/compose-message-modal'
import EnhancedDataModal from '@/components/features/enhanced-data-modal'
import { OnboardingBanner } from '@/components/layout/onboarding-banner'

interface InboxItem {
  id: string
  sender: string
  source: string
  type: string
  subject: string
  preview: string
  timestamp: string
  isRead: boolean
  isStarred: boolean
  data: any
  sourceIcon: React.ReactNode
  receivedAt: string
  sourceIp?: string
  userAgent?: string
  // Enhanced data fields
  enriched_data?: any
  sender_info?: any
  data_quality_score?: number
  business_context?: string
  key_fields?: string[]
  sensitive_data?: boolean
  user_notes?: string
  user_category?: string
  auto_tags?: string[]
  processed_at?: string
  content_type?: string
  data_size?: number
}

// Seeded data for bremercole@gmail.com
const seededInboxItems: InboxItem[] = [
  {
    id: '1',
    sender: 'Apple Health',
    source: 'iot_device',
    type: 'health_data',
    subject: 'Daily Step Count Update',
    preview: 'Steps: 8,432 | Distance: 4.2 miles | Calories: 412',
    timestamp: '2 hours ago',
    receivedAt: '2024-01-15T14:30:22Z',
    isRead: false,
    isStarred: true,
    sourceIcon: <Smartphone className="h-4 w-4" />,
    sourceIp: '192.168.1.104',
    userAgent: 'HealthKit/1.0 (iPhone; iOS 17.2.1)',
    data: { 
      steps: 8432, 
      distance: 4.2, 
      calories: 412,
      activeMinutes: 67,
      heartRateAvg: 78,
      sleepHours: 7.5,
      deviceId: 'iPhone-A2D43F21',
      timestamp: '2024-01-15T14:30:22Z'
    }
  },
  {
    id: '2',
    sender: 'Stripe Webhook',
    source: 'webhook',
    type: 'financial_data',
    subject: 'Payment Received',
    preview: 'Amount: $1,299.00 | Customer: healthcare_provider_001',
    timestamp: '5 hours ago',
    receivedAt: '2024-01-15T11:15:33Z',
    isRead: true,
    isStarred: false,
    sourceIcon: <Globe className="h-4 w-4" />,
    sourceIp: '54.187.174.169',
    userAgent: 'Stripe-Webhook/1.0',
    data: { 
      amount: 1299.00,
      currency: 'USD',
      customer: 'healthcare_provider_001',
      paymentMethod: 'card_1234',
      description: 'Health API Subscription - Premium Plan',
      stripeId: 'pi_3OkLjKA4Z9vF8ePa1mEt2QxY',
      metadata: {
        planType: 'premium',
        billingCycle: 'annual'
      }
    }
  },
  {
    id: '3',
    sender: 'GPT-4 Assistant',
    source: 'gpt_agent',
    type: 'message',
    subject: 'Health Insight Analysis Complete',
    preview: 'Analyzed your recent health trends and found 3 key insights...',
    timestamp: '1 day ago',
    receivedAt: '2024-01-14T16:22:11Z',
    isRead: true,
    isStarred: false,
    sourceIcon: <Bot className="h-4 w-4" />,
    sourceIp: '140.82.112.3',
    userAgent: 'OpenAI-GPT/4.0',
    data: { 
      insights: [
        'Your sleep quality improved 23% this week',
        'Step count trending upward (+12% vs last month)',
        'Heart rate variability suggests good recovery'
      ],
      analysisType: 'health_trends',
      confidence: 0.94,
      dataPoints: 847,
      model: 'gpt-4-turbo',
      processingTime: '2.3s'
    }
  },
  {
    id: '4',
    sender: 'Tesla API',
    source: 'api_client',
    type: 'sensor_data',
    subject: 'Vehicle Status Update',
    preview: 'Battery: 87% | Range: 289 miles | Location: Home',
    timestamp: '1 day ago',
    receivedAt: '2024-01-14T20:45:17Z',
    isRead: false,
    isStarred: true,
    sourceIcon: <Monitor className="h-4 w-4" />,
    sourceIp: '209.133.79.61',
    userAgent: 'Tesla-API/2.1',
    data: { 
      battery: 87,
      range: 289,
      location: 'Home',
      odometer: 23847,
      isCharging: true,
      temperature: 72,
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      },
      vin: '5YJ3E1EA4KF123456'
    }
  },
  {
    id: '5',
    sender: 'Notion Webhook',
    source: 'webhook',
    type: 'event',
    subject: 'Database Updated',
    preview: 'New entry added to Health Tracking database',
    timestamp: '2 days ago',
    receivedAt: '2024-01-13T09:30:44Z',
    isRead: true,
    isStarred: false,
    sourceIcon: <Globe className="h-4 w-4" />,
    sourceIp: '104.16.132.229',
    userAgent: 'Notion-Webhook/1.0',
    data: { 
      database: 'Health Tracking',
      action: 'entry_added',
      pageId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      properties: {
        'Date': '2024-01-13',
        'Weight': '175 lbs',
        'Energy Level': 'High',
        'Notes': 'Feeling great after morning workout'
      },
      userId: 'notion_user_123'
    }
  }
]

export default function InboxPage() {
  const [username, setUsername] = useState('')
  const [inboxUrl, setInboxUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<InboxItem | null>(null)
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(seededInboxItems)
  const [loading, setLoading] = useState(true)

  // Configuration state
  const [config, setConfig] = useState({
    isPublic: true,
    requiresApiKey: false,
    maxPayloadSize: 1048576, // 1MB
    rateLimitPerHour: 1000,
    rateLimitPerDay: 10000,
    webhookEnabled: false,
    webhookUrl: ''
  })

  useEffect(() => {
    fetchUserInfo()
  }, [])

  useEffect(() => {
    if (username) {
      const url = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/v1/${username}`
        : `https://api.enostics.com/v1/${username}`
      setInboxUrl(url)
      generateQRCode(url)
      
      // Fetch real inbox data
      fetchInboxData()
    }
  }, [username])

  const fetchUserInfo = async () => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get user profile and endpoint
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .single()

      const { data: endpoint } = await supabase
        .from('endpoints')
        .select('url_path')
        .eq('user_id', user.id)
        .single()

      if (endpoint?.url_path) {
        setUsername(endpoint.url_path)
      } else if (profile?.username) {
        setUsername(profile.username)
      } else {
        // Fallback to email username
        const emailUsername = user.email?.split('@')[0] || 'user'
        setUsername(emailUsername)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      // Fallback to email username if available
      const supabase = createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const emailUsername = user.email.split('@')[0]
        setUsername(emailUsername)
      }
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
          dark: '#1e293b',
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
      'sensor_data': 'text-green-400',
      'health_data': 'text-red-400',
      'financial_data': 'text-yellow-400',
      'location_data': 'text-blue-400',
      'message': 'text-purple-400',
      'event': 'text-orange-400',
      'task': 'text-cyan-400',
      'note': 'text-gray-400',
      'unknown': 'text-gray-400'
    }
    return colors[type] || colors.unknown
  }

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const openEventDetails = (item: InboxItem) => {
    setSelectedEvent(item)
    // Mark as read when opening
    setInboxItems(prev => 
      prev.map(i => 
        i.id === item.id ? { ...i, isRead: true } : i
      )
    )
  }

  const toggleStar = (id: string) => {
    setInboxItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      )
    )
  }

  const filteredItems = inboxItems.filter(item =>
    item.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unreadCount = inboxItems.filter(item => !item.isRead).length
  const starredCount = inboxItems.filter(item => item.isStarred).length

  const fetchInboxData = async () => {
    try {
      const response = await fetch('/api/inbox/recent?limit=50')
      if (response.ok) {
        const data = await response.json()
        
        // Transform API data to component format
        const transformedItems = data.data.map((item: any) => ({
          id: item.id,
          sender: item.sender || extractSenderFromPayload(item.data),
          source: item.source || 'unknown',
          type: item.type || item.payload_type || 'unknown',
          subject: generateSubjectFromPayload(item.data),
          preview: generatePreviewFromPayload(item.data),
          timestamp: formatTimestamp(item.processed_at),
          receivedAt: item.processed_at,
          isRead: item.is_read || false,
          isStarred: item.is_starred || false,
          sourceIcon: getSourceIcon(item.source || item.payload_source),
          sourceIp: item.source_ip,
          userAgent: item.user_agent,
          data: item.data,
          // Enhanced data fields
          enriched_data: item.enriched_data,
          sender_info: item.sender_info,
          data_quality_score: item.data_quality_score,
          business_context: item.business_context,
          key_fields: item.key_fields,
          sensitive_data: item.sensitive_data,
          user_notes: item.user_notes,
          user_category: item.user_category,
          auto_tags: item.auto_tags,
          processed_at: item.processed_at,
          content_type: item.content_type,
          data_size: item.data_size
        }))
        
        setInboxItems(transformedItems)
      } else {
        console.error('Failed to fetch inbox data')
        // Fallback to seeded data
        setInboxItems(seededInboxItems)
      }
    } catch (error) {
      console.error('Error fetching inbox data:', error)
      // Fallback to seeded data
      setInboxItems(seededInboxItems)
    }
  }

  const extractSenderFromPayload = (payload: any) => {
    if (payload?.source) return payload.source
    if (payload?.from) return payload.from
    if (payload?.sender) return payload.sender
    return 'Unknown Sender'
  }

  const generateSubjectFromPayload = (payload: any) => {
    if (payload?.subject) return payload.subject
    if (payload?.title) return payload.title
    if (payload?.type) return `${payload.type.replace('_', ' ')} Update`
    return 'New Data Received'
  }

  const generatePreviewFromPayload = (payload: any) => {
    const keys = Object.keys(payload?.data || payload || {})
    if (keys.length === 0) return 'Empty payload'
    
    const preview = keys.slice(0, 3).map(key => {
      const value = (payload?.data || payload)[key]
      return `${key}: ${typeof value === 'object' ? JSON.stringify(value).slice(0, 20) : value}`
    }).join(' | ')
    
    return preview.length > 80 ? preview.slice(0, 80) + '...' : preview
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getSourceIcon = (source: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'iot_device': <Smartphone className="h-4 w-4" />,
      'webhook': <Globe className="h-4 w-4" />,
      'gpt_agent': <Bot className="h-4 w-4" />,
      'api_client': <Monitor className="h-4 w-4" />,
      'mobile_app': <Smartphone className="h-4 w-4" />,
      'web_app': <Globe className="h-4 w-4" />
    }
    return iconMap[source] || <Globe className="h-4 w-4" />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Onboarding Banner */}
      <OnboardingBanner />
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-enostics-gray-800 pb-4 mb-6 px-6 pt-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Inbox className="h-6 w-6 text-enostics-purple" />
            <h1 className="text-2xl font-bold text-white">Inbox</h1>
          </div>

          {/* API URL Dropdown */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Link className="h-4 w-4 mr-2" />
                API URL
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Your Inbox Endpoint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 bg-enostics-gray-900 rounded-lg px-3 py-2">
                  <Globe className="h-4 w-4 text-enostics-blue" />
                  <code className="text-sm text-enostics-gray-300 font-mono flex-1">
                    {inboxUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-6 w-6 p-0 hover:bg-enostics-gray-800"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-enostics-gray-400" />
                    )}
                  </Button>
                </div>
                
                <div className="text-center">
                  {qrCode && (
                    <img src={qrCode} alt="Inbox QR Code" className="rounded-lg mx-auto" />
                  )}
                  <p className="text-sm text-enostics-gray-400 mt-2">
                    QR code for quick access
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4" />
          </Button>

          {/* Compose */}
          <Button 
            size="sm"
            onClick={() => setShowCompose(true)}
            className="bg-enostics-purple hover:bg-enostics-purple/80"
          >
            <Send className="h-4 w-4 mr-2" />
            Compose
          </Button>

          {/* Intelligence Modal */}
          <Dialog open={showIntelligence} onOpenChange={setShowIntelligence}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Brain className="h-4 w-4 text-purple-400" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Intelligence Overview
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Data Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Health Devices</span>
                          <span>45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Manual Entry</span>
                          <span>30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Third Party</span>
                          <span>15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>API Clients</span>
                          <span>10%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Processing Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Messages Today</span>
                          <span className="text-green-400">{inboxItems.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Response Time</span>
                          <span className="text-blue-400">120ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate</span>
                          <span className="text-green-400">99.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage Used</span>
                          <span className="text-orange-400">2.4MB</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-enostics-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Privacy First</span>
                  </div>
                  <p className="text-xs text-enostics-gray-400">
                    All intelligence processing happens locally on your device. Your data never leaves your control.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Settings Modal */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Inbox Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public">Public Access</Label>
                    <Switch
                      id="public"
                      checked={config.isPublic}
                      onCheckedChange={(checked) =>
                        setConfig(prev => ({ ...prev, isPublic: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="api-key">Require API Key</Label>
                    <Switch
                      id="api-key"
                      checked={config.requiresApiKey}
                      onCheckedChange={(checked) =>
                        setConfig(prev => ({ ...prev, requiresApiKey: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate-limit">Rate Limit (per hour)</Label>
                    <Input
                      id="rate-limit"
                      type="number"
                      value={config.rateLimitPerHour}
                      onChange={(e) =>
                        setConfig(prev => ({ ...prev, rateLimitPerHour: parseInt(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL (optional)</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-webhook-url.com"
                      value={config.webhookUrl}
                      onChange={(e) =>
                        setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))
                      }
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => setShowSettings(false)}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gmail-style Inbox */}
      <div className="flex-1 flex flex-col px-6">
        {/* Inbox Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Inbox ({unreadCount})
            </h2>
            <Badge variant="outline" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
            <Badge variant="outline" className="text-xs text-orange-400">
              Seeded Data
            </Badge>
          </div>
          
          <div className="text-sm text-enostics-gray-400">
            {filteredItems.length} of {inboxItems.length} items
          </div>
        </div>

        {/* Inbox Items */}
        <div className="space-y-1 flex-1 overflow-y-auto pb-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-enostics-gray-900/50 ${
                item.isRead 
                  ? 'border-enostics-gray-800 bg-enostics-gray-950/50' 
                  : 'border-enostics-gray-700 bg-enostics-gray-900/30'
              }`}
              onClick={() => openEventDetails(item)}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleItemSelection(item.id)}
                className="rounded"
                onClick={(e) => e.stopPropagation()}
              />
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleStar(item.id)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star className={`h-4 w-4 ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-enostics-gray-400'}`} />
              </button>

              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-32">
                  {item.sourceIcon}
                  <span className={`text-sm truncate ${item.isRead ? 'text-enostics-gray-400' : 'text-white font-medium'}`}>
                    {item.sender}
                  </span>
                  <Badge variant="outline" className={`text-xs ${getTypeColor(item.type)}`}>
                    {item.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${item.isRead ? 'text-enostics-gray-300' : 'text-white font-medium'}`}>
                    {item.subject}
                  </div>
                  <div className="text-xs text-enostics-gray-500 truncate">
                    {item.preview}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-enostics-gray-400 whitespace-nowrap">
                    {item.timestamp}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Data Modal */}
      <EnhancedDataModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        record={selectedEvent ? {
          id: selectedEvent.id,
          data: selectedEvent.data,
          processed_at: selectedEvent.processed_at || selectedEvent.receivedAt,
          source_ip: selectedEvent.sourceIp,
          user_agent: selectedEvent.userAgent,
          content_type: selectedEvent.content_type,
          data_size: selectedEvent.data_size || JSON.stringify(selectedEvent.data).length,
          enriched_data: selectedEvent.enriched_data,
          sender_info: selectedEvent.sender_info,
          data_quality_score: selectedEvent.data_quality_score,
          business_context: selectedEvent.business_context,
          key_fields: selectedEvent.key_fields,
          sensitive_data: selectedEvent.sensitive_data,
          user_notes: selectedEvent.user_notes,
          user_category: selectedEvent.user_category,
          auto_tags: selectedEvent.auto_tags
        } : null}
        onUpdate={async (updates) => {
          if (!selectedEvent) return
          
          try {
            const response = await fetch(`/api/inbox/update/${selectedEvent.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
            })
            
            if (response.ok) {
              // Update local state
              setInboxItems(prev => 
                prev.map(item => 
                  item.id === selectedEvent.id 
                    ? { ...item, ...updates }
                    : item
                )
              )
              
              // Update selected event
              setSelectedEvent(prev => prev ? { ...prev, ...updates } : null)
            }
          } catch (error) {
            console.error('Error updating record:', error)
          }
        }}
      />

      {/* Compose Message Modal */}
      <ComposeMessageModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSent={(result) => {
          // Optionally refresh inbox after sending
          fetchInboxData()
        }}
      />
    </div>
  )
} 