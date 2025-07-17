'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, ArrowLeft, BookOpen } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface FloatingDocsNavbarProps {
  onMenuToggle: () => void
  showBackButton?: boolean
}

export function FloatingDocsNavbar({ onMenuToggle, showBackButton = false }: FloatingDocsNavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-enostics-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-enostics-gray-800 transition-colors duration-300 text-gray-900 dark:text-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuToggle}
              className="text-gray-700 dark:text-white/80 hover:text-brand transition-colors p-2 hover:bg-gray-100/30 dark:hover:bg-white/10 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {showBackButton && (
              <Link 
                href="/docs"
                className="text-gray-700 dark:text-white/80 hover:text-brand transition-colors p-2 hover:bg-gray-100/30 dark:hover:bg-white/10 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            
            <div className="flex items-center gap-2">
              <Link href="/" className="text-gray-700 dark:text-white/80 hover:text-brand transition-colors flex items-center gap-2">
                <img src="/enostics.png" alt="Enostics" className="h-5 w-5" />
                enostics
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/docs" className="text-gray-700 dark:text-white/80 hover:text-brand transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">docs</span>
              </Link>
            </div>
          </div>
          
          {/* Right side - Navigation */}
          <div className="flex items-center gap-6 text-gray-700 dark:text-white/80">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-700 dark:text-white/80 hover:text-brand transition-colors p-2 hover:bg-gray-100/30 dark:hover:bg-white/10 rounded-lg"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <Link 
              href="/dashboard" 
              className="text-gray-700 dark:text-white/80 hover:text-brand transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            
            <Link 
              href="/login" 
              className="text-gray-700 dark:text-white/80 hover:text-brand transition-colors text-sm font-medium"
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
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="flex-1 bg-transparent text-gray-700 dark:text-white/80 placeholder-gray-400 outline-none focus:placeholder-brand/60"
                  autoFocus
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                />
                <div className="text-xs text-gray-400 bg-enostics-gray-800 px-2 py-1 rounded">
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