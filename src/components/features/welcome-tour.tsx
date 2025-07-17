'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles,
  Mail,
  BarChart3,
  Key,
  Webhook,
  Database,
  Play,
  Settings,
  ArrowRight,
  ExternalLink,
  Globe,
  Zap,
  Shield,
  Activity,
  Bot,
  Users,
  Crown,
  CheckCircle,
  Star,
  Rocket
} from 'lucide-react'
import Link from 'next/link'

interface WelcomeTourProps {
  endpoint: any
  organization: any
}

export function WelcomeTour({ endpoint, organization }: WelcomeTourProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  
  const planName = organization?.plan || 'citizen'
  const endpointUrl = endpoint ? `https://api.enostics.com/v1/${endpoint.path}` : ''

  const features = [
    {
      id: 'inbox',
      title: 'Universal Inbox',
      description: 'All your data flows into one intelligent inbox',
      icon: <Mail className="h-6 w-6" />,
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      details: [
        'Real-time data reception from any source',
        'Smart categorization and filtering',
        'Search and organize your data',
        'View detailed event information'
      ],
      action: 'View Inbox',
      href: '/dashboard'
    },
    {
      id: 'analytics',
      title: 'Real-time Analytics',
      description: 'Monitor your endpoint performance and usage',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'bg-green-500/10 border-green-500/20 text-green-400',
      details: [
        'Request volume and patterns',
        'Response times and success rates',
        'Data source breakdown',
        'Usage against plan limits'
      ],
      action: 'View Analytics',
      href: '/dashboard/analytics'
    },
    {
      id: 'playground',
      title: 'API Playground',
      description: 'Test your endpoint with custom requests',
      icon: <Play className="h-6 w-6" />,
      color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      details: [
        'Send test requests instantly',
        'Try different payload formats',
        'See responses in real-time',
        'Generate code examples'
      ],
      action: 'Open Playground',
      href: '/dashboard/playground'
    },
    {
      id: 'security',
      title: 'API Keys & Security',
      description: 'Secure your endpoint with authentication',
      icon: <Key className="h-6 w-6" />,
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      details: [
        'Generate secure API keys',
        'Control access permissions',
        'Monitor key usage',
        'Rotate keys as needed'
      ],
      action: 'Manage Keys',
      href: '/dashboard/keys'
    }
  ]

  const advancedFeatures = [
    {
      title: 'Smart Webhooks',
      description: 'Forward data to external services automatically',
      icon: <Webhook className="h-4 w-4" />,
      plans: ['developer', 'business']
    },
    {
      title: 'AI Data Processing',
      description: 'Intelligent classification and insights',
      icon: <Bot className="h-4 w-4" />,
      plans: ['developer', 'business']
    },
    {
      title: 'Team Collaboration',
      description: 'Share endpoints with team members',
      icon: <Users className="h-4 w-4" />,
      plans: ['business']
    },
    {
      title: 'Custom Integrations',
      description: 'Build custom workflows and automations',
      icon: <Zap className="h-4 w-4" />,
      plans: ['business']
    }
  ]

  const currentFeatureData = features[currentFeature]

  const isPlanFeatureAvailable = (requiredPlans: string[]) => {
    return requiredPlans.includes(planName)
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'citizen': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      case 'developer': return 'bg-purple-500/10 border-purple-500/20 text-purple-400'
      case 'business': return 'bg-orange-500/10 border-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/10 border-gray-500/20 text-gray-400'
    }
  }

  const nextSteps = [
    {
      title: 'Explore Analytics',
      description: 'Monitor your endpoint performance and data flow in real-time.',
      href: '/dashboard/analytics'
    },
    {
      title: 'Manage Your Data',
      description: 'View, organize, and manage all your incoming data.',
      href: '/dashboard/data'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="p-4 bg-brand/10 border border-brand/20 rounded-full w-fit mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-brand" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Welcome to Your Dashboard!</h3>
        <p className="text-enostics-gray-400">
          Let's explore the key features that make Enostics powerful
        </p>
      </div>

      {/* Current Plan Badge */}
      <div className="flex justify-center mb-6">
        <Badge className={`${getPlanBadgeColor(planName)} px-4 py-2`}>
          <Crown className="h-4 w-4 mr-2" />
          {planName.charAt(0).toUpperCase() + planName.slice(1)} Plan
        </Badge>
      </div>

      {/* Feature Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {features.map((feature, index) => (
          <button
            key={feature.id}
            onClick={() => setCurrentFeature(index)}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              currentFeature === index
                ? feature.color
                : 'bg-enostics-gray-900/50 border-enostics-gray-700/50 text-enostics-gray-400 hover:border-enostics-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              {feature.icon}
              <span className="text-xs font-medium">{feature.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Current Feature Details */}
      <Card variant="glass" className="border-brand/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-lg ${currentFeatureData.color}`}>
              {currentFeatureData.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-white mb-2">
                {currentFeatureData.title}
              </h4>
              <p className="text-enostics-gray-400 mb-4">
                {currentFeatureData.description}
              </p>
              <div className="space-y-2">
                {currentFeatureData.details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-enostics-gray-300">
                    <CheckCircle className="h-4 w-4 text-enostics-green flex-shrink-0" />
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={() => window.open(currentFeatureData.href, '_blank')}
          >
            {currentFeatureData.action}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Start Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand" />
              Your Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-enostics-gray-900/50 rounded-lg p-3">
              <code className="text-sm text-brand break-all">{endpointUrl}</code>
            </div>
            <div className="text-sm text-enostics-gray-400">
              This is your personal API endpoint. Send data here from any source.
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Test in Playground
            </Button>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-enostics-green" />
                <span className="text-enostics-gray-300">Account created</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-enostics-green" />
                <span className="text-enostics-gray-300">Endpoint configured</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-brand bg-brand/20" />
                <span className="text-enostics-gray-300">Send first request</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Rocket className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features Preview */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-400" />
            Advanced Features
          </CardTitle>
          <p className="text-sm text-enostics-gray-400">
            Unlock more powerful capabilities with higher plans
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-enostics-gray-900/30 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  isPlanFeatureAvailable(feature.plans) 
                    ? 'bg-brand/10 text-brand' 
                    : 'bg-enostics-gray-800 text-enostics-gray-500'
                }`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h6 className={`font-medium mb-1 ${
                    isPlanFeatureAvailable(feature.plans) ? 'text-white' : 'text-enostics-gray-400'
                  }`}>
                    {feature.title}
                  </h6>
                  <p className="text-sm text-enostics-gray-400">{feature.description}</p>
                  <div className="flex gap-1 mt-2">
                    {feature.plans.map((plan) => (
                      <Badge 
                        key={plan} 
                        variant="outline" 
                        className={`text-xs ${getPlanBadgeColor(plan)}`}
                      >
                        {plan}
                      </Badge>
                    ))}
                  </div>
                </div>
                {isPlanFeatureAvailable(feature.plans) && (
                  <CheckCircle className="h-5 w-5 text-enostics-green flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-brand/10 to-purple-500/10 rounded-lg p-6 border border-brand/20">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">You're all set!</h3>
          <p className="text-enostics-gray-400">
            Your endpoint is live and ready to receive data. Here are some things you can do next:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextSteps.map((step, index) => (
            <Card key={index} className="bg-enostics-gray-800/50 border-enostics-gray-700 hover:bg-enostics-gray-800 transition-colors">
              <CardContent className="p-4">
                <h4 className="font-medium text-white mb-2">{step.title}</h4>
                <p className="text-sm text-enostics-gray-400 mb-3">{step.description}</p>
                <Link href={step.href}>
                  <Button size="sm" className="w-full bg-enostics-blue hover:bg-enostics-blue/80">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => window.open('/dashboard/chat', '_blank')}>
            Start Chatting
          </Button>
          <Button variant="outline" onClick={() => window.open('/dashboard/endpoints', '_blank')}>
            View Endpoints
          </Button>
        </div>
      </div>

      {/* Upgrade Hint for Free Users */}
      {planName === 'citizen' && (
        <div className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-white mb-1">
                Ready to unlock more features?
              </div>
              <div className="text-xs text-enostics-gray-400 mb-3">
                Upgrade to Developer or Business plans for webhooks, AI processing, team features, and higher limits.
              </div>
              <Button size="sm" variant="outline">
                <Crown className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 