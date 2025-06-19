'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Brain, 
  Clock, 
  MapPin, 
  Hash, 
  AlertTriangle,
  CheckCircle,
  Edit3,
  Save,
  X,
  Smartphone,
  Globe,
  Cpu,
  Heart,
  DollarSign,
  ShoppingCart,
  Database,
  TrendingUp,
  GitBranch,
  Download,
  FileText,
  Share2,
  Zap,
  Target,
  BarChart3,
  Activity,
  Link2,
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface EnhancedDataRecord {
  id: string
  data: any
  processed_at: string
  source_ip?: string
  user_agent?: string
  content_type?: string
  data_size: number
  enriched_data?: any
  sender_info?: any
  data_quality_score?: number
  business_context?: string
  key_fields?: string[]
  sensitive_data?: boolean
  user_notes?: string
  user_category?: string
  auto_tags?: string[]
}

interface RelatedRecord {
  id: string
  processed_at: string
  data_quality_score?: number
  business_context?: string
  similarity_score: number
}

interface TrendData {
  date: string
  count: number
  avg_quality: number
  business_contexts: string[]
}

interface SmartAction {
  id: string
  title: string
  description: string
  action_type: 'export' | 'integrate' | 'analyze' | 'notify'
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
}

interface EnhancedDataModalProps {
  isOpen: boolean
  onClose: () => void
  record: EnhancedDataRecord | null
  onUpdate?: (updates: Partial<EnhancedDataRecord>) => void
}

