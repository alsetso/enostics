'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EndpointManager } from '@/components/features/endpoint-manager'
import { EndpointTester } from '@/components/features/endpoint-tester'
import { EnhancedDataDisplay } from '@/components/features/enhanced-data-display'
import { 
  Activity, 
  Globe, 
  Zap, 
  TrendingUp, 
  Crown, 
  Lock, 
  Rocket,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

export default function BusinessPage() {
  const [user, setUser] = useState<any>(null)
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        throw authError
      }
      
      setUser(user)
      
      if (user?.id) {
        // Fetch endpoints for all users
        try {
          const endpointsResponse = await fetch('/api/endpoints')
          if (endpointsResponse.ok) {
            const endpointsData = await endpointsResponse.json()
            setEndpoints(Array.isArray(endpointsData.endpoints) ? endpointsData.endpoints : [])
          }
        } catch (endpointError) {
          console.warn('Error fetching endpoints:', endpointError)
        }
      }
      
    } catch (error) {
      console.error('Error in fetchUserData:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Business plan features
  const businessFeatures = [
    {
      icon: Globe,
      title: 'Multiple Endpoints',
      description: 'Create unlimited custom endpoints for different data types and sources',
      included: true
    },
    {
      icon: Activity,
      title: 'Advanced Analytics',
      description: 'Real-time monitoring, performance metrics, and detailed insights',
      included: true
    },
    {
      icon: Zap,
      title: 'Webhook Forwarding',
      description: 'Automatically forward incoming data to external services',
      included: true
    },
    {
      icon: Lock,
      title: 'API Key Management',
      description: 'Secure authentication with granular access controls',
      included: true
    },
    {
      icon: TrendingUp,
      title: 'Data Export & Backup',
      description: 'Export your data in multiple formats with automated backups',
      included: true
    },
    {
      icon: Sparkles,
      title: 'Priority Support',
      description: '24/7 technical support with dedicated account management',
      included: true
    }
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-enostics-gray-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-enostics-gray-700 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-enostics-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <Activity className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Business Dashboard</h3>
            <p className="text-enostics-gray-400 mb-4">{error}</p>
            <Button onClick={fetchUserData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Always show the business dashboard now
  if (false) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <Crown className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Business Features</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Unlock Advanced Endpoint Management
          </h1>
          <p className="text-xl text-enostics-gray-400 max-w-2xl mx-auto">
            Scale beyond your personal inbox with multiple endpoints, advanced analytics, and enterprise-grade features.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold">
              RECOMMENDED
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Rocket className="h-6 w-6 text-purple-400" />
                Business Plan
              </CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-white">
                  $29<span className="text-lg text-enostics-gray-400">/month</span>
                </div>
                <p className="text-enostics-gray-400">Everything you need to scale</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {businessFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">{feature.title}</div>
                      <div className="text-sm text-enostics-gray-400">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Link href="/dashboard/settings/billing">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
                    Upgrade to Business
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-xs text-center text-enostics-gray-500">
                  Cancel anytime • 14-day free trial • No setup fees
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {businessFeatures.map((feature, index) => (
            <Card key={index} className="border-enostics-gray-800 bg-enostics-gray-900/50 hover:bg-enostics-gray-900 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <feature.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-enostics-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 border-t border-enostics-gray-800">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to scale your data infrastructure?</h2>
          <p className="text-enostics-gray-400 mb-6 max-w-xl mx-auto">
            Join thousands of developers and organizations using Enostics Business to manage their data endpoints at scale.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard/settings/billing">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/dashboard/endpoints">
              <Button variant="outline" className="border-enostics-gray-700 text-enostics-light hover:bg-enostics-gray-800">
                View Endpoints
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Business user dashboard
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Crown className="h-8 w-8 text-purple-400" />
            Business Dashboard
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent">
              <Sparkles className="h-3 w-3 mr-1" />
              Business
            </Badge>
          </h1>
          <p className="text-enostics-gray-400 mt-2">
            Advanced endpoint management and analytics for your business infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-enostics-gray-800 bg-enostics-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-enostics-blue/10 rounded-xl border border-enostics-blue/20">
                <Globe className="h-6 w-6 text-enostics-blue" />
              </div>
              <Badge variant="outline" className="text-xs border-enostics-gray-600">
                Active
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">{endpoints.length}</p>
              <p className="text-sm text-enostics-gray-400">Active Endpoints</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-enostics-gray-800 bg-enostics-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-enostics-green/10 rounded-xl border border-enostics-green/20">
                <Zap className="h-6 w-6 text-enostics-green" />
              </div>
              <Badge variant="outline" className="text-xs border-enostics-gray-600">
                24h
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-enostics-gray-400">Requests Today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-enostics-gray-800 bg-enostics-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-enostics-purple/10 rounded-xl border border-enostics-purple/20">
                <TrendingUp className="h-6 w-6 text-enostics-purple" />
              </div>
              <Badge variant="outline" className="text-xs border-enostics-gray-600">
                Live
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-enostics-gray-400">Uptime</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        {/* Endpoint Management */}
        <EndpointManager />

        {/* Endpoint Testing */}
        <EndpointTester />

        {/* Enhanced Data Analytics & Management */}
        <EnhancedDataDisplay />
      </div>
    </div>
  )
} 