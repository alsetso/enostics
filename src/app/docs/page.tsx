'use client'

import { useState } from 'react'
import { BackgroundMedia } from '@/components/ui/background-media'
import { FloatingDocsNavbar } from '@/components/layout/floating-docs-navbar'
import { FloatingDocsSidebar } from '@/components/layout/floating-docs-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  BookOpen, 
  Rocket, 
  Code, 
  Users, 
  Shield, 
  Zap,
  Database,
  Globe,
  Settings,
  Heart,
  Smartphone,
  Cloud,
  Lock,
  ArrowRight,
  ExternalLink,
  Play,
  FileText,
  Terminal,
  Puzzle,
  Lightbulb,
  HelpCircle,
  CheckCircle,
  Star,
  Layers,
  Activity,
  Clock,
  Search,
  Filter,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { getAllSections } from './content/sections'
import { homepageConfig } from '@/config/homepage'

interface DocSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'getting-started' | 'concepts' | 'guides' | 'reference' | 'examples' | 'advanced'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  tags: string[]
}

const categories = [
  { 
    id: 'all', 
    name: 'All Sections', 
    icon: <BookOpen className="h-4 w-4" />,
    color: 'text-white'
  },
  { 
    id: 'getting-started', 
    name: 'Getting Started', 
    icon: <Rocket className="h-4 w-4" />,
    color: 'text-enostics-green'
  },
  { 
    id: 'concepts', 
    name: 'Core Concepts', 
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-brand'
  },
  { 
    id: 'guides', 
    name: 'User Guides', 
    icon: <Users className="h-4 w-4" />,
    color: 'text-enostics-amber'
  },
  { 
    id: 'reference', 
    name: 'API Reference', 
    icon: <BookOpen className="h-4 w-4" />,
    color: 'text-enostics-red'
  },
  { 
    id: 'examples', 
    name: 'Examples', 
    icon: <Zap className="h-4 w-4" />,
    color: 'text-enostics-green'
  },
  { 
    id: 'advanced', 
    name: 'Advanced', 
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'text-enostics-red'
  }
]

const difficultyColors = {
  beginner: 'bg-enostics-green/20 text-enostics-green border-enostics-green/30',
  intermediate: 'bg-brand/20 text-brand border-brand/30',
  advanced: 'bg-enostics-red/20 text-enostics-red border-enostics-red/30'
}