export default function EnhancedDataModal({ 
  isOpen, 
  onClose, 
  record,
  onUpdate 
}: EnhancedDataModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [userNotes, setUserNotes] = useState('')
  const [userCategory, setUserCategory] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // New state for enhanced features
  const [relatedRecords, setRelatedRecords] = useState<RelatedRecord[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [smartActions, setSmartActions] = useState<SmartAction[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (record) {
      setUserNotes(record.user_notes || '')
      setUserCategory(record.user_category || '')
      fetchRelatedRecords()
      fetchTrendData()
      generateSmartActions()
    }
  }, [record])

  // Fetch related records using the new API endpoint
  const fetchRelatedRecords = async () => {
    if (!record) return
    setLoadingRelated(true)
    
    try {
      const response = await fetch(`/api/analytics/relationships?record_id=${record.id}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setRelatedRecords(data.related_records || [])
      }
    } catch (error) {
      console.error('Error fetching related records:', error)
    } finally {
      setLoadingRelated(false)
    }
  }

  // Fetch trend data using the new API endpoint
  const fetchTrendData = async () => {
    if (!record) return
    setLoadingTrends(true)
    
    try {
      const params = new URLSearchParams({
        days: '30',
        ...(record.business_context && { business_context: record.business_context }),
        ...(record.sender_info?.explicit_name && { sender_name: record.sender_info.explicit_name })
      })
      
      const response = await fetch(`/api/analytics/trends?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTrendData(data.trends || [])
      }
    } catch (error) {
      console.error('Error fetching trend data:', error)
    } finally {
      setLoadingTrends(false)
    }
  }

  // Generate smart actions based on record content and context
  const generateSmartActions = () => {
    if (!record) return

    const actions: SmartAction[] = []

    // Export actions
    actions.push({
      id: 'export-pdf',
      title: 'Export Analysis Report',
      description: 'Generate a comprehensive PDF report of this data analysis',
      action_type: 'export',
      icon: <FileText className="w-4 h-4" />,
      priority: 'high'
    })

    // Integration actions based on business context
    if (record.business_context === 'healthcare') {
      actions.push({
        id: 'health-integration',
        title: 'Connect to Health App',
        description: 'Integrate this health data with your preferred health tracking app',
        action_type: 'integrate',
        icon: <Heart className="w-4 h-4" />,
        priority: 'high'
      })
    }

    if (record.business_context === 'iot') {
      actions.push({
        id: 'iot-dashboard',
        title: 'Add to IoT Dashboard',
        description: 'Monitor this device data in your IoT dashboard',
        action_type: 'analyze',
        icon: <Cpu className="w-4 h-4" />,
        priority: 'medium'
      })
    }

    // Quality-based actions
    if ((record.data_quality_score || 0) < 60) {
      actions.push({
        id: 'quality-alert',
        title: 'Set Quality Alert',
        description: 'Get notified when data quality improves from this source',
        action_type: 'notify',
        icon: <AlertTriangle className="w-4 h-4" />,
        priority: 'medium'
      })
    }

    // API integration guide
    actions.push({
      id: 'api-guide',
      title: 'Generate API Guide',
      description: 'Create custom integration documentation for this data type',
      action_type: 'export',
      icon: <ExternalLink className="w-4 h-4" />,
      priority: 'low'
    })

    setSmartActions(actions)
  }



  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // Implementation for PDF export would go here
      console.log('Exporting PDF report for record:', record?.id)
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleSmartAction = async (action: SmartAction) => {
    switch (action.id) {
      case 'export-pdf':
        await handleExportPDF()
        break
      case 'api-guide':
        // Generate API integration guide
        console.log('Generating API guide for:', record?.business_context)
        break
      default:
        console.log('Executing action:', action.id)
    }
  }

  if (!record) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate?.({
        user_notes: userNotes,
        user_category: userCategory
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating record:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getQualityColor = (score?: number) => {
    if (!score) return 'gray'
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  const getBusinessIcon = (context?: string) => {
    switch (context) {
      case 'healthcare': return <Heart className="w-4 h-4" />
      case 'financial': return <DollarSign className="w-4 h-4" />
      case 'ecommerce': return <ShoppingCart className="w-4 h-4" />
      case 'iot': return <Cpu className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const getSenderIcon = (source?: string) => {
    if (source?.includes('mobile')) return <Smartphone className="w-4 h-4" />
    if (source?.includes('web')) return <Globe className="w-4 h-4" />
    if (source?.includes('iot')) return <Cpu className="w-4 h-4" />
    return <User className="w-4 h-4" />
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const TabButton = ({ id, label, isActive, onClick }: { id: string; label: string; isActive: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Data Analysis & Categorization
            <Badge variant="outline" className="ml-2">
              {record.id.slice(0, 8)}...
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b overflow-x-auto">
          <TabButton 
            id="overview" 
            label="Overview" 
            isActive={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <TabButton 
            id="lineage" 
            label="Data Lineage" 
            isActive={activeTab === 'lineage'} 
            onClick={() => setActiveTab('lineage')} 
          />
          <TabButton 
            id="trends" 
            label="Trends" 
            isActive={activeTab === 'trends'} 
            onClick={() => setActiveTab('trends')} 
          />
          <TabButton 
            id="actions" 
            label="Smart Actions" 
            isActive={activeTab === 'actions'} 
            onClick={() => setActiveTab('actions')} 
          />
          <TabButton 
            id="sender" 
            label="Sender Analysis" 
            isActive={activeTab === 'sender'} 
            onClick={() => setActiveTab('sender')} 
          />
          <TabButton 
            id="content" 
            label="Content Details" 
            isActive={activeTab === 'content'} 
            onClick={() => setActiveTab('content')} 
          />
          <TabButton 
            id="raw" 
            label="Raw Data" 
            isActive={activeTab === 'raw'} 
            onClick={() => setActiveTab('raw')} 
          />
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Classification */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getBusinessIcon(record.business_context)}
                      <span className="font-medium">
                        {record.business_context || 'General'}
                      </span>
                      <Badge variant="secondary" className="ml-auto">
                        Auto-detected
                      </Badge>
                    </div>
                    
                    {record.auto_tags && record.auto_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {record.auto_tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Quality Score:</span>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            (record.data_quality_score || 50) >= 80 ? 'border-green-500 text-green-700 bg-green-50' :
                            (record.data_quality_score || 50) >= 60 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                            'border-red-500 text-red-700 bg-red-50'
                          }`}
                        >
                          {record.data_quality_score || 50}/100
                        </Badge>
                      </div>
                      
                      {/* Quality Score Visual Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (record.data_quality_score || 50) >= 80 ? 'bg-green-500' :
                            (record.data_quality_score || 50) >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${record.data_quality_score || 50}%` }}
                        />
                      </div>
                      
                      {/* Sender Confidence */}
                      {record.sender_info?.confidence_score !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">Sender Confidence:</span>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              record.sender_info.confidence_score >= 0.8 ? 'border-green-500 text-green-700 bg-green-50' :
                              record.sender_info.confidence_score >= 0.5 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                              'border-red-500 text-red-700 bg-red-50'
                            }`}
                          >
                            {Math.round(record.sender_info.confidence_score * 100)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* User Annotations */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      Your Annotations
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(!isEditing)}
                        className="ml-auto"
                      >
                        {isEditing ? <X className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="category" className="text-xs">Category Override</Label>
                          <Input
                            id="category"
                            value={userCategory}
                            onChange={(e) => setUserCategory(e.target.value)}
                            placeholder="e.g., Customer Feedback, Test Data"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes" className="text-xs">Notes</Label>
                          <Textarea
                            id="notes"
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                            placeholder="Add your notes about this data..."
                            className="h-20 text-sm"
                          />
                        </div>
                        <Button 
                          size="sm" 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-600">Category:</span>
                          <p className="text-sm">
                            {userCategory || record.business_context || 'Not categorized'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Notes:</span>
                          <p className="text-sm text-gray-800">
                            {userNotes || 'No notes added'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Processing Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Received:</span>
                        <p className="font-medium">{formatTimestamp(record.processed_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <p className="font-medium">{formatBytes(record.data_size)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Content Type:</span>
                        <p className="font-medium">{record.content_type || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Sensitive:</span>
                        {record.sensitive_data ? (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    {/* Processing Time */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="w-3 h-3 text-blue-500" />
                        <span className="text-gray-600">Processing Time:</span>
                        <Badge variant="outline" className="text-xs">
                          ~250ms
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Intelligence Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Key Fields Count */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Key Fields:</span>
                      <Badge variant="outline" className="text-xs">
                        {record.key_fields?.length || 0} identified
                      </Badge>
                    </div>
                    
                    {/* Structure Complexity */}
                    {record.enriched_data?.structure && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Complexity:</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            record.enriched_data.structure.nested_levels > 2 ? 'border-orange-500 text-orange-700' :
                            record.enriched_data.structure.nested_levels > 0 ? 'border-yellow-500 text-yellow-700' :
                            'border-green-500 text-green-700'
                          }`}
                        >
                          {record.enriched_data.structure.nested_levels === 0 ? 'Simple' :
                           record.enriched_data.structure.nested_levels <= 2 ? 'Moderate' : 'Complex'}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Related Records Count */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Related Records:</span>
                      <Badge variant="outline" className="text-xs">
                        {relatedRecords.length} found
                      </Badge>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="pt-2 border-t">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Data Lineage Tab */}
          {activeTab === 'lineage' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Related Records
                    {loadingRelated && <RefreshCw className="w-3 h-3 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {relatedRecords.length > 0 ? (
                    <div className="space-y-3">
                      {relatedRecords.map((related) => (
                        <div key={related.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {related.business_context || 'General'}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  related.similarity_score >= 70 ? 'bg-green-100 text-green-700' :
                                  related.similarity_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {related.similarity_score}% similar
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              {new Date(related.processed_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {related.data_quality_score && (
                              <Badge variant="outline" className="text-xs">
                                Q: {related.data_quality_score}
                              </Badge>
                            )}
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Link2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GitBranch className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No related records found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    30-Day Data Trends
                    {loadingTrends && <RefreshCw className="w-3 h-3 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {trendData.reduce((sum, day) => sum + day.count, 0)}
                          </p>
                          <p className="text-xs text-gray-600">Total Records</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round(trendData.reduce((sum, day) => sum + day.avg_quality, 0) / trendData.length)}
                          </p>
                          <p className="text-xs text-gray-600">Avg Quality</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {new Set(trendData.flatMap(day => day.business_contexts)).size}
                          </p>
                          <p className="text-xs text-gray-600">Data Types</p>
                        </div>
                      </div>

                      {/* Recent Trend */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Recent Activity</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {trendData.slice(-7).map((day) => (
                            <div key={day.date} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {new Date(day.date).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {day.count} records
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    day.avg_quality >= 80 ? 'border-green-500 text-green-700' :
                                    day.avg_quality >= 60 ? 'border-yellow-500 text-yellow-700' :
                                    'border-red-500 text-red-700'
                                  }`}
                                >
                                  Q: {day.avg_quality}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No trend data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Smart Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {smartActions.map((action) => (
                      <div 
                        key={action.id} 
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          action.priority === 'high' ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' :
                          action.priority === 'medium' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
                          'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handleSmartAction(action)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            action.priority === 'high' ? 'bg-blue-100' :
                            action.priority === 'medium' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            {action.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{action.title}</h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  action.priority === 'high' ? 'border-blue-500 text-blue-700' :
                                  action.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                  'border-gray-500 text-gray-700'
                                }`}
                              >
                                {action.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">{action.description}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8"
                            disabled={isExporting && action.id === 'export-pdf'}
                          >
                            {isExporting && action.id === 'export-pdf' ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Target className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => handleSmartAction({ id: 'export-pdf' } as SmartAction)}
                      disabled={isExporting}
                    >
                      <FileText className="w-3 h-3" />
                      {isExporting ? 'Generating...' : 'PDF Report'}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="w-3 h-3" />
                      CSV Export
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Share2 className="w-3 h-3" />
                      Share Link
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ExternalLink className="w-3 h-3" />
                      API Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sender Analysis Tab */}
          {activeTab === 'sender' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sender Identification Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {record.sender_info ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Explicit Sender Info */}
                    {(record.sender_info.explicit_id || record.sender_info.explicit_name || record.sender_info.explicit_email) && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-green-700">✓ Explicit Identification</h4>
                        {record.sender_info.explicit_id && (
                          <div className="text-sm">
                            <span className="text-gray-600">ID:</span> {record.sender_info.explicit_id}
                          </div>
                        )}
                        {record.sender_info.explicit_name && (
                          <div className="text-sm">
                            <span className="text-gray-600">Name:</span> {record.sender_info.explicit_name}
                          </div>
                        )}
                        {record.sender_info.explicit_email && (
                          <div className="text-sm">
                            <span className="text-gray-600">Email:</span> {record.sender_info.explicit_email}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Technical Fingerprint */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-blue-700">🔍 Technical Analysis</h4>
                      {record.sender_info.ip_address && (
                        <div className="text-sm">
                          <span className="text-gray-600">IP:</span> {record.sender_info.ip_address}
                        </div>
                      )}
                      {record.sender_info.user_agent && (
                        <div className="text-sm">
                          <span className="text-gray-600">User Agent:</span> 
                          <p className="text-xs text-gray-800 mt-1 break-all">
                            {record.sender_info.user_agent}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No sender information available</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Content Details Tab */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Fields */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Important Fields
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {record.key_fields && record.key_fields.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {record.key_fields.map((field, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No key fields identified</p>
                    )}
                  </CardContent>
                </Card>

                {/* Structure Analysis */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Structure Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {record.enriched_data?.structure ? (
                      <>
                        <div>
                          <span className="text-gray-600">Field Count:</span> {record.enriched_data.structure.field_count}
                        </div>
                        <div>
                          <span className="text-gray-600">Nesting Levels:</span> {record.enriched_data.structure.nested_levels}
                        </div>
                        <div>
                          <span className="text-gray-600">Data Types:</span> 
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.enriched_data.structure.data_types?.map((type: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">No structure analysis available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Raw Data Tab */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Raw Payload</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(record.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
              
              {record.enriched_data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Complete Analysis Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(record.enriched_data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 