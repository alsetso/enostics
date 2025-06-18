'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAllSections, DocSection } from '@/app/docs/content/sections'
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  BookOpen,
  Rocket,
  Sparkles,
  Users,
  Code,
  Zap,
  TrendingUp,
  ExternalLink,
  ArrowUpRight,
  Clock,
  Star
} from 'lucide-react'

interface FloatingDocsSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentSectionId?: string
}

const categoryOrder = ['getting-started', 'concepts', 'guides', 'reference', 'examples', 'advanced'] as const

const categoryConfig = {
  'getting-started': {
    label: 'Getting Started',
    icon: <Rocket className="w-4 h-4" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  'concepts': {
    label: 'Core Concepts', 
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-brand',
    bgColor: 'bg-brand/10',
    borderColor: 'border-brand/20'
  },
  'guides': {
    label: 'User Guides',
    icon: <Users className="w-4 h-4" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  'reference': {
    label: 'API Reference',
    icon: <Code className="w-4 h-4" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  'examples': {
    label: 'Examples & Use Cases',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  'advanced': {
    label: 'Advanced Topics',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  }
}

const difficultyConfig = {
  beginner: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  intermediate: { color: 'text-brand', bg: 'bg-brand/10' },
  advanced: { color: 'text-red-400', bg: 'bg-red-500/10' }
}

export function FloatingDocsSidebar({ isOpen = true, onClose, currentSectionId }: FloatingDocsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['getting-started', 'concepts']))
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSections, setFilteredSections] = useState<DocSection[]>([])
  const pathname = usePathname()
  const allSections = getAllSections()
  
  // Extract current section from pathname or use provided currentSectionId
  const currentSection = currentSectionId || (pathname?.includes('/docs/section/') 
    ? pathname.split('/docs/section/')[1] 
    : null)

  // Auto-expand the category containing the current section
  useEffect(() => {
    if (currentSection) {
      const section = allSections.find(s => s.id === currentSection)
      if (section) {
        setExpandedCategories(prev => new Set([...Array.from(prev), section.category]))
      }
    }
  }, [currentSection, allSections])

  useEffect(() => {
    if (searchTerm) {
      const filtered = allSections.filter(section =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredSections(filtered)
    } else {
      setFilteredSections([])
    }
  }, [searchTerm, allSections])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const groupedSections = categoryOrder.reduce((acc, category) => {
    acc[category] = allSections.filter(section => section.category === category)
    return acc
  }, {} as Record<string, DocSection[]>)

  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Always visible on desktop, full height */}
      <aside className={`
        fixed top-0 left-0 h-screen w-80 z-50 transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-enostics-gray-950/98 backdrop-blur-xl border-r border-enostics-gray-800/50
        flex flex-col overflow-hidden
      `}>
        
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-enostics-gray-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand/10 border border-brand/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Documentation</h2>
              <p className="text-xs text-enostics-gray-400">Build with Enostics</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-enostics-gray-500" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-enostics-gray-900/50 border border-enostics-gray-700/50 rounded-lg text-sm text-white placeholder-enostics-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
            />
            {searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-enostics-gray-500 bg-enostics-gray-800/50 px-2 py-1 rounded">
                  {filteredSections.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-track-enostics-gray-900 scrollbar-thumb-enostics-gray-700 hover:scrollbar-thumb-enostics-gray-600">
          {searchTerm ? (
            // Search Results
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-medium text-enostics-gray-400 uppercase tracking-wider">
                Search Results ({filteredSections.length})
              </div>
              {filteredSections.map((section) => {
                const config = categoryConfig[section.category]
                const isActive = currentSection === section.id
                return (
                  <Link
                    key={section.id}
                    href={`/docs/section/${section.id}`}
                    onClick={handleLinkClick}
                    className={`
                      group flex items-start gap-3 p-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-brand/15 border border-brand/30 text-white shadow-lg shadow-brand/10' 
                        : 'text-enostics-gray-300 hover:text-white hover:bg-enostics-gray-800/50'
                      }
                    `}
                  >
                    <div className={`flex-shrink-0 p-1.5 rounded-md ${config.bgColor} ${config.borderColor} border`}>
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight">{section.title}</div>
                      <div className="text-xs text-enostics-gray-500 mt-1 flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-full ${difficultyConfig[section.difficulty].bg} ${difficultyConfig[section.difficulty].color}`}>
                          {section.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {section.estimatedTime}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0 animate-pulse"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          ) : (
            // Category Navigation
            <div className="space-y-1">
              {categoryOrder.map((category) => {
                const sections = groupedSections[category]
                const isExpanded = expandedCategories.has(category)
                const config = categoryConfig[category]
                const hasCurrentSection = sections.some(s => s.id === currentSection)
                
                return (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`
                        w-full flex items-center justify-between p-3 text-left rounded-lg transition-all duration-200 group
                        ${hasCurrentSection 
                          ? 'bg-enostics-gray-800/50 text-white' 
                          : 'text-enostics-gray-300 hover:text-white hover:bg-enostics-gray-800/30'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${config.bgColor} ${config.borderColor} border`}>
                          {config.icon}
                        </div>
                        <div>
                          <span className="font-medium text-sm">{config.label}</span>
                          <div className="text-xs text-enostics-gray-500 mt-0.5">
                            {sections.length} section{sections.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasCurrentSection && (
                          <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse"></div>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-enostics-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-enostics-gray-500" />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-enostics-gray-800/50 pl-4">
                        {sections.map((section) => {
                          const isActive = currentSection === section.id
                          return (
                            <Link
                              key={section.id}
                              href={`/docs/section/${section.id}`}
                              onClick={handleLinkClick}
                              className={`
                                group flex items-start gap-3 p-2.5 rounded-lg transition-all duration-200 relative
                                ${isActive
                                  ? 'bg-brand/15 border border-brand/30 text-white shadow-lg shadow-brand/10' 
                                  : 'text-enostics-gray-400 hover:text-white hover:bg-enostics-gray-800/30'
                                }
                              `}
                            >
                              {/* Active indicator line */}
                              {isActive && (
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-8 bg-brand rounded-full"></div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm leading-tight flex items-center gap-2">
                                  {section.title}
                                  {isActive && (
                                    <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0 animate-pulse"></div>
                                  )}
                                </div>
                                <div className="text-xs text-enostics-gray-500 mt-1 flex items-center gap-2">
                                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${difficultyConfig[section.difficulty].bg} ${difficultyConfig[section.difficulty].color}`}>
                                    {section.difficulty}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {section.estimatedTime}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-enostics-gray-800/50 bg-enostics-gray-950/50">
          <div className="flex items-center justify-between text-xs text-enostics-gray-500">
            <span>{allSections.length} total sections</span>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              <span>Always up-to-date</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
} 