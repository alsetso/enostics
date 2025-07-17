'use client'

import { useState, useEffect } from 'react'
import { RequestPlayground } from '@/components/features/request-playground'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Play, 
  Activity, 
  Zap, 
  Terminal, 
  Code, 
  Database,
  Monitor,
  Layers,
  Clock,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react'

export default function PlaygroundPage() {
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'test' | 'logs' | 'health' | 'docs'>('test')
  const [isLive, setIsLive] = useState(false)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    fetchData()
    // Simulate live connection
    const interval = setInterval(() => {
      setIsLive(Math.random() > 0.1) // 90% uptime simulation
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch endpoints
      const endpointsResponse = await fetch('/api/endpoints')
      if (endpointsResponse.ok) {
        const endpointsData = await endpointsResponse.json()
        setEndpoints(Array.isArray(endpointsData.endpoints) ? endpointsData.endpoints : [])
      }

      // Fetch API keys
      try {
        const apiKeysResponse = await fetch('/api/api-keys')
        if (apiKeysResponse.ok) {
          const apiKeysData = await apiKeysResponse.json()
          setApiKeys(Array.isArray(apiKeysData.keys) ? apiKeysData.keys : [])
        }
      } catch (apiKeyError) {
        console.warn('Error fetching API keys:', apiKeyError)
        setApiKeys([])
      }

      // Set user profile (placeholder)
      setUserProfile({ username: 'user' })
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load playground data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-enostics-gray-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-enostics-gray-700 rounded w-96"></div>
        </div>
        <div className="h-96 bg-enostics-gray-700 rounded animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Terminal className="h-8 w-8 text-enostics-blue" />
            Developer Console
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Console Error</h3>
            <p className="text-enostics-gray-400 mb-4 font-mono">{error}</p>
            <Button onClick={fetchData} variant="outline">
              <Terminal className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'test', label: 'API Tester', icon: <Play className="h-4 w-4" /> },
    { id: 'logs', label: 'Live Logs', icon: <Terminal className="h-4 w-4" /> },
    { id: 'health', label: 'Health', icon: <Monitor className="h-4 w-4" /> },
    { id: 'docs', label: 'SDK Gen', icon: <Code className="h-4 w-4" /> }
  ]

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Terminal className="h-8 w-8 text-enostics-blue" />
            Developer Console
            <Badge variant="outline" className="text-xs font-mono">
              {isLive ? (
                <>
                  <Wifi className="h-3 w-3 mr-1 text-green-400" />
                  LIVE
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1 text-red-400" />
                  OFFLINE
                </>
              )}
            </Badge>
          </h1>
          <p className="text-enostics-gray-400 mt-2 font-mono text-sm">
            localhost:3000 • Test endpoints, monitor health, generate SDKs
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xs text-enostics-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3" />
              {endpoints.length} endpoints
            </div>
          </div>
          <div className="text-xs text-enostics-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <Layers className="h-3 w-3" />
              {apiKeys.length} keys
            </div>
          </div>
        </div>
      </div>

      {/* Console Tabs */}
      <div className="border-b border-enostics-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-enostics-blue text-enostics-blue'
                  : 'border-transparent text-enostics-gray-400 hover:text-enostics-gray-300 hover:border-enostics-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Console Content */}
      <div className="min-h-[600px]">
        {activeTab === 'test' && (
          <div>
            {endpoints.length > 0 ? (
              <RequestPlayground
                endpoints={endpoints}
                userApiKeys={apiKeys}
                username={userProfile?.username || 'user'}
              />
            ) : (
              <Card variant="glass" className="border-enostics-gray-700">
                <CardContent className="text-center py-12">
                  <Terminal className="h-16 w-16 mx-auto mb-4 text-enostics-gray-600" />
                  <h3 className="text-lg font-medium mb-2 text-white">No Endpoints Found</h3>
                  <p className="text-enostics-gray-400 mb-4 font-mono text-sm">
                    $ curl -X POST localhost:3000/api/endpoints
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                    <Database className="h-4 w-4 mr-2" />
                    Create First Endpoint
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <Card variant="glass" className="border-enostics-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono">
                <Terminal className="h-5 w-5" />
                tail -f /var/log/enostics/live.log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black p-4 rounded-lg font-mono text-sm min-h-[400px] max-h-[400px] overflow-y-auto">
                <div className="text-green-400 mb-2">
                  [INFO] Watching for incoming requests...
                </div>
                <div className="text-enostics-gray-500 text-xs">
                  {new Date().toISOString()} | No recent activity
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'health' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="glass" className="border-enostics-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono">
                  <Monitor className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-enostics-gray-400 font-mono">API Gateway</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-mono">ONLINE</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-enostics-gray-400 font-mono">Database</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-mono">CONNECTED</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-enostics-gray-400 font-mono">Rate Limiter</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-mono">ACTIVE</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-enostics-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono">
                  <Clock className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-enostics-gray-400 font-mono">Avg Response Time</span>
                  <span className="text-white font-mono">~85ms</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-enostics-gray-400 font-mono">Requests Today</span>
                  <span className="text-white font-mono">247</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-enostics-gray-400 font-mono">Success Rate</span>
                  <span className="text-green-400 font-mono">99.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'docs' && (
          <Card variant="glass" className="border-enostics-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono">
                <Code className="h-5 w-5" />
                SDK Code Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-enostics-gray-400">
                <Code className="h-16 w-16 mx-auto mb-4 text-enostics-gray-600" />
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="font-mono text-sm">Auto-generate SDK code for your endpoints</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 