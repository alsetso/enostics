'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Plus, Settings, Activity, Zap, Brain, Play, Pause } from 'lucide-react'

export default function AgentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">AI Agents</h1>
        <p className="text-[hsl(var(--text-secondary))]">
          Deploy intelligent agents on your endpoints to process, analyze, and respond to data automatically.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Active Agents</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
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

      {/* Agents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Your AI Agents
            </CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Deploy Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-[hsl(var(--text-secondary))] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents deployed yet</h3>
            <p className="text-[hsl(var(--text-secondary))] mb-4">
              Deploy your first AI agent to start processing data automatically
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Deploy Your First Agent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Data Classifier',
                description: 'Automatically categorize incoming data',
                icon: <Brain className="h-5 w-5" />,
                color: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              },
              {
                name: 'Content Moderator',
                description: 'Filter and moderate content automatically',
                icon: <Settings className="h-5 w-5" />,
                color: 'bg-green-500/10 border-green-500/20 text-green-400'
              },
              {
                name: 'Auto Responder',
                description: 'Send automated responses based on data',
                icon: <Zap className="h-5 w-5" />,
                color: 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              }
            ].map((template) => (
              <div key={template.name} className="border rounded-lg p-4 hover:bg-[hsl(var(--hover-bg))] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-full ${template.color}`}>
                    {template.icon}
                  </div>
                  <h3 className="font-medium">{template.name}</h3>
                </div>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">
                  {template.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Deploy Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 