export default function DocsPage() {
  const docSections = getAllSections()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const filteredSections = docSections.filter(section => {
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="h-screen bg-enostics-gray-950 overflow-hidden">
      {/* Background - only on mobile */}
      <div className="relative lg:hidden">
        <BackgroundMedia 
          type={homepageConfig.background.type}
          path={homepageConfig.background.path}
          mobilePath={homepageConfig.background.mobilePath}
          opacity={0.3}
          className="absolute inset-0 w-full h-full object-cover"
          videoOptions={homepageConfig.background.video}
        />
        <div className="absolute inset-0 bg-enostics-gray-950/80" />
      </div>

      {/* Layout Container - Fixed height with flex */}
      <div className="flex h-screen">
        {/* Sidebar - Always visible on desktop, fixed position */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <FloatingDocsSidebar 
            isOpen={true} 
            onClose={undefined} 
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <FloatingDocsSidebar 
            isOpen={isSidebarOpen} 
            onClose={closeSidebar} 
          />
        </div>

        {/* Main Content Area - Flex column with fixed header and scrollable content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile Navigation - Fixed */}
          <div className="lg:hidden flex-shrink-0">
            <FloatingDocsNavbar onMenuToggle={toggleSidebar} />
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
                  <span className="text-white/80 font-medium">docs</span>
                </div>
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

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-6 lg:px-8 py-12">
              {/* Hero Section */}
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-full text-sm text-brand font-medium mb-6">
                    <Sparkles className="h-4 w-4" />
                    Universal Personal API Documentation
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Build with{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-light to-brand">
                      Enostics
                    </span>
                  </h1>
                  <p className="text-xl text-enostics-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Everything you need to integrate with the universal personal API layer. 
                    From quick start guides to advanced implementation patterns.
                  </p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-enostics-gray-500" />
                    <input
                      type="text"
                      placeholder="Search documentation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-enostics-gray-900/50 border border-enostics-gray-700/50 rounded-xl text-white placeholder-enostics-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-brand/20 text-brand border border-brand/30'
                            : 'bg-enostics-gray-900/50 text-enostics-gray-300 border border-enostics-gray-700/50 hover:bg-enostics-gray-800/50 hover:text-white'
                        }`}
                      >
                        {category.icon}
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Documentation Sections */}
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredSections.map((section) => (
                    <Card key={section.id} className="group bg-enostics-gray-900/50 border-enostics-gray-700/50 hover:bg-enostics-gray-800/50 hover:border-enostics-gray-600/50 transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand/10 border border-brand/20 rounded-lg group-hover:bg-brand/20 transition-colors">
                              {section.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg text-white group-hover:text-brand transition-colors">
                                {section.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${difficultyColors[section.difficulty]}`}
                                >
                                  {section.difficulty}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-enostics-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {section.estimatedTime}
                                </div>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-enostics-gray-500 group-hover:text-brand group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-enostics-gray-400 text-sm leading-relaxed mb-4">
                          {section.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {section.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-enostics-gray-800/50 text-enostics-gray-400 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {section.tags.length > 3 && (
                            <span className="px-2 py-1 bg-enostics-gray-800/50 text-enostics-gray-400 text-xs rounded-md">
                              +{section.tags.length - 3} more
                            </span>
                          )}
                        </div>
                        <Link 
                          href={`/docs/section/${section.id}`}
                          className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand-light transition-colors font-medium"
                        >
                          Read Documentation
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty State */}
                {filteredSections.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-medium text-white mb-2">No documentation found</h3>
                    <p className="text-enostics-gray-400 mb-6">
                      Try adjusting your search terms or category filter.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('all')
                      }}
                      className="px-6 py-3 bg-brand/20 text-brand border border-brand/30 rounded-xl hover:bg-brand/30 transition-colors font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Quick Links */}
                <div className="mt-20 pt-12 border-t border-enostics-gray-800/50">
                  <h2 className="text-2xl font-bold text-white mb-8 text-center">Popular Resources</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/docs/section/quick-start" className="group p-6 bg-enostics-gray-900/30 border border-enostics-gray-700/50 rounded-xl hover:bg-enostics-gray-800/50 hover:border-enostics-gray-600/50 transition-all duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Rocket className="h-5 w-5 text-enostics-green" />
                        <h3 className="font-semibold text-white group-hover:text-enostics-green transition-colors">Quick Start</h3>
                      </div>
                      <p className="text-sm text-enostics-gray-400">Get up and running in minutes</p>
                    </Link>
                    <Link href="/playground" className="group p-6 bg-enostics-gray-900/30 border border-enostics-gray-700/50 rounded-xl hover:bg-enostics-gray-800/50 hover:border-enostics-gray-600/50 transition-all duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Play className="h-5 w-5 text-brand" />
                        <h3 className="font-semibold text-white group-hover:text-brand transition-colors">API Playground</h3>
                      </div>
                      <p className="text-sm text-enostics-gray-400">Test endpoints interactively</p>
                    </Link>
                    <Link href="/dashboard" className="group p-6 bg-enostics-gray-900/30 border border-enostics-gray-700/50 rounded-xl hover:bg-enostics-gray-800/50 hover:border-enostics-gray-600/50 transition-all duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Settings className="h-5 w-5 text-enostics-amber" />
                        <h3 className="font-semibold text-white group-hover:text-enostics-amber transition-colors">Dashboard</h3>
                      </div>
                      <p className="text-sm text-enostics-gray-400">Manage your endpoints</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 