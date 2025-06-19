'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Globe,
  Copy,
  Check,
  ExternalLink,
  Code,
  Send,
  Zap,
  Shield,
  Activity,
  QrCode,
  Smartphone,
  Monitor,
  Bot,
  AlertCircle,
  CheckCircle,
  PlayCircle
} from 'lucide-react'

interface EndpointSetupProps {
  endpoint: any
  organization: any
  onCopy: () => void
  copied: boolean
}

export function EndpointSetup({ endpoint, organization, onCopy, copied }: EndpointSetupProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'testing'>('overview')
  
  const endpointUrl = endpoint ? `https://api.enostics.com/v1/${endpoint.path}` : ''
  const planName = organization?.plan || 'citizen'
  
  const getStatusColor = () => {
    if (!endpoint) return 'bg-enostics-red/10 border-enostics-red/20 text-enostics-red'
    return endpoint.is_active 
      ? 'bg-enostics-green/10 border-enostics-green/20 text-enostics-green'
      : 'bg-enostics-yellow/10 border-enostics-yellow/20 text-enostics-yellow'
  }

  const getStatusText = () => {
    if (!endpoint) return 'Not Created'
    return endpoint.is_active ? 'Active & Ready' : 'Inactive'
  }

  const exampleRequests = [
    {
      title: 'Health Data',
      description: 'Send fitness tracker data',
      method: 'POST',
      icon: <Activity className="h-4 w-4" />,
      payload: {
        type: 'health_data',
        steps: 8432,
        distance: 4.2,
        calories: 412,
        heart_rate: 78,
        timestamp: new Date().toISOString()
      }
    },
    {
      title: 'IoT Sensor',
      description: 'Smart home device data',
      method: 'POST',
      icon: <Smartphone className="h-4 w-4" />,
      payload: {
        type: 'sensor_data',
        device: 'temperature_sensor',
        temperature: 72.5,
        humidity: 45,
        location: 'living_room',
        timestamp: new Date().toISOString()
      }
    },
    {
      title: 'AI Agent',
      description: 'Assistant or bot messages',
      method: 'POST',
      icon: <Bot className="h-4 w-4" />,
      payload: {
        type: 'message',
        from: 'ai_assistant',
        content: 'Your daily summary is ready!',
        priority: 'normal',
        timestamp: new Date().toISOString()
      }
    }
  ]

  const integrationExamples = [
    {
      name: 'cURL',
      icon: <Monitor className="h-4 w-4" />,
      code: `curl -X POST "${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "test_message",
    "content": "Hello from cURL!",
    "timestamp": "${new Date().toISOString()}"
  }'`
    },
    {
      name: 'JavaScript',
      icon: <Code className="h-4 w-4" />,
      code: `fetch('${endpointUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'test_message',
    content: 'Hello from JavaScript!',
    timestamp: new Date().toISOString()
  })
})`
    },
    {
      name: 'Python',
      icon: <Code className="h-4 w-4" />,
      code: `import requests
import json
from datetime import datetime

data = {
    "type": "test_message",
    "content": "Hello from Python!",
    "timestamp": datetime.now().isoformat()
}

response = requests.post('${endpointUrl}', json=data)
print(response.status_code)`
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="p-4 bg-brand/10 border border-brand/20 rounded-full w-fit mx-auto mb-4">
          <Globe className="h-8 w-8 text-brand" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Your Personal API Endpoint</h3>
        <p className="text-enostics-gray-400">
          Your universal data receiver is ready to accept requests from anywhere
        </p>
      </div>

      {/* Endpoint Status Card */}
      <Card variant="glass" className="border-brand/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Globe className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Endpoint Status</h4>
                <p className="text-sm text-enostics-gray-400">
                  {endpoint?.name || 'My Personal Endpoint'}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor()}>
              {endpoint?.is_active ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {getStatusText()}
            </Badge>
          </div>

          {/* Endpoint URL */}
          <div className="bg-enostics-gray-900/50 rounded-lg p-4 border border-enostics-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Your Endpoint URL</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                className="h-8 px-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-enostics-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <code className="text-sm text-brand break-all">
              {endpointUrl}
            </code>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {endpoint?.total_requests || 0}
              </div>
              <div className="text-xs text-enostics-gray-400">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {endpoint?.is_active ? 'Online' : 'Offline'}
              </div>
              <div className="text-xs text-enostics-gray-400">Status</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white capitalize">
                {planName}
              </div>
              <div className="text-xs text-enostics-gray-400">Plan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-enostics-gray-900/50 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: <Globe className="h-4 w-4" /> },
          { id: 'examples', label: 'Code Examples', icon: <Code className="h-4 w-4" /> },
          { id: 'testing', label: 'Test It', icon: <PlayCircle className="h-4 w-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-brand text-white'
                : 'text-enostics-gray-400 hover:text-white hover:bg-enostics-gray-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <Send className="h-5 w-5 text-blue-400" />,
                  title: 'Send Data',
                  description: 'POST JSON data from any source - apps, devices, scripts'
                },
                {
                  icon: <Shield className="h-5 w-5 text-green-400" />,
                  title: 'Secure & Private',
                  description: 'Your data is encrypted and only accessible to you'
                },
                {
                  icon: <Zap className="h-5 w-5 text-purple-400" />,
                  title: 'Real-time',
                  description: 'See data appear instantly in your dashboard'
                }
              ].map((feature, index) => (
                <Card key={index} variant="glass">
                  <CardContent className="p-4 text-center">
                    <div className="p-2 bg-enostics-gray-900/50 rounded-lg w-fit mx-auto mb-3">
                      {feature.icon}
                    </div>
                    <h5 className="font-medium text-white mb-2">{feature.title}</h5>
                    <p className="text-sm text-enostics-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg">Common Use Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {exampleRequests.map((example, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-enostics-gray-900/30 rounded-lg">
                    <div className="p-2 bg-enostics-gray-800 rounded-lg">
                      {example.icon}
                    </div>
                    <div>
                      <h6 className="font-medium text-white">{example.title}</h6>
                      <p className="text-sm text-enostics-gray-400">{example.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {example.method}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-4">
            {integrationExamples.map((example, index) => (
              <Card key={index} variant="glass">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {example.icon}
                    {example.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-enostics-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-enostics-gray-300 overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'testing' && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Test Your Endpoint</CardTitle>
              <p className="text-sm text-enostics-gray-400">
                Send a test request to see how it works
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-enostics-gray-900/50 rounded-lg p-4 border border-enostics-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">POST</Badge>
                  <code className="text-sm text-brand">{endpointUrl}</code>
                </div>
                <div className="text-sm text-enostics-gray-400">
                  Click "Send Test Request" to try it out, then check your dashboard to see the data appear.
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => {
                  // This would trigger a test request
                  window.open('/dashboard/playground', '_blank')
                }}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Open Playground to Test
              </Button>

              <div className="text-center">
                <p className="text-sm text-enostics-gray-400">
                  Or copy the URL above and test with your favorite HTTP client
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-brand/10 to-purple-500/10 rounded-lg p-4 border border-brand/20">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-white mb-1">
              Ready to integrate?
            </div>
            <div className="text-xs text-enostics-gray-400">
              Your endpoint is live and ready to receive data. Try sending a test request, then check your dashboard to see it appear in real-time.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 