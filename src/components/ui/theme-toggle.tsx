'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true) // Default to dark
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('mode')
    if (savedTheme) {
      const isDarkMode = savedTheme === 'dark'
      setIsDark(isDarkMode)
      applyTheme(isDarkMode)
    } else {
      // Default to dark mode
      localStorage.setItem('mode', 'dark')
      setIsDark(true)
      applyTheme(true)
    }
  }, [])

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement
    const body = document.body
    
    // Remove existing theme classes from both html and body
    root.classList.remove('dark', 'light')
    body.classList.remove('dark', 'light')
    
    // Apply new theme class to both html and body
    if (dark) {
      root.classList.add('dark')
      body.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.add('light')
      body.classList.add('light')
      root.style.colorScheme = 'light'
    }
    
    // Force a repaint
    root.style.display = 'none'
    root.offsetHeight // Trigger reflow
    root.style.display = ''
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem('mode', newIsDark ? 'dark' : 'light')
    applyTheme(newIsDark)
  }

  if (!mounted) {
    return (
      <div className="h-8 w-8" /> // Placeholder to prevent layout shift
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 p-1 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--hover-bg))] transition-all duration-200"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform duration-200" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-200" />
      )}
    </Button>
  )
} 