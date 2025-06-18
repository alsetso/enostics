'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { BackgroundMedia } from '@/components/ui/background-media'
import { FloatingDocsNavbar } from '@/components/layout/floating-docs-navbar'
import { FloatingDocsSidebar } from '@/components/layout/floating-docs-sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  BookOpen,
  ChevronRight,
  Home,
  ArrowUp,
  Share2,
  Bookmark,
  Eye,
  Users,
  Star,
  CheckCircle2,
  AlertCircle,
  Info,
  Lightbulb
} from 'lucide-react'
import { DocSection, getNextSection, getPrevSection, getSectionsByCategory } from '../content/sections'
import { QuickStartContent } from '../content/getting-started/quick-start'
import { WhatIsEnosticsContent } from '../content/concepts/what-is-enostics'
import { homepageConfig } from '@/config/homepage'

interface DocLayoutProps {
  section: DocSection
  children?: ReactNode
}

const difficultyColors = {
  beginner: 'bg-enostics-green/20 text-enostics-green border-enostics-green/30',
  intermediate: 'bg-brand/20 text-brand border-brand/30',
  advanced: 'bg-enostics-red/20 text-enostics-red border-enostics-red/30'
}

const categoryColors = {
  'getting-started': 'text-enostics-green',
  'concepts': 'text-brand',
  'guides': 'text-enostics-amber',
  'reference': 'text-enostics-red',
  'examples': 'text-enostics-green',
  'advanced': 'text-enostics-red'
}

function renderContent(contentId: string) {
  switch (contentId) {
    case 'quick-start':
      return <QuickStartContent />
    case 'what-is-enostics':
      return <WhatIsEnosticsContent />
    case 'coming-soon':
      return (
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="text-8xl mb-4 animate-bounce">🚧</div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-brand rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-6">
            Content Coming Soon
          </h3>
          <p className="text-lg text-enostics-gray-400 max-w-lg mx-auto leading-relaxed mb-8">
            We're crafting comprehensive documentation for this section with interactive examples, 
            code snippets, and real-world use cases.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-enostics-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
              <span>In Development</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-enostics-green rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span>Coming Q1 2024</span>
            </div>
          </div>
        </div>
      )
    default:
      return (
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 text-enostics-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Content Not Found</h3>
          <p className="text-enostics-gray-400">This section hasn't been implemented yet.</p>
        </div>
      )
  }
}

