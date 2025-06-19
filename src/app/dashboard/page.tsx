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
  Link,
  Inbox,
  Heart
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import QRCodeLib from 'qrcode'
import ComposeMessageModal from '@/components/features/compose-message-modal'
import { CustomCheckbox } from '@/components/ui/custom-checkbox'



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

// Seeded data for bremercole@gmail.com - 50 rows with duplicates
const seededInboxItems: InboxItem[] = [
  // Original 5 items repeated 10 times with slight variations
  ...Array.from({ length: 10 }, (_, i) => [
    {
      id: `1-${i}`,
      sender: 'Apple Health',
      source: 'iot_device',
      type: 'health_data',
      subject: 'Daily Step Count Update',
      preview: `Steps: ${8432 + i * 100} | Distance: ${4.2 + i * 0.1} miles | Calories: ${412 + i * 10}`,
      timestamp: `${2 + i}h`,
      receivedAt: `2024-01-15T${14 - i}:30:22Z`,
      isRead: i % 3 === 0,
      isStarred: i % 4 === 0,
      sourceIcon: <Smartphone className="h-4 w-4" />,
      sourceIp: '192.168.1.104',
      userAgent: 'HealthKit/1.0 (iPhone; iOS 17.2.1)',
      data: { 
        steps: 8432 + i * 100, 
        distance: 4.2 + i * 0.1, 
        calories: 412 + i * 10,
        activeMinutes: 67 + i,
        heartRateAvg: 78 + i,
        sleepHours: 7.5 + (i * 0.1),
        deviceId: `iPhone-A2D43F21-${i}`,
        timestamp: `2024-01-15T${14 - i}:30:22Z`
      }
    },
    {
      id: `2-${i}`,
      sender: 'Stripe Webhook',
      source: 'webhook',
      type: 'financial_data',
      subject: 'Payment Received',
      preview: `Amount: $${1299 + i * 100}.00 | Customer: healthcare_provider_${String(i).padStart(3, '0')}`,
      timestamp: `${5 + i}h`,
      receivedAt: `2024-01-15T${11 - i}:15:33Z`,
      isRead: i % 2 === 0,
      isStarred: i % 5 === 0,
      sourceIcon: <Globe className="h-4 w-4" />,
      sourceIp: '54.187.174.169',
      userAgent: 'Stripe-Webhook/1.0',
      data: { 
        amount: 1299 + i * 100,
        currency: 'USD',
        customer: `healthcare_provider_${String(i).padStart(3, '0')}`,
        paymentMethod: `card_${1234 + i}`,
        description: 'Health API Subscription - Premium Plan',
        stripeId: `pi_3OkLjKA4Z9vF8ePa1mEt2Q${i}`,
        metadata: {
          planType: 'premium',
          billingCycle: 'annual'
        }
      }
    },
    {
      id: `3-${i}`,
      sender: 'GPT-4 Assistant',
      source: 'gpt_agent',
      type: 'message',
      subject: 'Health Insight Analysis Complete',
      preview: `Analyzed your recent health trends and found ${3 + i} key insights...`,
      timestamp: `${1 + i}d`,
      receivedAt: `2024-01-${14 - i}T16:22:11Z`,
      isRead: i % 3 === 1,
      isStarred: i % 6 === 0,
      sourceIcon: <Bot className="h-4 w-4" />,
      sourceIp: '140.82.112.3',
      userAgent: 'OpenAI-GPT/4.0',
      data: { 
        insights: [
          `Your sleep quality improved ${23 + i}% this week`,
          `Step count trending upward (+${12 + i}% vs last month)`,
          'Heart rate variability suggests good recovery'
        ],
        analysisType: 'health_trends',
        confidence: 0.94 - (i * 0.01),
        dataPoints: 847 + i * 10,
        model: 'gpt-4-turbo',
        processingTime: `${2.3 + i * 0.1}s`
      }
    },
    {
      id: `4-${i}`,
      sender: 'Tesla API',
      source: 'api_client',
      type: 'sensor_data',
      subject: 'Vehicle Status Update',
      preview: `Battery: ${87 - i}% | Range: ${289 - i * 5} miles | Location: ${i % 2 === 0 ? 'Home' : 'Work'}`,
      timestamp: `${1 + i}d`,
      receivedAt: `2024-01-${14 - i}T20:45:17Z`,
      isRead: i % 4 === 0,
      isStarred: i % 3 === 0,
      sourceIcon: <Monitor className="h-4 w-4" />,
      sourceIp: '209.133.79.61',
      userAgent: 'Tesla-API/2.1',
      data: { 
        battery: 87 - i,
        range: 289 - i * 5,
        location: i % 2 === 0 ? 'Home' : 'Work',
        odometer: 23847 + i * 10,
        isCharging: i % 2 === 0,
        temperature: 72 + i,
        coordinates: {
          lat: 37.7749 + (i * 0.001),
          lng: -122.4194 + (i * 0.001)
        },
        vin: `5YJ3E1EA4KF12345${i}`
      }
    },
    {
      id: `5-${i}`,
      sender: 'Notion Webhook',
      source: 'webhook',
      type: 'event',
      subject: 'Database Updated',
      preview: `New entry added to ${i % 2 === 0 ? 'Health Tracking' : 'Fitness Goals'} database`,
      timestamp: `${2 + i}d`,
      receivedAt: `2024-01-${13 - i}T09:30:44Z`,
      isRead: i % 2 === 1,
      isStarred: i % 7 === 0,
      sourceIcon: <Globe className="h-4 w-4" />,
      sourceIp: '104.16.132.229',
      userAgent: 'Notion-Webhook/1.0',
      data: { 
        database: i % 2 === 0 ? 'Health Tracking' : 'Fitness Goals',
        action: 'entry_added',
        pageId: `a1b2c3d4-e5f6-7890-abcd-ef123456789${i}`,
        properties: {
          'Date': `2024-01-${13 - i}`,
          'Weight': `${175 + i} lbs`,
          'Energy Level': i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
          'Notes': `Feeling ${i % 2 === 0 ? 'great' : 'good'} after morning workout`
        },
        userId: `notion_user_${123 + i}`
      }
    }
  ]).flat()
]

