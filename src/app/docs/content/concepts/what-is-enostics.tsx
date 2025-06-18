'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb,
  Globe,
  Database,
  Zap,
  Shield,
  Users,
  Smartphone,
  Heart,
  Activity,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Play,
  Code,
  Layers,
  Target,
  Sparkles
} from 'lucide-react'

export const metadata = { 
  sidebarLabel: 'What is Enostics?', 
  icon: Lightbulb 
}

export function WhatIsEnosticsContent() {
  const coreFeatures = [
    {
      icon: <Globe className="h-6 w-6 text-brand" />,
      title: "Personal API Endpoint",
      description: "Your unique, persistent URL that receives data from any source"
    },
    {
      icon: <Database className="h-6 w-6 text-enostics-green" />,
      title: "Universal Data Inbox",
      description: "Collect health data, IoT sensors, webhooks, and more in one place"
    },
    {
      icon: <Zap className="h-6 w-6 text-enostics-amber" />,
      title: "Real-time Processing",
      description: "Instant data processing and intelligent classification"
    },
    {
      icon: <Shield className="h-6 w-6 text-enostics-red" />,
      title: "Privacy First",
      description: "You own and control 100% of your data, always"
    }
  ]

  const useCases = [
    {
      icon: <Heart className="h-5 w-5 text-enostics-red" />,
      title: "Health Monitoring",
      description: "Connect fitness trackers, medical devices, and health apps to track your wellness journey",
      examples: ["Apple Health", "Fitbit", "Blood pressure monitors", "Sleep trackers"]
    },
    {
      icon: <Smartphone className="h-5 w-5 text-brand" />,
      title: "IoT Integration",
      description: "Unify data from smart home devices, sensors, and connected gadgets",
      examples: ["Smart thermostats", "Security cameras", "Environmental sensors", "Smart lights"]
    },
    {
      icon: <Activity className="h-5 w-5 text-enostics-green" />,
      title: "Workflow Automation",
      description: "Trigger actions and notifications based on incoming data patterns",
      examples: ["Email alerts", "Slack notifications", "Database updates", "API calls"]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Lightbulb className="h-8 w-8 text-brand" />
          <h1 className="text-3xl font-bold text-brand">What is Enostics?</h1>
        </div>
        <p className="text-lg text-enostics-gray-300 max-w-3xl mx-auto">
          Enostics is the universal personal API layer for every individual. 
          It gives you a persistent, intelligent, programmable endpoint to collect, 
          process, and act on data from any source in your life.
        </p>
      </div>

      {/* The Big Idea */}
      <Card className="bg-gradient-to-r from-brand/10 to-enostics-green/10 border-brand/30">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-brand/20 text-brand px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              The Core Concept
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">You Are The App</h2>
            <p className="text-lg text-enostics-gray-300 max-w-2xl mx-auto">
              Instead of juggling dozens of apps and services, Enostics makes <strong>you</strong> the central platform. 
              Every device, service, and data source connects directly to your personal endpoint.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-enostics-gray-900/50 rounded-lg p-4">
              <div className="w-12 h-12 bg-brand/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-brand" />
              </div>
              <h3 className="font-semibold text-white mb-2">Land</h3>
              <p className="text-sm text-enostics-gray-400">
                Data from any source lands at your personal endpoint
              </p>
            </div>
            
            <div className="bg-enostics-gray-900/50 rounded-lg p-4">
              <div className="w-12 h-12 bg-enostics-green/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Database className="h-6 w-6 text-enostics-green" />
              </div>
              <h3 className="font-semibold text-white mb-2">Load</h3>
              <p className="text-sm text-enostics-gray-400">
                Intelligent processing and classification happens automatically
              </p>
            </div>
            
            <div className="bg-enostics-gray-900/50 rounded-lg p-4">
              <div className="w-12 h-12 bg-enostics-amber/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-enostics-amber" />
              </div>
              <h3 className="font-semibold text-white mb-2">Launch</h3>
              <p className="text-sm text-enostics-gray-400">
                Trigger actions, insights, and automations based on your data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Features */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="h-6 w-6 text-brand" />
          Core Features
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="bg-enostics-gray-900/50 border-enostics-gray-800 hover:border-brand/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-enostics-gray-800 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-enostics-gray-400">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="h-6 w-6 text-brand" />
          Common Use Cases
        </h2>
        
        <div className="space-y-6">
          {useCases.map((useCase, index) => (
            <Card key={index} className="bg-enostics-gray-900/50 border-enostics-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-enostics-gray-800 rounded-lg">
                    {useCase.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">{useCase.title}</h3>
                    <p className="text-sm text-enostics-gray-400 mb-3">{useCase.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {useCase.examples.map((example, exampleIndex) => (
                        <Badge 
                          key={exampleIndex} 
                          variant="secondary" 
                          className="text-xs bg-enostics-gray-800 text-enostics-gray-300 border-enostics-gray-700"
                        >
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <Card className="bg-enostics-gray-900/50 border-enostics-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Code className="h-5 w-5 text-brand" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-white mb-3">1. Get Your Endpoint</h3>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm mb-3">
                <div className="text-brand">https://api.enostics.com/v1/</div>
                <div className="text-enostics-green">your-username</div>
                <div className="text-enostics-gray-400">/inbox</div>
              </div>
              <p className="text-sm text-enostics-gray-400">
                Your personal, permanent URL that never changes
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">2. Send Data</h3>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm mb-3">
                <div className="text-enostics-gray-300">POST /v1/your-username/inbox</div>
                <div className="text-enostics-amber">Content-Type: application/json</div>
                <div className="text-enostics-green">{"{ \"data\": \"anything\" }"}</div>
              </div>
              <p className="text-sm text-enostics-gray-400">
                Any device or service can send JSON data
              </p>
            </div>
          </div>
          
          <div className="bg-brand/10 border border-brand/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-brand mt-0.5" />
              <div>
                <h4 className="font-medium text-white mb-1">That's It!</h4>
                <p className="text-sm text-enostics-gray-300">
                  Your data appears instantly in your dashboard, ready to view, analyze, and automate.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why Enostics */}
      <Card className="bg-enostics-gray-900/50 border-enostics-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-brand" />
            Why Choose Enostics?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-enostics-green mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Universal Compatibility</h4>
                  <p className="text-sm text-enostics-gray-400">Works with any device, app, or service that can send HTTP requests</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-enostics-green mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Privacy by Design</h4>
                  <p className="text-sm text-enostics-gray-400">Your data stays yours. No selling, no sharing, no compromises</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-enostics-green mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Real-time Intelligence</h4>
                  <p className="text-sm text-enostics-gray-400">Automatic data classification and pattern recognition</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-enostics-green mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Infinite Scalability</h4>
                  <p className="text-sm text-enostics-gray-400">From a few data points to millions, we scale with you</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-enostics-green mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Developer Friendly</h4>
                  <p className="text-sm text-enostics-gray-400">Simple REST API, comprehensive docs, and SDKs</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-enostics-green mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Future Proof</h4>
                  <p className="text-sm text-enostics-gray-400">Built to adapt and grow with emerging technologies</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Get Started */}
      <Card className="bg-gradient-to-r from-brand/10 to-enostics-green/10 border-brand/30">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-enostics-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of individuals who have taken control of their personal data ecosystem with Enostics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-brand hover:bg-brand/80 text-white">
              <Play className="h-4 w-4 mr-2" />
              Start Your Free Account
            </Button>
            
            <Button variant="outline" className="border-brand/50 text-brand hover:bg-brand/10">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 