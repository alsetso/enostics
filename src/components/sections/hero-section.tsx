'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Code, Globe, Zap, Shield, Database, Bot } from 'lucide-react'

export function HeroSection() {
  const [message, setMessage] = useState('')
  const [currentEndpoint, setCurrentEndpoint] = useState('api.enostics.com/v1/yourname')
  const router = useRouter()
  
  const exampleEndpoints = [
    'api.enostics.com/v1/alex',
    'api.enostics.com/v1/sarah',
    'api.enostics.com/v1/doctor_smith',
    'api.enostics.com/v1/yourname'
  ]

  const exampleOptions = [
    'Create my personal endpoint',
    'Connect health device',
    'Sync calendar data',
    'Link social media'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEndpoint(prev => {
        const currentIndex = exampleEndpoints.indexOf(prev)
        const nextIndex = (currentIndex + 1) % exampleEndpoints.length
        return exampleEndpoints[nextIndex]
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      window.open(`/dashboard/chat?start=${encodeURIComponent(message)}`, '_blank')
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative z-10 bg-white dark:bg-enostics-gray-950 transition-colors duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.2),transparent_50%)]" />
      
      {/* Floating API Endpoint Visualization */}
      <div className="absolute top-20 right-10 hidden lg:block">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono text-gray-600 dark:text-gray-300">LIVE</span>
          </div>
          <div className="font-mono text-sm text-gray-900 dark:text-white">
            https://{currentEndpoint}
          </div>
        </div>
      </div>

      {/* Data Flow Animation */}
      <div className="absolute top-40 left-10 hidden lg:block">
        <div className="flex flex-col gap-2">
          {['Health Device', 'Calendar', 'Email', 'Custom App'].map((source, index) => (
            <div 
              key={source}
              className="flex items-center gap-2 opacity-60 animate-pulse"
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">{source}</span>
              <div className="w-8 h-px bg-gradient-to-r from-green-400 to-transparent"></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center max-w-5xl px-6 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-4 py-2 mb-6">
          <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Universal Personal API Layer</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
          Your Personal
          <span className="block text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text">
            API Endpoint
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed transition-colors duration-300">
          Every person deserves their own programmable endpoint. Connect anything, control everything, own your data — live and private.
        </p>

        {/* Live Code Example */}
        <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 mb-8 max-w-3xl mx-auto border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-400 ml-2">Your Personal Endpoint</span>
          </div>
          <div className="text-left">
            <div className="text-green-400 font-mono text-sm mb-2">POST https://api.enostics.com/v1/yourname</div>
            <div className="text-gray-300 font-mono text-sm">
              {`{
  "source": "health_device",
  "data": { "heart_rate": 72, "steps": 8543 },
  "timestamp": "2024-01-15T10:30:00Z"
}`}
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mb-8 w-full">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="What would you like to connect to your endpoint?"
            className="w-full max-w-2xl min-h-[80px] text-lg px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 shadow-lg resize-none transition-all duration-300"
            aria-label="Start a chat or connection"
          />
          <Button 
            type="submit" 
            className="w-full max-w-2xl text-lg px-4 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white border-0 hover:scale-105 transition-all duration-200"
          >
            Create My Endpoint
          </Button>
        </form>
        
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {exampleOptions.map(option => (
            <button
              key={option}
              type="button"
              className="px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 transition-all duration-200 hover:scale-105"
              onClick={() => setMessage(option)}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="text-gray-900 dark:text-white font-medium">Real-time Processing</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="text-gray-900 dark:text-white font-medium">Privacy First</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="text-gray-900 dark:text-white font-medium">Universal Connect</span>
          </div>
        </div>
      </div>
    </section>
  )
} 