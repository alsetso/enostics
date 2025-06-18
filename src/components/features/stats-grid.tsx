'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Activity, Shield, Zap } from 'lucide-react'

const stats = [
  {
    title: 'Active Endpoints',
    value: '3',
    change: '+2 this week',
    icon: Database,
    color: 'text-enostics-blue'
  },
  {
    title: 'Data Received',
    value: '1,247',
    change: '+18% from last month',
    icon: Activity,
    color: 'text-enostics-green'
  },
  {
    title: 'Security Score',
    value: '98%',
    change: 'All systems secure',
    icon: Shield,
    color: 'text-enostics-amber'
  },
  {
    title: 'Response Time',
    value: '45ms',
    change: '-12ms improvement',
    icon: Zap,
    color: 'text-enostics-red'
  }
]

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-enostics-gray-400">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-enostics-gray-500 mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 