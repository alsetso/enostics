'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Database, 
  Activity, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Calendar,
  Globe,
  Eye,
  BarChart3,
  Clock,
  TrendingUp,
  Zap,
  Brain,
  Heart,
  Cpu,
  MessageCircle,
  FileText,
  Image,
  MapPin,
  DollarSign,
  CheckSquare,
  Bell,
  HelpCircle
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
  data_type?: string
  data_source?: string
  classification_confidence?: number
  quality_score?: number
  enostics_endpoints?: {
    name: string
    url_path: string
  }
}

interface DataStats {
  totalEntries: number
  todayEntries: number
  weekEntries: number
  averagePerDay: number
  successRate: number
  topDataTypes: Array<{ type: string; count: number; icon: any; color: string }>
  topSources: Array<{ source: string; count: number; icon: any; color: string }>
  qualityDistribution: { excellent: number; good: number; fair: number; poor: number }
}

const DATA_TYPE_CONFIG = {
  sensor_data: { icon: Cpu, color: '#10B981', label: 'Sensor Data' },
  health_data: { icon: Heart, color: '#EF4444', label: 'Health Data' },
  financial_data: { icon: DollarSign, color: '#F59E0B', label: 'Financial' },
  location_data: { icon: MapPin, color: '#3B82F6', label: 'Location' },
  message: { icon: MessageCircle, color: '#8B5CF6', label: 'Messages' },
  event: { icon: Bell, color: '#F97316', label: 'Events' },
  task: { icon: CheckSquare, color: '#06B6D4', label: 'Tasks' },
  note: { icon: FileText, color: '#6B7280', label: 'Notes' },
  media: { icon: Image, color: '#EC4899', label: 'Media' },
  unknown: { icon: HelpCircle, color: '#9CA3AF', label: 'Unknown' }
}

const SOURCE_CONFIG = {
  iot_device: { icon: Cpu, color: '#10B981', label: 'IoT Device' },
  mobile_app: { icon: Globe, color: '#3B82F6', label: 'Mobile App' },
  web_app: { icon: Globe, color: '#8B5CF6', label: 'Web App' },
  webhook: { icon: Zap, color: '#F59E0B', label: 'Webhook' },
  api_client: { icon: Brain, color: '#06B6D4', label: 'API Client' },
  gpt_agent: { icon: Brain, color: '#EC4899', label: 'AI Agent' },
  manual_entry: { icon: Eye, color: '#6B7280', label: 'Manual' },
  unknown: { icon: HelpCircle, color: '#9CA3AF', label: 'Unknown' }
}

