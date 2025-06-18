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
  Database,
  Plus,
  Send,
  X,
  ChevronLeft
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import QRCodeLib from 'qrcode'
import { ComposeMessageModal } from '@/components/features/compose-message-modal'


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
  const [username, setUsername] = useState('bremercole')
  const [inboxUrl, setInboxUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showCompose, setShowCompose] = useState(false)

  const [inboxItems, setInboxItems] = useState<InboxItem[]>(seededInboxItems)
  const [showUtilityRail, setShowUtilityRail] = useState(true)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    type: 'all',
    read: 'all',
    starred: 'all',
    timeRange: '7d'
  })

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
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/v1/${username}`
      : `https://api.enostics.com/v1/${username}`
    setInboxUrl(url)
    generateQRCode(url)
    
    // Fetch real inbox data
    fetchInboxData()
  }, [username])

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
    // Navigate to event detail page in same window
    window.location.href = `/dashboard/inbox/event/${item.id}`
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
          sender: item.sender || extractSenderFromPayload(item.payload),
          source: item.source || 'unknown',
          type: item.type || item.payload_type || 'unknown',
          subject: generateSubjectFromPayload(item.payload),
          preview: generatePreviewFromPayload(item.payload),
          timestamp: formatTimestamp(item.created_at),
          receivedAt: item.created_at,
          isRead: item.is_read || false,
          isStarred: item.is_starred || false,
          sourceIcon: getSourceIcon(item.source || item.payload_source),
          sourceIp: item.source_ip,
          userAgent: item.user_agent,
          data: item.payload
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

  // Utility rail actions
  const handleArchive = () => {
    if (selectedItems.length > 0) {
      // Archive selected items
      console.log('Archiving items:', selectedItems)
      // TODO: Implement archive functionality
    }
  }

  const handleStarToggle = () => {
    if (selectedItems.length > 0) {
      selectedItems.forEach(id => toggleStar(id))
    }
  }

  const handleRefresh = () => {
    fetchInboxData()
  }

  const handleFilter = () => {
    setShowFilterPanel(!showFilterPanel)
  }

  const handleSettings = () => {
    setShowSettingsPanel(!showSettingsPanel)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return // Don't trigger when typing in inputs
      
      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault()
          handleArchive()
          break
        case 's':
          e.preventDefault()
          handleStarToggle()
          break
        case 'f':
          e.preventDefault()
          handleFilter()
          break
        case 'r':
          e.preventDefault()
          handleRefresh()
          break
        case 'g':
          e.preventDefault()
          handleSettings()
          break
        case 'i':
          e.preventDefault()
          setShowIntelligence(!showIntelligence)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedItems])

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar - Endpoint & QR Code */}
      <div className="border-b border-enostics-gray-800 pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">
              Your Personal Inbox
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-enostics-gray-900 rounded-lg px-3 py-2">
                <Globe className="h-4 w-4 text-enostics-blue" />
                <code className="text-sm text-enostics-gray-300 font-mono">
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
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Inbox QR Code</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center space-y-4 py-4">
                    {qrCode && (
                      <img src={qrCode} alt="Inbox QR Code" className="rounded-lg" />
                    )}
                    <p className="text-sm text-enostics-gray-400 text-center">
                      Scan this code to quickly access your inbox endpoint
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Utility Rail */}
      <div className="flex-1 flex">
        {/* Left Utility Rail */}
        <div className="w-14 flex flex-col items-center gap-4 py-6 border-r border-enostics-gray-800/50 bg-enostics-gray-950/50">
          {/* Archive */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-enostics-gray-400 hover:text-white/80 hover:bg-enostics-gray-800/50 transition-all duration-200"
              onClick={handleArchive}
              disabled={selectedItems.length === 0}
            >
              <Archive className="h-5 w-5" />
            </Button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-enostics-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Archive (A)
              </div>
            </div>
          </div>

          {/* Star */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-enostics-gray-400 hover:text-white/80 hover:bg-enostics-gray-800/50 transition-all duration-200"
              onClick={handleStarToggle}
              disabled={selectedItems.length === 0}
            >
              <Star className="h-5 w-5" />
            </Button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-enostics-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Star (S)
              </div>
            </div>
          </div>

          {/* Intelligence */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className={`h-10 w-10 p-0 transition-all duration-200 ${
                showIntelligence 
                  ? 'text-purple-400 bg-enostics-gray-800' 
                  : 'text-enostics-gray-400 hover:text-purple-400/80 hover:bg-enostics-gray-800/50'
              }`}
              onClick={() => setShowIntelligence(!showIntelligence)}
            >
              <Brain className="h-5 w-5" />
            </Button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-enostics-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Intelligence (I)
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className={`h-10 w-10 p-0 transition-all duration-200 ${
                showFilterPanel 
                  ? 'text-white bg-enostics-gray-800' 
                  : 'text-enostics-gray-400 hover:text-white/80 hover:bg-enostics-gray-800/50'
              }`}
              onClick={handleFilter}
            >
              <Filter className="h-5 w-5" />
            </Button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-enostics-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Filter (F)
              </div>
            </div>
          </div>

          {/* Refresh */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-enostics-gray-400 hover:text-white/80 hover:bg-enostics-gray-800/50 transition-all duration-200"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-enostics-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Refresh (R)
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className={`h-10 w-10 p-0 transition-all duration-200 ${
                showSettingsPanel 
                  ? 'text-white bg-enostics-gray-800' 
                  : 'text-enostics-gray-400 hover:text-white/80 hover:bg-enostics-gray-800/50'
              }`}
              onClick={handleSettings}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-enostics-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Settings (G)
              </div>
            </div>
          </div>
        </div>

        {/* Main Inbox Content */}
        <div className="flex-1 flex flex-col px-6">
          {/* Gmail-style Inbox */}
          <div className="flex-1 flex flex-col">
            {/* Inbox Header */}
            <div className="flex items-center justify-between mb-6 pt-2">
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
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                  <Input
                    placeholder="Search inbox..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Inbox Toolbar */}
            <div className="flex items-center justify-between border-b border-enostics-gray-800 pb-4 mb-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setShowCompose(true)}
                  className="bg-enostics-blue hover:bg-enostics-blue/80 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Compose
                </Button>
              </div>
              
              <div className="text-sm text-enostics-gray-400">
                {filteredItems.length} of {inboxItems.length} items
              </div>
            </div>

            {/* Inbox Items */}
            <div className="flex-1 overflow-y-auto">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group flex items-center gap-3 px-4 py-3 border-b border-enostics-gray-800/30 transition-all duration-200 cursor-pointer hover:bg-enostics-gray-900/30 ${
                    !item.isRead ? 'bg-enostics-gray-950/30' : ''
                  } ${
                    selectedItems.includes(item.id) 
                      ? 'bg-indigo-500/5 border-b-indigo-500/50' 
                      : ''
                  } ${
                    index === filteredItems.length - 1 ? 'border-b-0' : ''
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
        </div>



        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="fixed left-14 top-0 bottom-0 w-80 bg-enostics-gray-950/95 backdrop-blur-sm border-r border-enostics-gray-800/50 z-20 animate-in slide-in-from-left duration-200">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Filter Messages</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilterPanel(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">Message Type</Label>
                  <select
                    value={filterOptions.type}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="health_data">Health Data</option>
                    <option value="financial_data">Financial Data</option>
                    <option value="sensor_data">Sensor Data</option>
                    <option value="message">Messages</option>
                    <option value="event">Events</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">Read Status</Label>
                  <select
                    value={filterOptions.read}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, read: e.target.value }))}
                    className="w-full bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="all">All Messages</option>
                    <option value="unread">Unread Only</option>
                    <option value="read">Read Only</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">Starred</Label>
                  <select
                    value={filterOptions.starred}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, starred: e.target.value }))}
                    className="w-full bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="all">All Messages</option>
                    <option value="starred">Starred Only</option>
                    <option value="unstarred">Unstarred Only</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">Time Range</Label>
                  <select
                    value={filterOptions.timeRange}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, timeRange: e.target.value }))}
                    className="w-full bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="1d">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-enostics-gray-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterOptions({ type: 'all', read: 'all', starred: 'all', timeRange: '7d' })}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowFilterPanel(false)}
                  className="flex-1 bg-enostics-blue hover:bg-enostics-blue/80"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettingsPanel && (
          <div className="fixed left-14 top-0 bottom-0 w-80 bg-enostics-gray-950/95 backdrop-blur-sm border-r border-enostics-gray-800/50 z-20 animate-in slide-in-from-left duration-200">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Inbox Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettingsPanel(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="public" className="text-sm font-medium text-white">Public Access</Label>
                  <Switch
                    id="public"
                    checked={config.isPublic}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({ ...prev, isPublic: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="api-key" className="text-sm font-medium text-white">Require API Key</Label>
                  <Switch
                    id="api-key"
                    checked={config.requiresApiKey}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({ ...prev, requiresApiKey: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-limit" className="text-sm font-medium text-white">Rate Limit (per hour)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={config.rateLimitPerHour}
                    onChange={(e) =>
                      setConfig(prev => ({ ...prev, rateLimitPerHour: parseInt(e.target.value) }))
                    }
                    className="bg-enostics-gray-900 border-enostics-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url" className="text-sm font-medium text-white">Webhook URL (optional)</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-webhook-url.com"
                    value={config.webhookUrl}
                    onChange={(e) =>
                      setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))
                    }
                    className="bg-enostics-gray-900 border-enostics-gray-700"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-enostics-gray-800">
                <Button 
                  onClick={() => setShowSettingsPanel(false)}
                  className="w-full bg-enostics-blue hover:bg-enostics-blue/80"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Intelligence Panel */}
        {showIntelligence && (
          <div className="fixed left-14 top-0 bottom-0 w-96 bg-enostics-gray-950/95 backdrop-blur-sm border-r border-enostics-gray-800/50 z-20 animate-in slide-in-from-left duration-200">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Inbox Intelligence
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIntelligence(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto">
                <div className="text-sm text-enostics-gray-400">
                  Your personal, private AI assistant will help analyze and categorize incoming data.
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <Card variant="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Data Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-red-400">Health Data</span>
                          <span>40%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">Sensor Data</span>
                          <span>25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-400">Financial</span>
                          <span>20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-400">Messages</span>
                          <span>15%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>IoT Devices</span>
                          <span>45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Webhooks</span>
                          <span>30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI Agents</span>
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
                      <CardTitle className="text-sm">Recent Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                          <div>
                            <div className="text-white font-medium">Pattern detected in health data</div>
                            <div className="text-enostics-gray-400 text-xs">Your step count shows consistent improvement over the last 7 days</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                          <div>
                            <div className="text-white font-medium">Anomaly in financial data</div>
                            <div className="text-enostics-gray-400 text-xs">Payment amount 3x higher than usual - flagged for review</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                          <div>
                            <div className="text-white font-medium">Data correlation found</div>
                            <div className="text-enostics-gray-400 text-xs">Vehicle charging patterns align with your daily routine</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Suggested Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                          <Zap className="h-3 w-3 mr-2" />
                          Create health trend automation
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                          <AlertCircle className="h-3 w-3 mr-2" />
                          Set payment threshold alert
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                          <Activity className="h-3 w-3 mr-2" />
                          Export correlation analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-enostics-gray-800 rounded-lg p-3">
                  <p className="text-xs text-enostics-gray-400">
                    <Shield className="h-3 w-3 inline mr-1" />
                    All intelligence processing happens locally on your device. Your data never leaves your control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Compose Message Modal */}
      <ComposeMessageModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSend={(message: any) => {
          // Optionally refresh inbox after sending
          fetchInboxData()
        }}
      />
    </div>
  )
}