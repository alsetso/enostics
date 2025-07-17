'use client'

import Link from 'next/link'

interface FloatingSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function FloatingSidebar({ isOpen, onClose }: FloatingSidebarProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 w-64 bg-black/90 backdrop-blur-lg border-r border-white/10 z-50 p-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/enostics.png" alt="Enostics Logo" className="h-8 w-8" />
            <span className="font-bold text-xl text-white">Enostics</span>
          </Link>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="#hero" className="text-white/80 hover:text-white transition py-2" onClick={onClose}>Home</Link>
          <Link href="#features" className="text-white/80 hover:text-white transition py-2" onClick={onClose}>Features</Link>
          <Link href="#architecture-overview" className="text-white/80 hover:text-white transition py-2" onClick={onClose}>Architecture</Link>
          <Link href="#developer-api" className="text-white/80 hover:text-white transition py-2" onClick={onClose}>Developers</Link>
          <Link href="#security-policy" className="text-white/80 hover:text-white transition py-2" onClick={onClose}>Security</Link>
          <Link href="#faq" className="text-white/80 hover:text-white transition py-2" onClick={onClose}>FAQ</Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full px-6 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition text-center">
              Login
            </Link>
            <Link href="/register" className="w-full px-6 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition text-center">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  )
} 