export function DocLayout({ section, children }: DocLayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const nextSection = getNextSection(section.id)
  const prevSection = getPrevSection(section.id)
  const relatedSections = getSectionsByCategory(section.category).filter(s => s.id !== section.id).slice(0, 3)

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.doc-content-scroll')
      if (!scrollContainer) return
      
      const scrollTop = scrollContainer.scrollTop
      const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      
      setReadingProgress(progress)
      setShowScrollTop(scrollTop > 400)
    }

    const scrollContainer = document.querySelector('.doc-content-scroll')
    scrollContainer?.addEventListener('scroll', handleScroll)
    return () => scrollContainer?.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    const scrollContainer = document.querySelector('.doc-content-scroll')
    scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="h-screen bg-enostics-gray-950 overflow-hidden">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-enostics-gray-800 z-50">
        <div 
          className="h-full bg-brand transition-all duration-300 ease-out origin-left"
          style={{ transform: `scaleX(${readingProgress / 100})` }}
        />
      </div>

      {/* Background - only on mobile */}
      <div className="relative lg:hidden">
        <BackgroundMedia 
          type={homepageConfig.background.type}
          path={homepageConfig.background.path}
          mobilePath={homepageConfig.background.mobilePath}
          opacity={0.2}
          className="absolute inset-0 w-full h-full object-cover"
          videoOptions={homepageConfig.background.video}
        />
        <div className="absolute inset-0 bg-enostics-gray-950/90" />
      </div>

      {/* Layout Container - Fixed height with flex */}
      <div className="flex h-screen">
        {/* Sidebar - Always visible on desktop, fixed position */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <FloatingDocsSidebar 
            isOpen={true}
            onClose={undefined}
            currentSectionId={section.id}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <FloatingDocsSidebar 
            isOpen={isSidebarOpen} 
            onClose={closeSidebar} 
            currentSectionId={section.id}
          />
        </div>

        {/* Main Content Area - Flex column with fixed header and scrollable content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile Navigation - Fixed */}
          <div className="lg:hidden flex-shrink-0">
            <FloatingDocsNavbar onMenuToggle={toggleSidebar} showBackButton />
          </div>

          {/* Desktop Header Bar - Fixed */}
          <div className="hidden lg:block flex-shrink-0 bg-enostics-gray-950/95 backdrop-blur-xl border-b border-enostics-gray-800/50">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href="/" className="text-white text-xl font-semibold hover:text-brand transition-colors">
                    enostics
                  </Link>
                  <span className="text-white/40">/</span>
                  <Link href="/docs" className="text-white/80 hover:text-brand transition-colors">
                    docs
                  </Link>
                  <span className="text-white/40">/</span>
                  <span className="text-white/60 font-medium">{section.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.share?.({ title: section.title, url: window.location.href })}
                    className="text-enostics-gray-400 hover:text-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-6 text-white/80">
                    <Link href="/playground" className="hover:text-brand transition-colors text-sm font-medium">
                      Playground
                    </Link>
                    <Link href="/dashboard" className="hover:text-brand transition-colors text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link href="/login" className="hover:text-brand transition-colors text-sm font-medium">
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto doc-content-scroll">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
              {/* Article Header */}
              <header className="mb-12">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-enostics-gray-400 mb-6">
                  <Link href="/docs" className="hover:text-brand transition-colors">
                    Documentation
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className={categoryColors[section.category]}>{section.category.replace('-', ' ')}</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-white">{section.title}</span>
                </nav>

                {/* Title and Metadata */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                      {section.title}
                    </h1>
                    <p className="text-xl text-enostics-gray-300 leading-relaxed mb-6">
                      {section.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <Badge 
                        variant="outline" 
                        className={`${difficultyColors[section.difficulty]} px-3 py-1`}
                      >
                        {section.difficulty}
                      </Badge>
                      <div className="flex items-center gap-2 text-enostics-gray-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{section.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-enostics-gray-400">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Updated recently</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      className="border-enostics-gray-600 text-enostics-gray-300 hover:text-white hover:border-enostics-gray-500"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-enostics-gray-600 text-enostics-gray-300 hover:text-white hover:border-enostics-gray-500"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </header>

              {/* Article Content */}
              <article className="prose prose-invert prose-lg max-w-none mb-16">
                {children || renderContent(section.id)}
              </article>

              {/* Navigation */}
              <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-8 border-t border-enostics-gray-800/50">
                <div className="flex-1">
                  {prevSection && (
                    <Link 
                      href={`/docs/section/${prevSection.id}`}
                      className="group flex items-center gap-3 p-4 bg-enostics-gray-900/50 border border-enostics-gray-700/50 rounded-xl hover:bg-enostics-gray-800/50 hover:border-enostics-gray-600/50 transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5 text-enostics-gray-400 group-hover:text-brand transition-colors" />
                      <div>
                        <div className="text-xs text-enostics-gray-500 mb-1">Previous</div>
                        <div className="font-medium text-white group-hover:text-brand transition-colors">
                          {prevSection.title}
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
                
                <div className="flex-1 flex justify-end">
                  {nextSection && (
                    <Link 
                      href={`/docs/section/${nextSection.id}`}
                      className="group flex items-center gap-3 p-4 bg-enostics-gray-900/50 border border-enostics-gray-700/50 rounded-xl hover:bg-enostics-gray-800/50 hover:border-enostics-gray-600/50 transition-all duration-200"
                    >
                      <div className="text-right">
                        <div className="text-xs text-enostics-gray-500 mb-1">Next</div>
                        <div className="font-medium text-white group-hover:text-brand transition-colors">
                          {nextSection.title}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-enostics-gray-400 group-hover:text-brand transition-colors" />
                    </Link>
                  )}
                </div>
              </nav>

              {/* Related Sections */}
              {relatedSections.length > 0 && (
                <section className="py-12 border-t border-enostics-gray-800/50">
                  <h2 className="text-2xl font-bold text-white mb-8">Related Documentation</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {relatedSections.map((relatedSection) => (
                      <Link 
                        key={relatedSection.id}
                        href={`/docs/section/${relatedSection.id}`}
                        className="group p-4 bg-enostics-gray-900/30 border border-enostics-gray-700/50 rounded-xl hover:bg-enostics-gray-800/50 hover:border-enostics-gray-600/50 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-brand/10 border border-brand/20 rounded-lg group-hover:bg-brand/20 transition-colors">
                            {relatedSection.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white group-hover:text-brand transition-colors mb-1">
                              {relatedSection.title}
                            </h3>
                            <p className="text-sm text-enostics-gray-400 line-clamp-2">
                              {relatedSection.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${difficultyColors[relatedSection.difficulty]}`}
                              >
                                {relatedSection.difficulty}
                              </Badge>
                              <span className="text-xs text-enostics-gray-500">{relatedSection.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 bg-brand hover:bg-brand-light text-white shadow-lg"
          size="sm"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 