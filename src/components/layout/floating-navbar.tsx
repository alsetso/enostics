'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface FloatingNavbarProps {
  onMenuToggle: () => void
}

export function FloatingNavbar({ onMenuToggle }: FloatingNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300 text-gray-900 dark:text-white">
      <Link href="/" className="flex items-center gap-2 font-semibold text-lg md:text-xl text-green-600 dark:text-green-400">
        <img src="/enostics.png" alt="Enostics" className="h-6 w-6" />
        enostics
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        <Link href="#hero" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
          Home
        </Link>
        <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
          Features
        </Link>
        <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
          Login
        </Link>
        <ThemeToggle />
        <Link href="/register">
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg">
            Sign Up
          </button>
        </Link>
      </div>
      
      <button 
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </nav>
  )
} 