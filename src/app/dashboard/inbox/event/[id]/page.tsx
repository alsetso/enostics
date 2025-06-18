'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Star,
  Archive,
  Share,
  MoreVertical,
  Copy,
  Check,
  Globe,
  User,
  Calendar,
  Database,
  FileText,
  ExternalLink,
  Brain,
  Shield,
  Activity,
  Smartphone,
  Bot,
  Monitor,
  MapPin,
  Clock,
  Zap,
  AlertCircle
} from 'lucide-react'

interface InboxEvent {
  id: string
  sender: string
  source: string
  type: string
  subject: string
  preview: string
  timestamp: string
  receivedAt: string
  isRead: boolean
  isStarred: boolean
  data: any
  sourceIcon: React.ReactNode
  sourceIp?: string
  userAgent?: string
}

// Seeded data for development
const seededEvents: Record<string, InboxEvent> = {
  '1': {
    id: '1',
    sender: 'Apple Health',
    source: 'iot_device',
    type: 'health_data',
    subject: 'Daily Step Count Update',
    preview: 'Steps: 8,432 | Distance: 4.2 miles | Calories: 412',
    timestamp: '2 hours ago',
    receivedAt: '2024-01-15T14:30:22Z',
    isRead: true,
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
  '2': {
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
  }
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<InboxEvent | null>(null)
  const [copied, setCopied] = useState(false)
  const [isStarred, setIsStarred] = useState(false)

  useEffect(() => {
    const eventId = params.id as string
    // In a real app, fetch from API
    const foundEvent = seededEvents[eventId]
    if (foundEvent) {
      setEvent(foundEvent)
      setIsStarred(foundEvent.isStarred)
    }
  }, [params.id])

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      health_data: 'text-red-400 border-red-400/20',
      financial_data: 'text-green-400 border-green-400/20',
      sensor_data: 'text-blue-400 border-blue-400/20',
      message: 'text-purple-400 border-purple-400/20',
      event: 'text-yellow-400 border-yellow-400/20',
      unknown: 'text-enostics-gray-400 border-enostics-gray-400/20'
    }
    return colors[type] || colors.unknown
  }

  const copyEventId = async () => {
    if (event) {
      await navigator.clipboard.writeText(event.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleStar = () => {
    setIsStarred(!isStarred)
    // In real app, update via API
  }

  if (!event) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Event not found</div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-enostics-gray-800">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-enostics-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
          
          <div className="h-4 w-px bg-enostics-gray-700"></div>
          
          <div className="flex items-center gap-2">
            {event.sourceIcon}
            <span className="text-sm text-enostics-gray-400">{event.sender}</span>
            <Badge variant="outline" className={`text-xs ${getTypeColor(event.type)}`}>
              {event.type.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleStar}
            className={`h-8 w-8 p-0 ${isStarred ? 'text-yellow-400' : 'text-enostics-gray-400 hover:text-yellow-400'}`}
          >
            <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-enostics-gray-400 hover:text-white"
          >
            <Archive className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-enostics-gray-400 hover:text-white"
          >
            <Share className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-enostics-gray-400 hover:text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Event Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white mb-2">{event.subject}</h1>
                <p className="text-enostics-gray-400 text-sm">{event.preview}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEventId}
                  className="text-xs"
                >
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? 'Copied!' : 'Copy ID'}
                </Button>
              </div>
            </div>

            {/* Metadata Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-enostics-gray-900 border-enostics-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-enostics-gray-400" />
                    <span className="text-sm font-medium text-white">Received</span>
                  </div>
                  <p className="text-sm text-enostics-gray-400">{event.timestamp}</p>
                  <p className="text-xs text-enostics-gray-500 mt-1">{event.receivedAt}</p>
                </CardContent>
              </Card>

              <Card className="bg-enostics-gray-900 border-enostics-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-enostics-gray-400" />
                    <span className="text-sm font-medium text-white">Source</span>
                  </div>
                  <p className="text-sm text-enostics-gray-400">{event.source}</p>
                  {event.sourceIp && (
                    <p className="text-xs text-enostics-gray-500 mt-1">{event.sourceIp}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-enostics-gray-900 border-enostics-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-enostics-gray-400" />
                    <span className="text-sm font-medium text-white">Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-enostics-gray-400">Processed</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Payload */}
            <Card className="bg-enostics-gray-900 border-enostics-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Database className="h-5 w-5" />
                  Data Payload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-enostics-gray-950 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-sm text-enostics-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Intelligence Analysis */}
            <Card className="bg-enostics-gray-900 border-enostics-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="h-5 w-5" />
                  Intelligence Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-white font-medium">Data Classification</p>
                      <p className="text-xs text-enostics-gray-400">
                        {event.type === 'health_data' ? 'Personal Health Information (PHI) detected' : 'Financial transaction data identified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-white font-medium">Security Status</p>
                      <p className="text-xs text-enostics-gray-400">
                        Data encrypted in transit and at rest
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-white font-medium">Recommendations</p>
                      <p className="text-xs text-enostics-gray-400">
                        {event.type === 'health_data' 
                          ? 'Consider setting up automated health trend alerts'
                          : 'Transaction appears normal, no action required'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-enostics-gray-800">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Details */}
          <Card className="bg-enostics-gray-900 border-enostics-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Monitor className="h-5 w-5" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-enostics-gray-400 uppercase tracking-wide">Event ID</label>
                    <p className="text-sm text-white font-mono">{event.id}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-enostics-gray-400 uppercase tracking-wide">Source IP</label>
                    <p className="text-sm text-white font-mono">{event.sourceIp || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-enostics-gray-400 uppercase tracking-wide">Content Type</label>
                    <p className="text-sm text-white">application/json</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-enostics-gray-400 uppercase tracking-wide">User Agent</label>
                    <p className="text-sm text-white font-mono text-xs break-all">{event.userAgent || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-enostics-gray-400 uppercase tracking-wide">Processing Time</label>
                    <p className="text-sm text-white">23ms</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-enostics-gray-400 uppercase tracking-wide">Storage Size</label>
                    <p className="text-sm text-white">1.2 KB</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 