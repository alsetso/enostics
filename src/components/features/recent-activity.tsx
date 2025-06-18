'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

const mockActivity = [
  {
    id: '1',
    type: 'data_received',
    endpoint: 'Health Records API',
    message: 'New patient data received from Dr. Smith',
    timestamp: '2 minutes ago',
    status: 'success'
  },
  {
    id: '2',
    type: 'endpoint_created',
    endpoint: 'Lab Results Webhook',
    message: 'New endpoint created and activated',
    timestamp: '1 hour ago',
    status: 'success'
  },
  {
    id: '3',
    type: 'data_received',
    endpoint: 'Prescription Data',
    message: 'Prescription update from CVS Pharmacy',
    timestamp: '3 hours ago',
    status: 'success'
  },
  {
    id: '4',
    type: 'error',
    endpoint: 'Lab Results Webhook',
    message: 'Authentication failed - check API key',
    timestamp: '5 hours ago',
    status: 'error'
  },
  {
    id: '5',
    type: 'data_received',
    endpoint: 'Health Records API',
    message: 'Vitals data from Apple Health',
    timestamp: '1 day ago',
    status: 'success'
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-enostics-green" />
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-enostics-amber" />
    case 'error':
      return <XCircle className="h-4 w-4 text-enostics-red" />
    default:
      return <Clock className="h-4 w-4 text-enostics-gray-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-enostics-green/10 text-enostics-green border-enostics-green/20'
    case 'warning':
      return 'bg-enostics-amber/10 text-enostics-amber border-enostics-amber/20'
    case 'error':
      return 'bg-enostics-red/10 text-enostics-red border-enostics-red/20'
    default:
      return 'bg-enostics-gray-800 text-enostics-gray-400 border-enostics-gray-700'
  }
}

export function RecentActivity() {
  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivity.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 p-3 rounded-lg bg-enostics-gray-900/30 border border-enostics-gray-800/50"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(activity.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-white truncate">
                  {activity.endpoint}
                </p>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(activity.status)}`}
                >
                  {activity.status}
                </Badge>
              </div>
              
              <p className="text-sm text-enostics-gray-400 mb-2">
                {activity.message}
              </p>
              
              <div className="flex items-center text-xs text-enostics-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {activity.timestamp}
              </div>
            </div>
          </div>
        ))}
        
        {mockActivity.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-enostics-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No activity yet</h3>
            <p className="text-enostics-gray-400">
              Activity will appear here when you start receiving data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 