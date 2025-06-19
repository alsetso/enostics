'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Check, 
  Star, 
  User, 
  Building, 
  Sparkles,
  Zap,
  Globe,
  Shield,
  Database,
  Activity,
  Infinity
} from 'lucide-react'

interface PlanConfirmationProps {
  organization: any
  profile: any
}

const planDetails = {
  citizen: {
    name: 'Citizen',
    price: 0,
    period: 'forever',
    icon: <User className="h-6 w-6" />,
    color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    features: [
      { text: '1 personal endpoint', icon: <Globe className="h-4 w-4" /> },
      { text: '1,000 requests/month', icon: <Activity className="h-4 w-4" /> },
      { text: 'Basic data classification', icon: <Database className="h-4 w-4" /> },
      { text: 'Standard support', icon: <Shield className="h-4 w-4" /> }
    ]
  },
  developer: {
    name: 'Developer',
    price: 29,
    period: 'month',
    icon: <Sparkles className="h-6 w-6" />,
    color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    features: [
      { text: '5 endpoints', icon: <Globe className="h-4 w-4" /> },
      { text: '50,000 requests/month', icon: <Activity className="h-4 w-4" /> },
      { text: 'Advanced data classification', icon: <Database className="h-4 w-4" /> },
      { text: 'AI-powered insights', icon: <Sparkles className="h-4 w-4" /> },
      { text: 'Priority support', icon: <Shield className="h-4 w-4" /> },
      { text: 'API key management', icon: <Shield className="h-4 w-4" /> },
      { text: 'Webhook forwarding', icon: <Zap className="h-4 w-4" /> }
    ]
  },
  business: {
    name: 'Business',
    price: 99,
    period: 'month',
    icon: <Building className="h-6 w-6" />,
    color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    features: [
      { text: 'Unlimited endpoints', icon: <Infinity className="h-4 w-4" /> },
      { text: '500,000 requests/month', icon: <Activity className="h-4 w-4" /> },
      { text: 'Enterprise classification', icon: <Database className="h-4 w-4" /> },
      { text: 'Advanced AI models', icon: <Sparkles className="h-4 w-4" /> },
      { text: 'Dedicated support', icon: <Shield className="h-4 w-4" /> },
      { text: 'Team management', icon: <Building className="h-4 w-4" /> },
      { text: 'Custom integrations', icon: <Zap className="h-4 w-4" /> },
      { text: 'SLA guarantee', icon: <Shield className="h-4 w-4" /> }
    ]
  }
}

export function PlanConfirmation({ organization, profile }: PlanConfirmationProps) {
  const selectedPlan = organization?.plan || 'citizen'
  const plan = planDetails[selectedPlan as keyof typeof planDetails] || planDetails.citizen
  
  const formatPrice = (price: number, period: string) => {
    if (price === 0) return 'Free'
    return `$${price}/${period}`
  }

  const getUsageInfo = () => {
    const limits = organization?.usage_limits || {}
    return {
      endpoints: limits.endpoints === -1 ? 'Unlimited' : limits.endpoints || 1,
      requests: limits.requests_per_month?.toLocaleString() || '1,000',
      apiKeys: limits.api_keys === -1 ? 'Unlimited' : limits.api_keys || 1,
      webhooks: limits.webhooks === -1 ? 'Unlimited' : limits.webhooks || 0
    }
  }

  const usage = getUsageInfo()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className={`p-4 rounded-full w-fit mx-auto mb-4 ${plan.color}`}>
          {plan.icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Welcome to Enostics!</h3>
        <p className="text-enostics-gray-400">
          You've selected the <span className="text-white font-medium">{plan.name}</span> plan
        </p>
      </div>

      {/* Plan Overview Card */}
      <Card variant="glass" className="border-brand/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${plan.color}`}>
                {plan.icon}
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white">{plan.name}</h4>
                <p className="text-enostics-gray-400">Perfect for your needs</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {formatPrice(plan.price, plan.period)}
              </div>
              {selectedPlan === 'developer' && (
                <Badge variant="secondary" className="mt-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
            </div>
          </div>

          {/* Current Usage Limits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-enostics-gray-900/50 rounded-lg p-4 text-center">
              <div className="text-lg font-semibold text-white">{usage.endpoints}</div>
              <div className="text-xs text-enostics-gray-400">Endpoints</div>
            </div>
            <div className="bg-enostics-gray-900/50 rounded-lg p-4 text-center">
              <div className="text-lg font-semibold text-white">{usage.requests}</div>
              <div className="text-xs text-enostics-gray-400">Requests/month</div>
            </div>
            <div className="bg-enostics-gray-900/50 rounded-lg p-4 text-center">
              <div className="text-lg font-semibold text-white">{usage.apiKeys}</div>
              <div className="text-xs text-enostics-gray-400">API Keys</div>
            </div>
            <div className="bg-enostics-gray-900/50 rounded-lg p-4 text-center">
              <div className="text-lg font-semibold text-white">{usage.webhooks}</div>
              <div className="text-xs text-enostics-gray-400">Webhooks</div>
            </div>
          </div>

          {/* Features List */}
          <div>
            <h5 className="font-medium text-white mb-3">What's included:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-1 bg-enostics-green/10 rounded text-enostics-green">
                    <Check className="h-3 w-3" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-enostics-gray-300">
                    <span className="text-enostics-gray-400">{feature.icon}</span>
                    {feature.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Preview */}
      <div className="bg-enostics-gray-900/30 rounded-lg p-6 border border-enostics-gray-700/50">
        <h5 className="font-medium text-white mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-brand" />
          What happens next?
        </h5>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-brand/20 text-brand text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="text-sm font-medium text-white">Complete your profile</div>
              <div className="text-xs text-enostics-gray-400">Tell us a bit about yourself</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-brand/20 text-brand text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="text-sm font-medium text-white">Set up your endpoint</div>
              <div className="text-xs text-enostics-gray-400">Your personal API is ready to use</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-brand/20 text-brand text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="text-sm font-medium text-white">Quick tour</div>
              <div className="text-xs text-enostics-gray-400">Learn the key features</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Notice for Free Users */}
      {selectedPlan === 'citizen' && (
        <div className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-white mb-1">
                Ready for more?
              </div>
              <div className="text-xs text-enostics-gray-400">
                You can upgrade to Developer or Business plans anytime from your dashboard to unlock more endpoints, higher limits, and advanced features.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 