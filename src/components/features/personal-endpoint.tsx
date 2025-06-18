'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Globe, Check } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

export function PersonalEndpoint() {
  const [username, setUsername] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      if (profile?.full_name) {
        setUsername(profile.full_name.toLowerCase().replace(/\s+/g, '-'))
      } else {
        // Fallback to email username
        const emailUsername = user.email?.split('@')[0] || 'user'
        setUsername(emailUsername)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    } finally {
      setLoading(false)
    }
  }

  const personalEndpointUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/${username}`
    : `http://localhost:3000/api/${username}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(personalEndpointUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const testEndpoint = async () => {
    try {
      const testData = {
        test: true,
        message: 'Test data from dashboard',
        timestamp: new Date().toISOString(),
        value: Math.random()
      }

      const response = await fetch(personalEndpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })

      if (response.ok) {
        alert('Test data sent successfully! Check your data feed below.')
        // Refresh the page to show new data
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else {
        alert('Failed to send test data')
      }
    } catch (error) {
      console.error('Test failed:', error)
      alert('Test failed - check console for details')
    }
  }

  if (loading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Your Personal Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-6 bg-enostics-gray-800/50 rounded mb-4" />
            <div className="h-10 bg-enostics-gray-800/50 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Your Personal Endpoint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-enostics-gray-400 mb-2">
            This is your personal data endpoint. Any system can send JSON data here.
          </p>
          <div className="flex items-center gap-2 p-3 bg-enostics-gray-900/50 rounded-lg border border-enostics-gray-800">
            <code className="flex-1 text-sm text-enostics-green font-mono">
              {personalEndpointUrl}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              className="p-2 h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-enostics-green" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testEndpoint}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Send Test Data
          </Button>
        </div>

        <div className="p-3 bg-enostics-gray-900/30 rounded-lg border border-enostics-gray-800/50">
          <h4 className="text-sm font-medium text-white mb-2">Usage Example</h4>
          <pre className="text-xs text-enostics-gray-400 overflow-x-auto">
{`curl -X POST ${personalEndpointUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello Enostics!", "value": 123}'`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
} 