'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { JsonEditor } from './json-editor'
import { 
  Database, 
  Calendar, 
  Globe, 
  Eye, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  BarChart3,
  Clock,
  Activity,
  TrendingUp
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface DataEntry {
  id: string
  endpoint_id: string
  data: any
  source_ip: string | null
  headers: any
  processed_at: string
  status: string
  enostics_endpoints?: {
    name: string
    url_path: string
  }
}

interface Endpoint {
  id: string
  name: string
  url_path: string
  is_active: boolean
}

interface DataStats {
  totalEntries: number
  todayEntries: number
  uniqueEndpoints: number
  averagePerDay: number
  successRate: number
  topEndpoints: Array<{ name: string; count: number }>
}

export function EnhancedDataDisplay() {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([])
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [stats, setStats] = useState<DataStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<DataEntry | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7d')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    fetchEndpoints()
    fetchData()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchData(true) // Silent refresh
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [selectedEndpoint, dateRange, statusFilter])

  const fetchEndpoints = async () => {
    try {
      const response = await fetch('/api/endpoints')
      const result = await response.json()
      
      if (response.ok) {
        setEndpoints(result.endpoints || [])
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error)
    }
  }

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    setRefreshing(!silent)
    
    try {
      const supabase = createClientSupabaseClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Build query
      let query = supabase
        .from('enostics_data')
        .select(`
          *,
          enostics_endpoints!inner(
            name,
            url_path,
            user_id
          )
        `)
        .eq('enostics_endpoints.user_id', user.id)
        .order('processed_at', { ascending: false })

      // Apply filters
      if (selectedEndpoint !== 'all') {
        query = query.eq('endpoint_id', selectedEndpoint)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Date range filter
      if (dateRange !== 'all') {
        const days = parseInt(dateRange.replace('d', ''))
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        query = query.gte('processed_at', cutoffDate.toISOString())
      }

      query = query.limit(200) // Reasonable limit

      const { data, error } = await query

      if (error) {
        console.error('Error fetching data:', error)
        return
      }

      setDataEntries(data || [])
      calculateStats(data || [])
      
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateStats = (data: DataEntry[]) => {
    if (!data.length) {
      setStats({
        totalEntries: 0,
        todayEntries: 0,
        uniqueEndpoints: 0,
        averagePerDay: 0,
        successRate: 0,
        topEndpoints: []
      })
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayEntries = data.filter(entry => 
      new Date(entry.processed_at) >= today
    ).length

    const uniqueEndpoints = new Set(data.map(entry => entry.endpoint_id)).size
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentEntries = data.filter(entry => 
      new Date(entry.processed_at) >= sevenDaysAgo
    )
    const averagePerDay = recentEntries.length / 7

    const successfulEntries = data.filter(entry => entry.status === 'received').length
    const successRate = (successfulEntries / data.length) * 100

    // Top endpoints
    const endpointCounts = data.reduce((acc, entry) => {
      const name = entry.enostics_endpoints?.name || 'Unknown'
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topEndpoints = Object.entries(endpointCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    setStats({
      totalEntries: data.length,
      todayEntries,
      uniqueEndpoints,
      averagePerDay: Math.round(averagePerDay * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      topEndpoints
    })
  }

  const filteredData = dataEntries.filter(entry => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const dataString = JSON.stringify(entry.data).toLowerCase()
      const endpointName = entry.enostics_endpoints?.name?.toLowerCase() || ''
      
      return dataString.includes(searchLower) || 
             endpointName.includes(searchLower) ||
             entry.source_ip?.includes(searchLower)
    }
    return true
  })

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const exportData = useCallback(async (format: 'json' | 'csv') => {
    const exportedData = filteredData.map(entry => ({
      timestamp: entry.processed_at,
      endpoint: entry.enostics_endpoints?.name || 'Unknown',
      endpoint_path: entry.enostics_endpoints?.url_path || '',
      status: entry.status,
      source_ip: entry.source_ip,
      data: entry.data
    }))

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportedData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enostics-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // CSV export
      const headers = ['timestamp', 'endpoint', 'endpoint_path', 'status', 'source_ip', 'data']
      const csvContent = [
        headers.join(','),
        ...exportedData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row]
            return typeof value === 'object' ? `"${JSON.stringify(value).replace(/"/g, '""')}"` : `"${value || ''}"`
          }).join(',')
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enostics-data-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [filteredData])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDataPreview = (data: any) => {
    if (typeof data === 'object') {
      const keys = Object.keys(data).slice(0, 3)
      return keys.map(key => `${key}: ${JSON.stringify(data[key])}`).join(', ')
    }
    return JSON.stringify(data).substring(0, 100) + '...'
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Card variant="integrated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Data Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-enostics-gray-800/50 rounded-lg" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Dashboard */}
      {stats && (
        <Card variant="integrated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Data Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-enostics-blue/10 rounded-lg border border-enostics-blue/20">
                    <Database className="h-4 w-4 text-enostics-blue" />
                  </div>
                  <span className="text-sm text-enostics-gray-400">Total Entries</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalEntries}</div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-enostics-green/10 rounded-lg border border-enostics-green/20">
                    <Clock className="h-4 w-4 text-enostics-green" />
                  </div>
                  <span className="text-sm text-enostics-gray-400">Today</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.todayEntries}</div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-enostics-purple/10 rounded-lg border border-enostics-purple/20">
                    <Activity className="h-4 w-4 text-enostics-purple" />
                  </div>
                  <span className="text-sm text-enostics-gray-400">Avg/Day</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.averagePerDay}</div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-enostics-yellow/10 rounded-lg border border-enostics-yellow/20">
                    <TrendingUp className="h-4 w-4 text-enostics-yellow" />
                  </div>
                  <span className="text-sm text-enostics-gray-400">Success Rate</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
              </div>
            </div>
            
            {stats.topEndpoints.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Top Endpoints</h4>
                <div className="space-y-2">
                  {stats.topEndpoints.map((endpoint, index) => (
                    <div key={endpoint.name} className="flex items-center justify-between text-sm">
                      <span className="text-enostics-gray-300">{endpoint.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {endpoint.count} requests
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card variant="integrated">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Incoming Data
              <Badge variant="outline" className="ml-2">
                {filteredData.length} entries
              </Badge>
              {refreshing && (
                <RefreshCw className="h-4 w-4 animate-spin text-enostics-green ml-2" />
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData()}
                disabled={refreshing}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('json')}
              >
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('csv')}
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-enostics-gray-400" />
              <Input
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
              <SelectTrigger>
                <SelectValue placeholder="All endpoints" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Endpoints</SelectItem>
                {endpoints.map((endpoint) => (
                  <SelectItem key={endpoint.id} value={endpoint.id}>
                    {endpoint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Entries */}
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-enostics-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {dataEntries.length === 0 ? 'No data received yet' : 'No data matches your filters'}
              </h3>
              <p className="text-enostics-gray-400 mb-4">
                {dataEntries.length === 0 
                  ? 'Send data to your endpoints to see it here'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedData.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-enostics-gray-900/50 border border-enostics-gray-800 hover:border-enostics-blue/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-enostics-green/20">
                        <Globe className="h-5 w-5 text-enostics-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white truncate">
                            {formatDataPreview(entry.data)}
                          </p>
                          {entry.enostics_endpoints && (
                            <Badge variant="outline" className="text-xs">
                              {entry.enostics_endpoints.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xs text-enostics-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatTimestamp(entry.processed_at)}
                          </p>
                          {entry.source_ip && (
                            <p className="text-xs text-enostics-gray-400">
                              from {entry.source_ip}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={entry.status === 'received' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {entry.status}
                      </Badge>
                      <Eye className="h-4 w-4 text-enostics-gray-400" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-enostics-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-enostics-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Data Detail Modal */}
      {selectedEntry && (
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Data Details
              {selectedEntry.enostics_endpoints && (
                <Badge variant="outline" className="ml-2">
                  {selectedEntry.enostics_endpoints.name}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEntry(null)}
              className="text-enostics-gray-400 hover:text-white"
            >
              ×
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">JSON Data</h4>
                <JsonEditor
                  value={JSON.stringify(selectedEntry.data, null, 2)}
                  onChange={() => {}} // Read-only
                  readOnly
                  height="300px"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-enostics-gray-300 mb-1">Received</h4>
                  <p className="text-sm text-white">{formatTimestamp(selectedEntry.processed_at)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-enostics-gray-300 mb-1">Source IP</h4>
                  <p className="text-sm text-white">{selectedEntry.source_ip || 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-enostics-gray-300 mb-1">Status</h4>
                  <Badge variant={selectedEntry.status === 'received' ? 'default' : 'outline'}>
                    {selectedEntry.status}
                  </Badge>
                </div>
              </div>

              {selectedEntry.headers && Object.keys(selectedEntry.headers).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">Request Headers</h4>
                  <div className="bg-enostics-gray-900 rounded-lg p-4 max-h-32 overflow-auto">
                    <pre className="text-xs text-enostics-gray-300">
                      {JSON.stringify(selectedEntry.headers, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 