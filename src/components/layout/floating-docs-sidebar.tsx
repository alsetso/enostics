'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getAllSections, DocSection } from '@/app/docs/content/sections'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface FloatingDocsSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentSectionId?: string
}

const categoryOrder = ['getting-started', 'concepts', 'guides', 'reference', 'examples', 'advanced'] as const
const categoryLabels = {
  'getting-started': 'Getting Started',
  'concepts': 'Core Concepts', 
  'guides': 'User Guides',
  'reference': 'API Reference',
  'examples': 'Examples & Use Cases',
  'advanced': 'Advanced Topics'
}

export function FloatingDocsSidebar({ isOpen, onClose, currentSectionId }: FloatingDocsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['getting-started']))
  const allSections = getAllSections()
  
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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-enostics-gray-950 border-r border-enostics-gray-800
      `}>
        <div className="p-6 pt-20 h-full overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Documentation</h2>
            <p className="text-sm text-enostics-gray-400">
              Everything you need to build with Enostics
            </p>
          </div>

          <nav className="space-y-2">
            {categoryOrder.map((category) => {
              const sections = groupedSections[category]
              const isExpanded = expandedCategories.has(category)
              
              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between py-3 px-3 text-left text-white/80 hover:text-white hover:bg-enostics-gray-900 rounded-lg transition-all duration-200"
                  >
                    <span className="font-medium text-sm">
                      {categoryLabels[category]}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-3 border-l border-enostics-gray-800 pl-3 space-y-1">
                      {sections.map((section) => (
                        <Link
                          key={section.id}
                          href={`/docs/section/${section.id}`}
                          onClick={onClose}
                          className={`
                            block py-2 px-3 text-sm rounded-lg transition-all duration-200
                            ${currentSectionId === section.id 
                              ? 'text-brand bg-enostics-gray-800 border-l-2 border-brand' 
                              : 'text-enostics-gray-400 hover:text-white hover:bg-enostics-gray-900'
                            }
                          `}
                        >
                          <div className="font-medium">{section.title}</div>
                          <div className="text-xs text-enostics-gray-500 mt-1">
                            {section.estimatedTime} • {section.difficulty}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
} 