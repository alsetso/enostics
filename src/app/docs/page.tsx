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
    <main className="relative w-screen min-h-screen">
      {/* Background */}
      <BackgroundMedia 
        type={homepageConfig.background.type}
        path={homepageConfig.background.path}
        mobilePath={homepageConfig.background.mobilePath}
        opacity={0.3}
        className="absolute inset-0 w-full h-full object-cover"
        videoOptions={homepageConfig.background.video}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-enostics-gray-950/80" />

      {/* Floating UI Elements */}
      <div className="relative z-10 min-h-screen">
        {/* Floating Navigation */}
        <FloatingDocsNavbar onMenuToggle={toggleSidebar} />
        
        {/* Floating Sidebar */}
        <FloatingDocsSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <div className="pt-20 px-6 py-12">
          {/* Compact Hero Section */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-enostics-gray-900 border border-enostics-gray-700 rounded-xl">
                  <BookOpen className="h-8 w-8 text-brand" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  Documentation
                </h1>
              </div>
              <p className="text-lg text-enostics-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                Everything you need to build with Enostics — guides, examples, and API references.
              </p>

              {/* Compact Search Bar */}
              <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg text-white placeholder-enostics-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Search className="h-4 w-4 text-enostics-gray-400" />
                  </div>
                  {searchTerm && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="text-xs text-enostics-gray-500 bg-enostics-gray-800 px-2 py-1 rounded">
                        {filteredSections.length} results
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Stats - Compact */}
              <div className="flex items-center justify-center gap-8 text-sm text-enostics-gray-400">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-brand">{docSections.length}</div>
                  <span>sections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-enostics-green">5min</div>
                  <span>to first endpoint</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-enostics-purple" />
                  <span>Always up-to-date</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="flex items-center gap-4 mb-8">
              <Filter className="h-5 w-5 text-enostics-gray-400" />
              <span className="text-sm font-medium text-enostics-gray-400 uppercase tracking-wider">Filter by Category</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border
                    ${selectedCategory === category.id
                      ? 'bg-enostics-blue text-white border-enostics-blue'
                      : 'bg-enostics-gray-900 text-enostics-gray-400 border-enostics-gray-700 hover:bg-enostics-gray-800 hover:text-white hover:border-enostics-gray-600'
                    }
                  `}
                >
                  {category.icon}
                  {category.name}
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-transparent border-current"
                  >
                    {category.id === 'all' 
                      ? docSections.length 
                      : docSections.filter(s => s.category === category.id).length
                    }
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Documentation Sections Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections.map((section) => (
                <Link key={section.id} href={`/docs/section/${section.id}`}>
                  <Card className="h-full bg-enostics-gray-900 border-enostics-gray-700 hover:border-enostics-gray-600 hover:bg-enostics-gray-800 transition-all duration-200 cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-enostics-gray-800 border border-enostics-gray-600 rounded-lg">
                          {section.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 ${difficultyColors[section.difficulty]}`}
                          >
                            {section.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-white group-hover:text-enostics-blue transition-colors">
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-enostics-gray-400 leading-relaxed mb-6">
                        {section.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-enostics-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {section.estimatedTime}
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {section.tags.slice(0, 3).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="text-xs bg-enostics-gray-800 text-enostics-gray-400 border-enostics-gray-600"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {section.tags.length > 3 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-enostics-gray-800 text-enostics-gray-400 border-enostics-gray-600"
                          >
                            +{section.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredSections.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-enostics-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No sections found</h3>
                <p className="text-enostics-gray-400">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 