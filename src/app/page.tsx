'use client'

import { useState } from 'react'
import { BackgroundMedia } from '@/components/ui/background-media'
import { FloatingNavbar } from '@/components/layout/floating-navbar'
import { FloatingSidebar } from '@/components/layout/floating-sidebar'
import { FloatingInfoPanel } from '@/components/layout/floating-info-panel'
import { HeroSection } from '@/components/sections/hero-section'
import { BelowFoldSection } from '@/components/sections/below-fold-section'
import { homepageConfig } from '@/config/homepage'

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Background Image/Pattern - 100vw x 100vh */}
      <BackgroundMedia 
        type={homepageConfig.background.type}
        path={homepageConfig.background.path}
        mobilePath={homepageConfig.background.mobilePath}
        opacity={homepageConfig.background.opacity}
        className="absolute inset-0 w-full h-full object-cover"
        videoOptions={homepageConfig.background.video}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Floating UI Elements */}
      <div className="relative z-10 h-full">
        {/* Floating Navigation */}
        <FloatingNavbar onMenuToggle={toggleSidebar} />
        
        {/* Floating Sidebar */}
        <FloatingSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        {/* Floating Info Panel */}
        <FloatingInfoPanel />
        
        {/* Scrollable Content with Snap */}
        <div className="h-screen snap-y snap-mandatory overflow-y-scroll">
          {/* Hero Section - 100vh */}
          <div className="snap-start">
            <HeroSection />
          </div>
          
          {/* Below Fold Section - 100vh */}
          <div className="snap-start">
            <BelowFoldSection />
          </div>
        </div>
      </div>
    </main>
  )
}