export default function DashboardPage() {
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InboxItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<InboxItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [inboxUrl, setInboxUrl] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState({
    isPublic: true,
    requiresApiKey: false,
    rateLimitPerHour: 1000,
    webhookUrl: ''
  })

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchInboxData()
  }, [])

  useEffect(() => {
    // Filter items based on search query
    if (searchQuery.trim() === '') {
      setFilteredItems(inboxItems)
    } else {
      const filtered = inboxItems.filter(item => 
        item.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, inboxItems])

  const generateQRCode = async (url: string) => {
    try {
      const qrCodeDataURL = await QRCodeLib.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCode(qrCodeDataURL)
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
    switch (type) {
      case 'health_data': return 'text-red-400'
      case 'financial_data': return 'text-green-400'
      case 'sensor_data': return 'text-blue-400'
      case 'message': return 'text-purple-400'
      case 'event': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getSourceIcon = (source: string, type: string) => {
    if (source === 'iot_device' || type === 'sensor_data') {
      return <Activity className="h-4 w-4 text-purple-400" />
    }
    if (source === 'webhook' || type === 'financial_data') {
      return <Globe className="h-4 w-4 text-blue-400" />
    }
    if (source === 'gpt_agent' || type === 'message') {
      return <Brain className="h-4 w-4 text-yellow-400" />
    }
    if (type === 'health_data') {
      return <Heart className="h-4 w-4 text-green-400" />
    }
    return <Database className="h-4 w-4 text-gray-400" />
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
    // Mark as read
    setInboxItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, isRead: true } : i
    ))
  }

  const toggleStar = (id: string) => {
    setInboxItems(prev => prev.map(item => 
      item.id === id ? { ...item, isStarred: !item.isStarred } : item
    ))
  }

  const fetchInboxData = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Failed to fetch inbox data')
        setInboxItems([])
        setInboxUrl(`https://api.enostics.com/v1/demo`)
        generateQRCode(`https://api.enostics.com/v1/demo`)
        return
      }

      // Get user's endpoint to build the correct URL
      const { data: endpoints } = await supabase
        .from('enostics_endpoints')
        .select('url_path')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)

      const userEndpoint = endpoints?.[0]?.url_path || user.email?.split('@')[0] || 'demo'
      setInboxUrl(`https://api.enostics.com/v1/${userEndpoint}`)
      generateQRCode(`https://api.enostics.com/v1/${userEndpoint}`)

      // Fetch real inbox data
      const response = await fetch('/api/inbox/recent?limit=50')
      if (response.ok) {
        const result = await response.json()
        
        // Transform the data to match our component's expected format
        const transformedItems: InboxItem[] = result.data.map((item: any) => ({
          id: item.id,
          sender: item.sender,
          source: item.source,
          type: item.type,
          subject: item.subject,
          preview: item.preview,
          timestamp: item.timestamp,
          isRead: item.is_read,
          isStarred: item.is_starred,
          data: item.payload,
          sourceIcon: getSourceIcon(item.source, item.type),
          receivedAt: item.timestamp,
          sourceIp: item.source_ip,
          userAgent: item.user_agent
        }))

        setInboxItems(transformedItems)
      } else {
        console.error('Failed to fetch inbox data')
        setInboxItems([])
      }
    } catch (error: any) {
      console.error('Error fetching inbox data:', error)
      setInboxItems([])
    }
  }

  const unreadCount = filteredItems.filter(item => !item.isRead).length

  // Update subtitle with record counts
  useEffect(() => {
    const updateSubtitle = () => {
      const subtitle = `${filteredItems.length} records • ${unreadCount} unread`
      const event = new CustomEvent('updateSubtitle', { 
        detail: { subtitle } 
      })
      window.dispatchEvent(event)
    }

    updateSubtitle()
  }, [filteredItems.length, unreadCount])

  return (
            <div className="h-full flex flex-col bg-[hsl(var(--secondary-bg))]">
      {/* Hero Section - Fixed at top */}
      <div className="flex-shrink-0 bg-[hsl(var(--primary-bg))] border-b border-[hsl(var(--border-color))]">
        {/* Status Bar */}
        <div className="h-10 bg-[hsl(var(--hover-bg))] border-b border-[hsl(var(--border-color))] flex items-center justify-between px-6">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-[hsl(var(--text-muted))]">LIVE</span>
            </div>
            <div className="text-[hsl(var(--text-muted))]">|</div>
            <div className="text-[hsl(var(--text-muted))]">API: {inboxUrl}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 px-2 text-xs"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-muted))]">
            <span>Records: {filteredItems.length}</span>
            <span>Unread: {unreadCount}</span>
            <span>Sources: 5</span>
          </div>
        </div>

        {/* Control Bar */}
                    <div className="h-12 bg-[hsl(var(--primary-bg))] border-b border-[hsl(var(--border-color))] flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 bg-[hsl(var(--hover-bg))] hover:bg-[hsl(var(--hover-bg))]/80 text-[hsl(var(--text-primary))]" onClick={() => setShowCompose(true)}>
              <Send className="h-3 w-3 mr-2" />
              Compose
            </Button>
            <Button variant="outline" size="sm" className="h-8" disabled={selectedItems.length === 0}>
              <Archive className="h-3 w-3 mr-2" />
              Archive
            </Button>
            <Button variant="outline" size="sm" className="h-8" disabled={selectedItems.length === 0}>
              <Star className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={fetchInboxData}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-[hsl(var(--text-muted))]" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 w-64 bg-[hsl(var(--hover-bg))] border-[hsl(var(--border-color))] text-sm text-[hsl(var(--text-primary))]"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Brain className="h-3 w-3 text-purple-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Records List - Scrollable content area */}
      <div className="flex-1 overflow-hidden">
        {/* Table Header - Fixed */}
        <div className="h-10 bg-[hsl(var(--hover-bg))] border-b border-[hsl(var(--border-color))] flex items-center px-6 text-xs font-medium text-[hsl(var(--text-muted))]">
          <div className="w-8"></div>
          <div className="w-8"></div>
          <div className="w-32">SOURCE</div>
          <div className="w-24">TYPE</div>
          <div className="flex-1">SUBJECT</div>
          <div className="w-32">RECEIVED</div>
          <div className="w-8"></div>
        </div>

        {/* Records - Scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-[hsl(var(--border-color))]">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`h-12 flex items-center px-6 hover:bg-[hsl(var(--hover-bg))] cursor-pointer transition-colors group ${
                !item.isRead ? 'bg-[hsl(var(--primary-bg))]' : 'bg-transparent'
              }`}
              onClick={() => openEventDetails(item)}
            >
              <div className="w-8 flex justify-center">
                <CustomCheckbox
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  size="sm"
                />
              </div>
              <div className="w-8 flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStar(item.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star className={`h-3 w-3 ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-[hsl(var(--text-muted))]'}`} />
                </button>
              </div>
              <div className="w-32">
                <div className="flex items-center gap-2 text-sm">
                  {item.sourceIcon}
                  <span className={`truncate ${!item.isRead ? 'text-[hsl(var(--text-primary))] font-medium' : 'text-[hsl(var(--text-secondary))]'}`}>
                    {item.sender}
                  </span>
                </div>
              </div>
              <div className="w-24">
                <span className={`text-xs px-2 py-1 rounded ${getTypeColor(item.type)} bg-[hsl(var(--hover-bg))]`}>
                  {item.type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${!item.isRead ? 'text-[hsl(var(--text-primary))] font-medium' : 'text-[hsl(var(--text-secondary))]'}`}>
                  {item.subject}
                </div>
                <div className="text-xs text-[hsl(var(--text-muted))] truncate">
                  {item.preview}
                </div>
              </div>
              <div className="w-32 text-right">
                <span className="text-xs text-[hsl(var(--text-muted))]">{item.timestamp}</span>
              </div>
              <div className="w-8 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--primary-bg))] border-[hsl(var(--border-color))]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-[hsl(var(--text-primary))]">
                  {selectedEvent.sourceIcon}
                  <span>{selectedEvent.subject}</span>
                  <Badge variant="outline" className={`text-xs ${getTypeColor(selectedEvent.type)}`}>
                    {selectedEvent.type.replace('_', ' ')}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Event Header */}
                <div className="bg-[hsl(var(--hover-bg))] p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[hsl(var(--text-secondary))]">Sender:</span>
                        <span className="text-[hsl(var(--text-primary))]">{selectedEvent.sender}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[hsl(var(--text-secondary))]">Received:</span>
                        <span className="text-[hsl(var(--text-primary))]">{new Date(selectedEvent.receivedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[hsl(var(--text-secondary))]">Source:</span>
                        <span className="text-[hsl(var(--text-primary))]">{selectedEvent.source.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[hsl(var(--text-secondary))]">Event ID:</span>
                        <span className="font-mono text-xs text-[hsl(var(--text-primary))]">{selectedEvent.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Payload */}
                <div>
                  <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-3 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Payload
                  </h3>
                  <div className="bg-[hsl(var(--hover-bg))] p-4 border border-[hsl(var(--border-color))]">
                    <pre className="text-sm text-[hsl(var(--text-secondary))] whitespace-pre-wrap font-mono overflow-x-auto">
                      {JSON.stringify(selectedEvent.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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