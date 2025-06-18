'use client'

import { useState } from 'react'
import { Search, Menu } from 'lucide-react'

interface FloatingNavbarProps {
  onMenuToggle: () => void
}

export function FloatingNavbar({ onMenuToggle }: FloatingNavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-6">
      <div className="flex items-center justify-between">
        {/* Left side - Hamburger + Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuToggle}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-white text-xl font-semibold">enostics</h1>
        </div>
        
        {/* Right side - Navigation */}
        <div className="flex items-center gap-6 text-white/80">
          <a 
            href="/docs" 
            className="hover:text-white transition-colors text-sm font-medium"
          >
            Docs
          </a>
          <a 
            href="/playground" 
            className="hover:text-white transition-colors text-sm font-medium"
          >
            Playground
          </a>
          
          {/* Search Button */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <Search className="w-4 h-4" />
          </button>
          
          <a 
            href="/login" 
            className="hover:text-white transition-colors text-sm font-medium"
          >
            Login
          </a>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 mx-6">
          <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 