'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Globe, Lock, Activity } from 'lucide-react'

const mockEndpoints = [
  {
    id: '1',
    name: 'Health Records API',
    url: '/api/health-records',
    status: 'active',
    requests: 1247,
    lastUsed: '2 hours ago'
  },
  {
    id: '2',
    name: 'Lab Results Webhook',
    url: '/api/lab-results',
    status: 'active',
    requests: 856,
    lastUsed: '1 day ago'
  },
  {
    id: '3',
    name: 'Prescription Data',
    url: '/api/prescriptions',
    status: 'paused',
    requests: 234,
    lastUsed: '3 days ago'
  }
]

export function EndpointsList() {
  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Endpoints</CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Endpoint
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockEndpoints.map((endpoint) => (
          <div
            key={endpoint.id}
            className="flex items-center justify-between p-4 rounded-lg bg-enostics-gray-900/50 border border-enostics-gray-800"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-enostics-blue/20">
                <Globe className="h-5 w-5 text-enostics-blue" />
              </div>
              <div>
                <h3 className="font-medium text-white">{endpoint.name}</h3>
                <p className="text-sm text-enostics-gray-400">{endpoint.url}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{endpoint.requests}</p>
                <p className="text-xs text-enostics-gray-500">requests</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-enostics-gray-400">{endpoint.lastUsed}</p>
                <p className="text-xs text-enostics-gray-500">last used</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {endpoint.status === 'active' ? (
                  <>
                    <Activity className="h-4 w-4 text-enostics-green" />
                    <span className="text-sm text-enostics-green">Active</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-enostics-amber" />
                    <span className="text-sm text-enostics-amber">Paused</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {mockEndpoints.length === 0 && (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-enostics-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No endpoints yet</h3>
            <p className="text-enostics-gray-400 mb-4">
              Create your first API endpoint to start receiving health data
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Endpoint
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 