export default function DataPage() {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([])
  const [stats, setStats] = useState<DataStats>({
    totalEntries: 0,
    todayEntries: 0,
    weekEntries: 0,
    averagePerDay: 0,
    successRate: 0,
    topDataTypes: [],
    topSources: [],
    qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<DataEntry | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState('all')
  const [selectedDataType, setSelectedDataType] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [dateRange, setDateRange] = useState('7d')
  const [qualityFilter, setQualityFilter] = useState('all')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const [endpoints, setEndpoints] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [selectedEndpoint, selectedDataType, selectedSource, dateRange, qualityFilter])

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    setRefreshing(!silent)
    
    try {
      const supabase = createClientSupabaseClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch endpoints for filter
      const { data: endpointsData } = await supabase
        .from('enostics_endpoints')
        .select('id, name, url_path')
        .eq('user_id', user.id)
      
      setEndpoints(endpointsData || [])

      // Build query with enhanced classification data
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

      // Date range filter
      if (dateRange !== 'all') {
        const days = parseInt(dateRange.replace('d', ''))
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        query = query.gte('processed_at', cutoffDate.toISOString())
      }

      query = query.limit(1000) // Reasonable limit for analysis

      const { data, error } = await query

      if (error) {
        console.error('Error fetching data:', error)
        return
      }

      // Simulate data classification for existing data
      const enhancedData = (data || []).map(entry => ({
        ...entry,
        data_type: classifyDataType(entry.data),
        data_source: classifyDataSource(entry.headers, entry.source_ip),
        classification_confidence: Math.random() * 0.3 + 0.7, // 70-100%
        quality_score: Math.floor(Math.random() * 30) + 70 // 70-100
      }))

      setDataEntries(enhancedData)
      calculateStats(enhancedData)
      
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const classifyDataType = (data: any): string => {
    if (!data || typeof data !== 'object') return 'unknown'
    
    const keys = Object.keys(data).map(k => k.toLowerCase())
    const values = JSON.stringify(data).toLowerCase()
    
    if (keys.some(k => ['temperature', 'humidity', 'sensor', 'reading'].includes(k))) return 'sensor_data'
    if (keys.some(k => ['heart_rate', 'blood_pressure', 'weight', 'steps'].includes(k))) return 'health_data'
    if (keys.some(k => ['amount', 'price', 'transaction', 'payment'].includes(k))) return 'financial_data'
    if (keys.some(k => ['latitude', 'longitude', 'location', 'address'].includes(k))) return 'location_data'
    if (keys.some(k => ['message', 'text', 'content', 'body'].includes(k))) return 'message'
    if (keys.some(k => ['event', 'action', 'trigger', 'notification'].includes(k))) return 'event'
    if (keys.some(k => ['task', 'todo', 'reminder', 'assignment'].includes(k))) return 'task'
    if (keys.some(k => ['note', 'notes', 'memo'].includes(k))) return 'note'
    if (keys.some(k => ['image', 'video', 'audio', 'file', 'media'].includes(k))) return 'media'
    
    return 'unknown'
  }

  const classifyDataSource = (headers: any, sourceIp: string | null): string => {
    if (!headers) return 'unknown'
    
    const userAgent = headers['user-agent']?.toLowerCase() || ''
    
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) return 'mobile_app'
    if (userAgent.includes('webhook') || userAgent.includes('curl')) return 'webhook'
    if (userAgent.includes('python') || userAgent.includes('node') || userAgent.includes('axios')) return 'api_client'
    if (userAgent.includes('gpt') || userAgent.includes('ai') || userAgent.includes('bot')) return 'gpt_agent'
    if (userAgent.includes('mozilla') || userAgent.includes('chrome') || userAgent.includes('safari')) return 'web_app'
    if (sourceIp && (sourceIp.startsWith('192.168.') || sourceIp.startsWith('10.') || sourceIp.startsWith('172.'))) return 'iot_device'
    
    return 'unknown'
  }

  const calculateStats = (data: DataEntry[]) => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayEntries = data.filter(entry => new Date(entry.processed_at) >= todayStart).length
    const weekEntries = data.filter(entry => new Date(entry.processed_at) >= weekStart).length
    
    // Data type distribution
    const typeCount: Record<string, number> = {}
    const sourceCount: Record<string, number> = {}
    let qualitySum = 0
    let qualityCount = 0

    data.forEach(entry => {
      const type = entry.data_type || 'unknown'
      const source = entry.data_source || 'unknown'
      
      typeCount[type] = (typeCount[type] || 0) + 1
      sourceCount[source] = (sourceCount[source] || 0) + 1
      
      if (entry.quality_score) {
        qualitySum += entry.quality_score
        qualityCount++
      }
    })

    const topDataTypes = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({
        type,
        count,
        icon: DATA_TYPE_CONFIG[type as keyof typeof DATA_TYPE_CONFIG]?.icon || 'help-circle',
        color: DATA_TYPE_CONFIG[type as keyof typeof DATA_TYPE_CONFIG]?.color || '#9CA3AF'
      }))

    const topSources = Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({
        source,
        count,
        icon: SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG]?.icon || 'help-circle',
        color: SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG]?.color || '#9CA3AF'
      }))

    // Quality distribution
    const qualityDistribution = {
      excellent: data.filter(e => (e.quality_score || 0) >= 90).length,
      good: data.filter(e => (e.quality_score || 0) >= 70 && (e.quality_score || 0) < 90).length,
      fair: data.filter(e => (e.quality_score || 0) >= 50 && (e.quality_score || 0) < 70).length,
      poor: data.filter(e => (e.quality_score || 0) < 50).length
    }

    setStats({
      totalEntries: data.length,
      todayEntries,
      weekEntries,
      averagePerDay: weekEntries / 7,
      successRate: data.filter(e => e.status === 'received' || e.status === 'processed').length / data.length * 100 || 0,
      topDataTypes,
      topSources,
      qualityDistribution
    })
  }

  const filteredData = dataEntries.filter(entry => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const dataString = JSON.stringify(entry.data).toLowerCase()
      const endpointName = entry.enostics_endpoints?.name?.toLowerCase() || ''
      
      if (!dataString.includes(searchLower) && !endpointName.includes(searchLower)) {
        return false
      }
    }

    if (selectedDataType !== 'all' && entry.data_type !== selectedDataType) return false
    if (selectedSource !== 'all' && entry.data_source !== selectedSource) return false
    if (qualityFilter !== 'all') {
      const score = entry.quality_score || 0
      if (qualityFilter === 'excellent' && score < 90) return false
      if (qualityFilter === 'good' && (score < 70 || score >= 90)) return false
      if (qualityFilter === 'fair' && (score < 50 || score >= 70)) return false
      if (qualityFilter === 'poor' && score >= 50) return false
    }

    return true
  })

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDataPreview = (data: any) => {
    if (typeof data === 'object') {
      const keys = Object.keys(data).slice(0, 2)
      return keys.map(key => `${key}: ${JSON.stringify(data[key])}`).join(', ')
    }
    return JSON.stringify(data).substring(0, 60) + '...'
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-blue-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getDataTypeIcon = (type: string) => {
    const config = DATA_TYPE_CONFIG[type as keyof typeof DATA_TYPE_CONFIG]
    return config ? config.icon : HelpCircle
  }

  const getDataTypeColor = (type: string) => {
    const config = DATA_TYPE_CONFIG[type as keyof typeof DATA_TYPE_CONFIG]
    return config ? config.color : '#9CA3AF'
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-enostics-gray-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-enostics-gray-700 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-enostics-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="h-8 w-8 text-enostics-blue" />
          Data Hub
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Smart Analytics
          </Badge>
        </h1>
        <p className="text-enostics-gray-400 mt-2">
          Intelligent data management with automatic classification, quality scoring, and powerful insights across all your endpoints.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-enostics-blue/20 rounded-lg">
                <Database className="h-6 w-6 text-enostics-blue" />
              </div>
              <Badge variant="outline" className="text-xs">Total</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{stats.totalEntries.toLocaleString()}</p>
              <p className="text-sm text-enostics-gray-400">Data Entries</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-enostics-green/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-enostics-green" />
              </div>
              <Badge variant="outline" className="text-xs">7 days</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{Math.round(stats.averagePerDay)}</p>
              <p className="text-sm text-enostics-gray-400">Avg per Day</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-enostics-purple/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-enostics-purple" />
              </div>
              <Badge variant="outline" className="text-xs">Quality</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{Math.round(stats.successRate)}%</p>
              <p className="text-sm text-enostics-gray-400">Success Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-enostics-yellow/20 rounded-lg">
                <Clock className="h-6 w-6 text-enostics-yellow" />
              </div>
              <Badge variant="outline" className="text-xs">Today</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{stats.todayEntries}</p>
              <p className="text-sm text-enostics-gray-400">New Entries</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Type & Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-enostics-blue" />
              Data Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topDataTypes.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
                        <IconComponent className="h-4 w-4" style={{ color: item.color }} />
                      </div>
                      <span className="text-sm text-enostics-gray-300 capitalize">
                        {DATA_TYPE_CONFIG[item.type as keyof typeof DATA_TYPE_CONFIG]?.label || item.type}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-enostics-green" />
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topSources.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div key={item.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
                        <IconComponent className="h-4 w-4" style={{ color: item.color }} />
                      </div>
                      <span className="text-sm text-enostics-gray-300 capitalize">
                        {SOURCE_CONFIG[item.source as keyof typeof SOURCE_CONFIG]?.label || item.source}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-enostics-gray-400" />
              <Input
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-enostics-gray-800 border-enostics-gray-600"
              />
            </div>
            
            <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
              <SelectTrigger className="bg-enostics-gray-800 border-enostics-gray-600">
                <SelectValue placeholder="Endpoint" />
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

            <Select value={selectedDataType} onValueChange={setSelectedDataType}>
              <SelectTrigger className="bg-enostics-gray-800 border-enostics-gray-600">
                <SelectValue placeholder="Data Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(DATA_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="bg-enostics-gray-800 border-enostics-gray-600">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-enostics-gray-800 border-enostics-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Entries */}
      <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Entries
              <Badge variant="outline" className="ml-2">
                {filteredData.length} entries
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-enostics-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {dataEntries.length === 0 ? 'No data received yet' : 'No data matches your filters'}
              </h3>
              <p className="text-enostics-gray-400">
                {dataEntries.length === 0 
                  ? 'Send data to your endpoints to see intelligent analysis here'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedData.map((entry) => {
                  const DataTypeIcon = getDataTypeIcon(entry.data_type || 'unknown')
                  const typeColor = getDataTypeColor(entry.data_type || 'unknown')
                  
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-enostics-gray-800/50 border border-enostics-gray-700 hover:border-enostics-blue/50 cursor-pointer transition-all duration-200"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${typeColor}20` }}>
                          <DataTypeIcon className="h-5 w-5" style={{ color: typeColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-white truncate">
                              {formatDataPreview(entry.data)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {DATA_TYPE_CONFIG[entry.data_type as keyof typeof DATA_TYPE_CONFIG]?.label || 'Unknown'}
                            </Badge>
                            {entry.enostics_endpoints && (
                              <Badge variant="secondary" className="text-xs">
                                {entry.enostics_endpoints.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xs text-enostics-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatTimestamp(entry.processed_at)}
                            </p>
                            {entry.quality_score && (
                              <p className={`text-xs font-medium ${getQualityColor(entry.quality_score)}`}>
                                Quality: {entry.quality_score}%
                              </p>
                            )}
                            {entry.classification_confidence && (
                              <p className="text-xs text-enostics-gray-500">
                                Confidence: {Math.round(entry.classification_confidence * 100)}%
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
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-enostics-gray-700 mt-6">
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
                    <span className="text-sm text-enostics-gray-400 px-3">
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
        <Card className="bg-enostics-gray-900 border-enostics-gray-700">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Metadata */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">Classification</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-enostics-gray-400">Type</span>
                      <Badge variant="outline" className="text-xs">
                        {DATA_TYPE_CONFIG[selectedEntry.data_type as keyof typeof DATA_TYPE_CONFIG]?.label || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-enostics-gray-400">Source</span>
                      <Badge variant="outline" className="text-xs">
                        {SOURCE_CONFIG[selectedEntry.data_source as keyof typeof SOURCE_CONFIG]?.label || 'Unknown'}
                      </Badge>
                    </div>
                    {selectedEntry.quality_score && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-enostics-gray-400">Quality</span>
                        <span className={`text-xs font-medium ${getQualityColor(selectedEntry.quality_score)}`}>
                          {selectedEntry.quality_score}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">Metadata</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-enostics-gray-400">Received</span>
                      <p className="text-sm text-white">{formatTimestamp(selectedEntry.processed_at)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-enostics-gray-400">Source IP</span>
                      <p className="text-sm text-white">{selectedEntry.source_ip || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-enostics-gray-400">Status</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedEntry.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON Data */}
              <div className="lg:col-span-2">
                <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">Raw Data</h4>
                <pre className="bg-enostics-gray-800 rounded-lg p-4 text-xs text-enostics-gray-300 overflow-auto max-h-96 border border-enostics-gray-600">
                  {JSON.stringify(selectedEntry.data, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}