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
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      
      setReadingProgress(progress)
      setShowScrollTop(scrollTop > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <main className="relative w-screen min-h-screen">
      {/* Reading Progress Bar - TODO: motion.persist() */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-enostics-gray-800 z-40">
        <div 
          className="h-full bg-brand transition-all duration-300 ease-out origin-left"
          style={{ transform: `scaleX(${readingProgress / 100})` }}
        />
      </div>

      {/* Background */}
      <BackgroundMedia 
        type={homepageConfig.background.type}
        path={homepageConfig.background.path}
        mobilePath={homepageConfig.background.mobilePath}
        opacity={0.2}
        className="absolute inset-0 w-full h-full object-cover"
        videoOptions={homepageConfig.background.video}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-enostics-gray-950/90" />

      {/* Floating UI Elements */}
      <div className="relative z-10 min-h-screen">
        {/* Navigation */}
        <FloatingDocsNavbar onMenuToggle={toggleSidebar} showBackButton />
        
        {/* Floating Sidebar */}
        <FloatingDocsSidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar} 
          currentSectionId={section.id}
        />

        {/* Main Content */}
        <div className="pt-20 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm mb-8 p-4 bg-enostics-gray-900 rounded-lg border border-enostics-gray-700">
              <Link href="/" className="hover:text-brand transition-colors flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-enostics-gray-600" />
              <Link href="/docs" className="hover:text-brand transition-colors flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Documentation</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-enostics-gray-600" />
              <span className={`font-medium capitalize ${categoryColors[section.category]}`}>
                {section.category.replace('-', ' ')}
              </span>
              <ChevronRight className="h-3 w-3 text-enostics-gray-600" />
              <span className="text-white font-medium truncate">{section.title}</span>
            </nav>

            {/* Section Header */}
            <div className="mb-12">
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 bg-enostics-gray-900 border border-enostics-gray-700 rounded-xl">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge 
                      variant="outline" 
                      className={`text-sm px-3 py-1 font-medium ${difficultyColors[section.difficulty]}`}
                    >
                      {section.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-enostics-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{section.estimatedTime}</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-brand mb-4">{section.title}</h1>
                  <p className="text-lg text-enostics-gray-300 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {section.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs bg-enostics-gray-800 text-enostics-gray-300 border-enostics-gray-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Article Content with Prose */}
            <article className="prose prose-invert max-w-3xl mb-16">
              {renderContent(section.content)}
            </article>

            {/* Navigation Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {prevSection && (
                <Link href={`/docs/section/${prevSection.id}`}>
                  <Card className="bg-enostics-gray-900/50 border-enostics-gray-800 hover:border-brand/50 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowLeft className="h-4 w-4 text-brand" />
                        <span className="text-sm text-enostics-gray-400">Previous</span>
                      </div>
                      <h3 className="font-medium text-white">{prevSection.title}</h3>
                    </CardContent>
                  </Card>
                </Link>
              )}
              
              {nextSection && (
                <Link href={`/docs/section/${nextSection.id}`} className={prevSection ? '' : 'md:col-start-2'}>
                  <Card className="bg-enostics-gray-900/50 border-enostics-gray-800 hover:border-brand/50 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-end gap-3 mb-2">
                        <span className="text-sm text-enostics-gray-400">Next</span>
                        <ArrowRight className="h-4 w-4 text-brand" />
                      </div>
                      <h3 className="font-medium text-white text-right">{nextSection.title}</h3>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>

            {/* Related Sections */}
            {relatedSections.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-brand" />
                  Related Topics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedSections.map((related) => (
                    <Link key={related.id} href={`/docs/section/${related.id}`}>
                      <Card className="bg-enostics-gray-900/50 border-enostics-gray-800 hover:border-brand/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {related.icon}
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${difficultyColors[related.difficulty]}`}
                            >
                              {related.difficulty}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-white mb-2">{related.title}</h4>
                          <p className="text-sm text-enostics-gray-400 line-clamp-2">
                            {related.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-brand hover:bg-brand/80 text-white shadow-lg z-40"
            size="sm"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </main>
  )
} 