'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, ArrowLeft, BookOpen } from 'lucide-react'

interface FloatingDocsNavbarProps {
  onMenuToggle: () => void
  showBackButton?: boolean
}

export function FloatingDocsNavbar({ onMenuToggle, showBackButton = false }: FloatingDocsNavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-enostics-gray-900/50 backdrop-blur-md border-b border-enostics-gray-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuToggle}
              className="text-white/80 hover:text-brand transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {showBackButton && (
              <Link 
                href="/docs"
                className="text-white/80 hover:text-brand transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            
            <div className="flex items-center gap-2">
              <Link href="/" className="text-white text-xl font-semibold hover:text-brand transition-colors">
                enostics
              </Link>
              <span className="text-white/40">/</span>
              <Link href="/docs" className="text-white/80 hover:text-brand transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">docs</span>
              </Link>
            </div>
          </div>
          
          {/* Right side - Navigation */}
          <div className="flex items-center gap-6 text-white/80">
            <Link 
              href="/playground" 
              className="hover:text-brand transition-colors text-sm font-medium"
            >
              Playground
            </Link>
            
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:text-brand transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <Link 
              href="/dashboard" 
              className="hover:text-brand transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            
            <Link 
              href="/login" 
              className="hover:text-brand transition-colors text-sm font-medium"
            >
              Login
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
                  placeholder="Search documentation..."
                  className="flex-1 bg-transparent text-white placeholder-white/60 outline-none focus:placeholder-brand/60"
                  autoFocus
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                />
                <div className="text-xs text-white/40 bg-enostics-gray-800 px-2 py-1 rounded">
                  ⌘K
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 