'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  X, 
  Zap, 
  Users, 
  BarChart3, 
  Webhook, 
  Key, 
  Database,
  Mail,
  Shield
} from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const businessFeatures = [
    {
      icon: Mail,
      title: 'Inter-User Messaging',
      description: 'Send data to other Enostics endpoints'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time monitoring and performance metrics'
    },
    {
      icon: Webhook,
      title: 'Webhooks',
      description: 'Forward requests to external URLs'
    },
    {
      icon: Key,
      title: 'API Key Management',
      description: 'Generate and manage authentication keys'
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Advanced data viewing and management tools'
    },
    {
      icon: Users,
      title: 'Multiple Endpoints',
      description: 'Create and manage multiple endpoints'
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: '24/7 technical support and assistance'
    },
    {
      icon: Zap,
      title: 'Higher Rate Limits',
      description: '10x higher API rate limits'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[60vh] bg-enostics-gray-950 border-enostics-gray-800 overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              Upgrade to Business Plan
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-enostics-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {feature && (
            <div className="bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg p-4">
              <p className="text-enostics-gray-300 text-center">
                <span className="font-semibold text-white">{feature}</span> is a Business Plan feature.
                Upgrade now to unlock this and all other premium features.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            {/* Current Plan */}
            <div className="bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white">Free Plan</h3>
                <Badge variant="outline" className="mt-2 bg-enostics-gray-800 text-enostics-gray-300">
                  Current Plan
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-enostics-gray-400">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>1 Personal Endpoint</span>
                </div>
                <div className="flex items-center gap-2 text-enostics-gray-400">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Basic Inbox</span>
                </div>
                <div className="flex items-center gap-2 text-enostics-gray-400">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>API Playground</span>
                </div>
                <div className="flex items-center gap-2 text-enostics-gray-400">
                  <X className="h-4 w-4 text-red-500" />
                  <span>Inter-User Messaging</span>
                </div>
                <div className="flex items-center gap-2 text-enostics-gray-400">
                  <X className="h-4 w-4 text-red-500" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-enostics-gray-400">
                  <X className="h-4 w-4 text-red-500" />
                  <span>Multiple Endpoints</span>
                </div>
              </div>
                          </div>

              {/* Developer Plan */}
              <div className="bg-enostics-gray-900 border border-blue-500/50 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Developer Plan</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-white">$29</span>
                    <span className="text-enostics-gray-300">/month</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Everything in Free</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Inter-User Messaging</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>API Keys</span>
                  </div>
                  <div className="flex items-center gap-2 text-enostics-gray-400">
                    <X className="h-4 w-4 text-red-500" />
                    <span>Multiple Endpoints</span>
                  </div>
                  <div className="flex items-center gap-2 text-enostics-gray-400">
                    <X className="h-4 w-4 text-red-500" />
                    <span>Advanced Features</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  onClick={() => {
                    // TODO: Integrate with billing system
                    console.log('Upgrade to Developer Plan')
                  }}
                >
                  Upgrade to Developer
                </Button>
              </div>

              {/* Business Plan */}
            <div className="bg-gradient-to-br from-enostics-blue/20 to-purple-600/20 border border-enostics-blue/50 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-enostics-blue to-purple-600 text-white border-0">
                  Recommended
                </Badge>
              </div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white">Business Plan</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">$99</span>
                  <span className="text-enostics-gray-300">/month</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Everything in Free</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Unlimited Endpoints</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Inter-User Messaging</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Webhooks & API Keys</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Priority Support</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-enostics-blue to-purple-600 hover:from-enostics-blue/90 hover:to-purple-600/90 text-white border-0"
                onClick={() => {
                  // TODO: Integrate with billing system
                  console.log('Upgrade to Business Plan')
                }}
              >
                Upgrade Now
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              What you'll get with Business Plan:
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {businessFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg"
                >
                  <feature.icon className="h-5 w-5 text-enostics-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-white">{feature.title}</h5>
                    <p className="text-sm text-enostics-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg p-6 text-center">
            <h4 className="text-lg font-semibold text-white mb-2">
              Ready to unlock the full potential of your endpoint?
            </h4>
            <p className="text-enostics-gray-400 mb-4">
              Join thousands of users building the future of personal APIs
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-enostics-gray-600 text-enostics-gray-300 hover:bg-enostics-gray-800"
              >
                Maybe Later
              </Button>
              <Button 
                className="bg-gradient-to-r from-enostics-blue to-purple-600 hover:from-enostics-blue/90 hover:to-purple-600/90 text-white border-0"
                onClick={() => {
                  // TODO: Integrate with billing system
                  console.log('Upgrade to Business Plan')
                }}
              >
                Upgrade to Business - $99/month
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 