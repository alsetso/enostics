'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wrench, Brain, Zap, Settings, Activity, Plus, Sparkles, Code, FileText } from 'lucide-react'

export default function AIToolsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">AI Tools</h1>
        <p className="text-[hsl(var(--text-secondary))]">
          Advanced AI utilities for data processing, analysis, and automation.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Active Tools</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Processed Today</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Success Rate</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Tools List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Your AI Tools
            </CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-[hsl(var(--text-secondary))] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No AI tools configured yet</h3>
            <p className="text-[hsl(var(--text-secondary))] mb-4">
              Configure your first AI tool to enhance data processing
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Configure Your First Tool
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available AI Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Available AI Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Data Classifier',
                description: 'Automatically categorize and tag incoming data',
                icon: <Brain className="h-5 w-5" />,
                color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                badge: 'Popular'
              },
              {
                name: 'Sentiment Analyzer',
                description: 'Analyze sentiment and emotions in text data',
                icon: <Sparkles className="h-5 w-5" />,
                color: 'bg-green-500/10 border-green-500/20 text-green-400',
                badge: 'New'
              },
              {
                name: 'Content Summarizer',
                description: 'Generate summaries of long text content',
                icon: <FileText className="h-5 w-5" />,
                color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                badge: null
              },
              {
                name: 'Pattern Detector',
                description: 'Identify patterns and anomalies in data',
                icon: <Zap className="h-5 w-5" />,
                color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
                badge: 'Beta'
              },
              {
                name: 'Language Translator',
                description: 'Translate text between different languages',
                icon: <Code className="h-5 w-5" />,
                color: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
                badge: null
              },
              {
                name: 'Data Validator',
                description: 'Validate data quality and completeness',
                icon: <Settings className="h-5 w-5" />,
                color: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
                badge: null
              }
            ].map((tool) => (
              <div key={tool.name} className="border rounded-lg p-4 hover:bg-[hsl(var(--hover-bg))] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-full ${tool.color}`}>
                    {tool.icon}
                  </div>
                  <h3 className="font-medium">{tool.name}</h3>
                  {tool.badge && (
                    <Badge variant="outline" className="text-xs">
                      {tool.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">
                  {tool.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Configure Tool
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 