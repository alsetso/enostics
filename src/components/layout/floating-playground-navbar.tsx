'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, Play, Activity, Code2, Terminal } from 'lucide-react'

interface FloatingPlaygroundNavbarProps {
  onMenuToggle?: () => void
  requestCount?: number
  maxRequests?: number
  isLive?: boolean
}

export function FloatingPlaygroundNavbar({ 
  onMenuToggle, 
  requestCount = 0, 
  maxRequests = 5, 
  isLive = false 
}: FloatingPlaygroundNavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-enostics-gray-950/90 backdrop-blur-md border-b border-enostics-gray-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-4">
            {onMenuToggle && (
              <button 
                onClick={onMenuToggle}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <Link href="/" className="text-white text-xl font-semibold hover:text-enostics-blue transition-colors">
                enostics
              </Link>
              <span className="text-white/40">/</span>
              <Link href="/playground" className="text-white/80 hover:text-white transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                <span className="font-medium">playground</span>
              </Link>
            </div>
            
            {/* Live Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-enostics-gray-900 rounded-full border border-enostics-gray-700">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-enostics-green animate-pulse' : 'bg-enostics-gray-600'}`}></div>
              <span className="text-xs text-enostics-gray-400">
                {isLive ? 'Live' : 'Ready'}
              </span>
            </div>
          </div>
          
          {/* Center - Request Counter */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-enostics-blue/20 text-enostics-blue rounded-lg border border-enostics-blue/30">
              <Activity className="w-4 h-4" />
              <span className="font-medium">{requestCount}/{maxRequests}</span>
              <span className="text-xs">requests</span>
            </div>
          </div>
          
          {/* Right side - Navigation */}
          <div className="flex items-center gap-6 text-white/80">
            <Link 
              href="/docs" 
              className="hover:text-white transition-colors text-sm font-medium"
            >
              Docs
            </Link>
            
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <Link 
              href="/dashboard" 
              className="hover:text-white transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            
            <Link 
              href="/register" 
              className="bg-enostics-blue hover:bg-enostics-blue-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Full API
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="mt-4">
            <div className="bg-enostics-gray-900 rounded-lg border border-enostics-gray-700 p-4">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search API examples..."
                  className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
                  autoFocus
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                />
                <div className="text-xs text-white/40 bg-enostics-gray-800 px-2 py-1 rounded flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  API
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 