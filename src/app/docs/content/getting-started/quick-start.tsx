'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Rocket, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Play,
  Globe,
  Zap,
  ArrowRight,
  Clock,
  User,
  Database,
  Lightbulb
} from 'lucide-react'

export const metadata = { 
  sidebarLabel: 'Quick Start', 
  icon: Rocket 
}

export function QuickStartContent() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepNumber) 
        ? prev.filter(s => s !== stepNumber)
        : [...prev, stepNumber]
    )
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const steps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Sign up for Enostics and get instant access to your personal API platform",
      time: "30 seconds",
      action: "Sign Up",
      link: "/register"
    },
    {
      number: 2,
      title: "Create Your First Endpoint",
      description: "Set up your personal endpoint where data will land, load, and launch",
      time: "2 minutes",
      action: "Go to Dashboard",
      link: "/dashboard"
    },
    {
      number: 3,
      title: "Send Your First Data",
      description: "Test your endpoint with a simple JSON payload",
      time: "1 minute",
      action: "Test Now",
      link: "#test-endpoint"
    },
    {
      number: 4,
      title: "View Your Data",
      description: "See your data arrive in real-time on your dashboard",
      time: "30 seconds",
      action: "View Data",
      link: "/dashboard"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Rocket className="h-8 w-8 text-brand" />
          <h1 className="text-3xl font-bold text-brand">Get Started in 5 Minutes</h1>
        </div>
        <p className="text-lg text-enostics-gray-300 max-w-2xl mx-auto">
          Transform from zero to your first working endpoint in under 5 minutes. 
          No complex setup, no lengthy configuration—just pure simplicity.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-brand/10 to-enostics-green/10 border-brand/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Your Progress</h3>
            <Badge variant="outline" className="bg-brand/20 text-brand border-brand/50">
              {completedSteps.length}/4 Complete
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {steps.map((step) => (
              <div 
                key={step.number}
                className={`h-2 rounded-full transition-all duration-300 ${
                  completedSteps.includes(step.number) 
                    ? 'bg-enostics-green' 
                    : 'bg-enostics-gray-700'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step) => (
          <Card 
            key={step.number}
            className={`transition-all duration-300 ${
              completedSteps.includes(step.number)
                ? 'bg-enostics-green/10 border-enostics-green/30'
                : 'bg-enostics-gray-900/50 border-white/10 hover:border-brand/30'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    completedSteps.includes(step.number)
                      ? 'bg-enostics-green text-black'
                      : 'bg-brand text-white'
                  }`}>
                    {completedSteps.includes(step.number) ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-white">{step.title}</CardTitle>
                    <p className="text-enostics-gray-400 text-sm mt-1">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-enostics-gray-400">
                    <Clock className="h-3 w-3" />
                    {step.time}
                  </div>
                  <Button
                    onClick={() => toggleStep(step.number)}
                    variant="outline"
                    size="sm"
                    className={`${
                      completedSteps.includes(step.number)
                        ? 'bg-enostics-green/20 text-enostics-green border-enostics-green/50'
                        : 'bg-brand/20 text-brand border-brand/50'
                    }`}
                  >
                    {completedSteps.includes(step.number) ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-enostics-gray-300">
                  Click the button to get started with this step
                </div>
                <a href={step.link}>
                  <Button className="bg-brand hover:bg-brand/80 text-white">
                    {step.action}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Your Endpoint */}
      <Card id="test-endpoint" className="bg-enostics-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Play className="h-5 w-5 text-enostics-green" />
            Test Your Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-enostics-gray-300">
            Once you've created your endpoint, test it with this sample cURL command:
          </p>
          
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm relative">
            <Button
              onClick={() => copyToClipboard(`curl -X POST https://api.enostics.com/v1/your-username/inbox \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello from my first test!",
    "timestamp": "${new Date().toISOString()}",
    "source": "quick-start-guide"
  }'`, 'curl-test')}
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-brand/20 hover:bg-brand/40 text-brand border-brand/50"
              variant="outline"
              size="sm"
            >
              {copiedCode === 'curl-test' ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <pre className="text-enostics-gray-300 pr-12">
{`curl -X POST https://api.enostics.com/v1/your-username/inbox \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello from my first test!",
    "timestamp": "${new Date().toISOString()}",
    "source": "quick-start-guide"
  }'`}
            </pre>
          </div>

          <div className="bg-brand/10 border border-brand/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-brand mt-0.5" />
              <div>
                <h4 className="font-medium text-white mb-1">Pro Tip</h4>
                <p className="text-sm text-enostics-gray-300">
                  Replace <code className="bg-black/30 px-1 py-0.5 rounded text-brand">your-username</code> with 
                  your actual Enostics username. You can find this in your dashboard settings.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button className="bg-brand hover:bg-brand/80 text-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Dashboard to View Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-enostics-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ArrowRight className="h-5 w-5 text-brand" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-enostics-gray-300">
            Congratulations! You've successfully set up your first Enostics endpoint. Here's what you can explore next:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-enostics-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-brand" />
                Connect Your Data
              </h4>
              <p className="text-sm text-enostics-gray-400">
                Learn how to connect health devices, IoT sensors, and other data sources to your endpoint.
              </p>
            </div>
            
            <div className="bg-enostics-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand" />
                Automate Workflows
              </h4>
              <p className="text-sm text-enostics-gray-400">
                Set up automated responses and actions based on incoming data patterns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 