'use client'

import { Button } from '@/components/ui/button'
import { Server, Bot, Shield, Zap, Code, Globe, Database, Activity, Lock, Workflow } from 'lucide-react'

export function BelowFoldSection() {
  const features = [
    {
      icon: Server,
      title: "Personal API Endpoint",
      description: "Get your permanent, branded endpoint (api.enostics.com/v1/yourname) that serves as your digital nerve center.",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Bot,
      title: "AI-Powered Processing",
      description: "Built-in AI agents process, analyze, and respond to your data in real-time with context and intelligence.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: Shield,
      title: "Privacy & Security First",
      description: "End-to-end encryption, role-based access control, and you maintain complete ownership of your data.",
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: Zap,
      title: "Real-time Data Flow",
      description: "Stream data from any source - health devices, apps, services - and see it processed instantly.",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      icon: Code,
      title: "Developer-Friendly",
      description: "REST API, webhooks, SDKs, and comprehensive documentation. Built by developers, for everyone.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: Globe,
      title: "Universal Connectivity",
      description: "Connect any device, service, or platform. If it can send data, it can connect to your endpoint.",
      gradient: "from-indigo-500 to-purple-600"
    }
  ]

  const useCases = [
    {
      title: "Health & Wellness",
      description: "Connect fitness trackers, medical devices, and health apps to your personal health API.",
      icon: Activity,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Business Intelligence",
      description: "Aggregate data from CRM, analytics, and business tools into your personal data warehouse.",
      icon: Database,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "IoT & Smart Home",
      description: "Control and monitor all your smart devices through a single, intelligent endpoint.",
      icon: Workflow,
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Personal Automation",
      description: "Create custom workflows and automations that respond to your life patterns.",
      icon: Zap,
      color: "text-orange-600 dark:text-orange-400"
    }
  ]

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-enostics-gray-900 relative z-10 py-20 transition-colors duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Built for the
              <span className="block text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text">
                API Generation
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Every person deserves their own programmable interface to the digital world. Here's what makes Enostics different.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl hover:-translate-y-2 group"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Endless Possibilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From personal health tracking to business intelligence, your endpoint adapts to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div 
                key={useCase.title}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-700 ${useCase.color}`}>
                    <useCase.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Example Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8 md:p-12 border border-green-200 dark:border-green-800 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Simple. Powerful. Yours.
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Your endpoint is live from day one. Send data, receive insights, automate everything. No complex setup, no vendor lock-in.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900 dark:text-white">Instant endpoint creation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900 dark:text-white">Real-time data processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900 dark:text-white">AI-powered insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900 dark:text-white">Complete data ownership</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400 ml-2">Terminal</span>
              </div>
              <div className="text-left font-mono text-sm space-y-2">
                <div className="text-green-400">$ curl -X POST https://api.enostics.com/v1/yourname</div>
                <div className="text-blue-400">  -H "Content-Type: application/json"</div>
                <div className="text-yellow-400">  -d &apos;{`{"message": "Hello, world!"}`}&apos;</div>
                <div className="text-gray-400 mt-4">Response:</div>
                <div className="text-white">{`{`}</div>
                <div className="text-white ml-4">"status": "received",</div>
                <div className="text-white ml-4">"processed": true,</div>
                <div className="text-white ml-4">"endpoint": "yourname"</div>
                <div className="text-white">{`}`}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to claim your endpoint?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the API generation. Get your personal endpoint and start connecting your digital life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="inline-flex">
              <Button size="lg" className="px-8 py-4 text-lg rounded-2xl bg-green-600 hover:bg-green-700 text-white border-0 hover:scale-105 transition-all duration-200">
                Create My Endpoint
              </Button>
            </a>
            <a href="/login">
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                Sign In
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
} 