'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Filter, 
  Search, 
  X, 
  Tag, 
  Calendar,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react'
import { getAllDataTypes, getAllDataSources } from '@/lib/universal-classification'

interface FilterOptions {
  types: string[]
  sources: string[]
  tags: string[]
  dateRange: {
    start?: string
    end?: string
  }
  searchQuery: string
  confidenceMin: number
  qualityMin: number
}

interface FilterPanelProps {
  onFiltersChange: (filters: FilterOptions) => void
  availableTags?: string[]
  className?: string
}

export function FilterPanel({ onFiltersChange, availableTags = [], className = '' }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    sources: [],
    tags: [],
    dateRange: {},
    searchQuery: '',
    confidenceMin: 0,
    qualityMin: 0
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const dataTypes = getAllDataTypes()
  const dataSources = getAllDataSources()

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilters = (updates: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }

  const toggleType = (type: string) => {
    updateFilters({
      types: filters.types.includes(type)
        ? filters.types.filter(t => t !== type)
        : [...filters.types, type]
    })
  }

  const toggleSource = (source: string) => {
    updateFilters({
      sources: filters.sources.includes(source)
        ? filters.sources.filter(s => s !== source)
        : [...filters.sources, source]
    })
  }

  const toggleTag = (tag: string) => {
    updateFilters({
      tags: filters.tags.includes(tag)
        ? filters.tags.filter(t => t !== tag)
        : [...filters.tags, tag]
    })
  }

  const clearAllFilters = () => {
    setFilters({
      types: [],
      sources: [],
      tags: [],
      dateRange: {},
      searchQuery: '',
      confidenceMin: 0,
      qualityMin: 0
    })
    setSearchInput('')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ searchQuery: searchInput })
  }

  const activeFilterCount = 
    filters.types.length + 
    filters.sources.length + 
    filters.tags.length + 
    (filters.searchQuery ? 1 : 0) +
    (filters.confidenceMin > 0 ? 1 : 0) +
    (filters.qualityMin > 0 ? 1 : 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0)

  return (
    <Card variant="glass" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-enostics-gray-300">Search Content</label>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder="Search in payload content..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          {filters.searchQuery && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Searching: "{filters.searchQuery}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0"
                  onClick={() => {
                    updateFilters({ searchQuery: '' })
                    setSearchInput('')
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}
        </div>

        {/* Data Types */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-enostics-gray-300">Data Types</label>
          <div className="flex flex-wrap gap-2">
            {dataTypes.map((type) => (
              <Badge
                key={type.name}
                variant={filters.types.includes(type.name) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                style={filters.types.includes(type.name) ? {
                  backgroundColor: type.color + '40',
                  borderColor: type.color,
                  color: type.color
                } : {}}
                onClick={() => toggleType(type.name)}
              >
                {type.displayName}
                {filters.types.includes(type.name) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-enostics-gray-300">Data Sources</label>
          <div className="flex flex-wrap gap-2">
            {dataSources.map((source) => (
              <Badge
                key={source.name}
                variant={filters.sources.includes(source.name) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                style={filters.sources.includes(source.name) ? {
                  backgroundColor: source.color + '40',
                  borderColor: source.color,
                  color: source.color
                } : {}}
                onClick={() => toggleSource(source.name)}
              >
                {source.displayName}
                {filters.sources.includes(source.name) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-enostics-gray-300">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                  {filters.tags.includes(tag) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-enostics-gray-800">
            <h4 className="text-sm font-medium text-enostics-gray-300">Advanced Filters</h4>
            
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-enostics-gray-400">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => updateFilters({
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => updateFilters({
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Confidence Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-enostics-gray-400">
                Min Confidence: {filters.confidenceMin}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.confidenceMin}
                onChange={(e) => updateFilters({ confidenceMin: parseInt(e.target.value) })}
                className="w-full h-2 bg-enostics-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Quality Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-enostics-gray-400">
                Min Quality: {filters.qualityMin}/100
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.qualityMin}
                onChange={(e) => updateFilters({ qualityMin: parseInt(e.target.value) })}
                className="w-full h-2 bg-enostics-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="space-y-2 pt-4 border-t border-enostics-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-enostics-gray-300">Active Filters</span>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.types.map((type) => (
                <Badge key={`type-${type}`} variant="secondary" className="text-xs">
                  Type: {type}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-3 w-3 p-0"
                    onClick={() => toggleType(type)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.sources.map((source) => (
                <Badge key={`source-${source}`} variant="secondary" className="text-xs">
                  Source: {source}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-3 w-3 p-0"
                    onClick={() => toggleSource(source)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.tags.map((tag) => (
                <Badge key={`tag-${tag}`} variant="secondary" className="text-xs">
                  Tag: {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-3 w-3 p-0"
                    onClick={() => toggleTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 