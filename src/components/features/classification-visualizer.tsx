'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Sparkles, 
  Target, 
  Tag, 
  TrendingUp,
  PieChart,
  BarChart3,
  Zap
} from 'lucide-react'
import { 
  getAllDataTypes, 
  getAllDataSources, 
  getDataTypeDefinition,
  getDataSourceDefinition 
} from '@/lib/universal-classification'

interface ClassificationStats {
  totalRequests: number
  typeBreakdown: Record<string, number>
  sourceBreakdown: Record<string, number>
  avgConfidence: number
  avgQualityScore: number
  topTags: Array<{ tag: string; count: number }>
}

interface ClassificationExample {
  input: any
  output: {
    type: string
    source: string
    tags: string[]
    confidence: number
    qualityScore: number
  }
}

export function ClassificationVisualizer() {
  const [stats, setStats] = useState<ClassificationStats | null>(null)
  const [examples, setExamples] = useState<ClassificationExample[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Generate mock data for demonstration
    generateMockData()
  }, [])

  const generateMockData = () => {
    // Mock classification stats
    const mockStats: ClassificationStats = {
      totalRequests: 1247,
      typeBreakdown: {
        'sensor_data': 425,
        'health_data': 312,
        'message': 198,
        'event': 156,
        'task': 89,
        'note': 67
      },
      sourceBreakdown: {
        'iot_device': 387,
        'mobile_app': 298,
        'webhook': 245,
        'gpt_agent': 189,
        'web_app': 128
      },
      avgConfidence: 0.87,
      avgQualityScore: 73,
      topTags: [
        { tag: 'health', count: 234 },
        { tag: 'work', count: 189 },
        { tag: 'personal', count: 156 },
        { tag: 'urgent', count: 89 },
        { tag: 'after-hours', count: 67 }
      ]
    }

    // Mock classification examples
    const mockExamples: ClassificationExample[] = [
      {
        input: {
          temperature: 23.5,
          humidity: 45,
          sensor_id: 'temp_001',
          location: 'living_room'
        },
        output: {
          type: 'sensor_data',
          source: 'iot_device',
          tags: ['business-hours'],
          confidence: 0.95,
          qualityScore: 85
        }
      },
      {
        input: {
          type: 'reminder',
          content: 'Take medication at 8pm',
          priority: 'high',
          health: true
        },
        output: {
          type: 'task',
          source: 'unknown',
          tags: ['health', 'urgent', 'personal'],
          confidence: 0.92,
          qualityScore: 78
        }
      },
      {
        input: {
          message: 'Meeting in 10 minutes',
          source: 'slack-bot',
          urgent: true
        },
        output: {
          type: 'message',
          source: 'webhook',
          tags: ['work', 'urgent', 'business-hours'],
          confidence: 0.88,
          qualityScore: 71
        }
      }
    ]

    setStats(mockStats)
    setExamples(mockExamples)
    setLoading(false)
  }

  const getTypeColor = (typeName: string) => {
    const type = getDataTypeDefinition(typeName)
    return type?.color || '#6B7280'
  }

  const getSourceColor = (sourceName: string) => {
    const source = getDataSourceDefinition(sourceName)
    return source?.color || '#6B7280'
  }

  const getTypeIcon = (typeName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'sensor_data': <Zap className="h-4 w-4" />,
      'health_data': <Target className="h-4 w-4" />,
      'message': <Sparkles className="h-4 w-4" />,
      'event': <TrendingUp className="h-4 w-4" />,
      'task': <Target className="h-4 w-4" />,
      'note': <Tag className="h-4 w-4" />
    }
    return iconMap[typeName] || <Tag className="h-4 w-4" />
  }

  if (loading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Classification Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-enostics-gray-800/50 rounded" />
            <div className="h-20 bg-enostics-gray-800/50 rounded" />
            <div className="h-20 bg-enostics-gray-800/50 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Classification Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-enostics-blue" />
                <span className="text-sm font-medium text-enostics-gray-300">Total Requests</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats?.totalRequests.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-enostics-green" />
                <span className="text-sm font-medium text-enostics-gray-300">Avg Confidence</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.round((stats?.avgConfidence || 0) * 100)}%
              </p>
            </div>

            <div className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-enostics-yellow" />
                <span className="text-sm font-medium text-enostics-gray-300">Quality Score</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats?.avgQualityScore}/100
              </p>
            </div>

            <div className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="h-4 w-4 text-enostics-purple" />
                <span className="text-sm font-medium text-enostics-gray-300">Data Types</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {Object.keys(stats?.typeBreakdown || {}).length}
              </p>
            </div>
          </div>

          {/* Type Breakdown */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Data Type Distribution</h3>
            <div className="space-y-2">
              {Object.entries(stats?.typeBreakdown || {})
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => {
                  const percentage = ((count / (stats?.totalRequests || 1)) * 100)
                  const typeDefinition = getDataTypeDefinition(type)
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        {getTypeIcon(type)}
                        <span className="text-sm text-white">
                          {typeDefinition?.displayName || type}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-enostics-gray-800 rounded-full h-2">
                          <div 
                            className="bg-enostics-blue h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-enostics-gray-400 min-w-[60px] text-right">
                        {count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Source Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(stats?.sourceBreakdown || {})
                .sort(([,a], [,b]) => b - a)
                .map(([source, count]) => {
                  const sourceDefinition = getDataSourceDefinition(source)
                  return (
                    <div key={source} className="p-3 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getSourceColor(source) }}
                          />
                          <span className="text-sm text-white">
                            {sourceDefinition?.displayName || source}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Top Tags */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {stats?.topTags.map(({ tag, count }) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag} ({count})
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification Examples */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Classification Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {examples.map((example, index) => (
              <div key={index} className="p-4 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Input */}
                  <div>
                    <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">Input Payload</h4>
                    <pre className="text-xs text-enostics-gray-400 bg-enostics-gray-900/50 p-3 rounded border border-enostics-gray-800 overflow-x-auto">
                      {JSON.stringify(example.input, null, 2)}
                    </pre>
                  </div>

                  {/* Output */}
                  <div>
                    <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">Classification Result</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-enostics-gray-400">Type:</span>
                        <Badge style={{ backgroundColor: getTypeColor(example.output.type) + '20', color: getTypeColor(example.output.type) }}>
                          {example.output.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-enostics-gray-400">Source:</span>
                        <Badge variant="outline" className="text-xs">
                          {example.output.source}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-enostics-gray-400">Confidence:</span>
                        <div className="flex-1 bg-enostics-gray-800 rounded-full h-2">
                          <div 
                            className="bg-enostics-green h-2 rounded-full transition-all duration-300"
                            style={{ width: `${example.output.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-white">
                          {Math.round(example.output.confidence * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-enostics-gray-400">Quality:</span>
                        <div className="flex-1 bg-enostics-gray-800 rounded-full h-2">
                          <div 
                            className="bg-enostics-yellow h-2 rounded-full transition-all duration-300"
                            style={{ width: `${example.output.qualityScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-white">
                          {example.output.qualityScore}/100
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-xs text-enostics-gray-400">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {example.output.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 