'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Calendar, Globe, Eye } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface DataEntry {
  id: string
  data: any
  source_ip: string | null
  headers: any
  processed_at: string
  status: string
}

export function DataDisplay() {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<DataEntry | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user's data
      const { data, error } = await supabase
        .from('enostics_data')
        .select('*')
        .eq('endpoint_id', user.id)
        .order('processed_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching data:', error)
        return
      }

      setDataEntries(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

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
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Incoming Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-enostics-gray-800/50 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Incoming Data
            <Badge variant="outline" className="ml-auto">
              {dataEntries.length} entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataEntries.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-enostics-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No data received yet</h3>
              <p className="text-enostics-gray-400 mb-4">
                Send data to your personal endpoint to see it here
              </p>
            </div>
          ) : (
            dataEntries.map((entry) => (
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
                    <p className="text-sm font-medium text-white truncate">
                      {formatDataPreview(entry.data)}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
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
            ))
          )}
        </CardContent>
      </Card>

      {/* Data Detail Modal */}
      {selectedEntry && (
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Data Details</CardTitle>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-enostics-gray-400 hover:text-white"
            >
              ×
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-enostics-gray-300 mb-2">Raw Data</h4>
                <pre className="bg-enostics-gray-900 rounded-lg p-4 text-xs text-enostics-gray-300 overflow-auto max-h-64">
                  {JSON.stringify(selectedEntry.data, null, 2)}
                </pre>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-enostics-gray-300 mb-1">Received</h4>
                  <p className="text-sm text-white">{formatTimestamp(selectedEntry.processed_at)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-enostics-gray-300 mb-1">Source IP</h4>
                  <p className="text-sm text-white">{selectedEntry.source_ip || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 