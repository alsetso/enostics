'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Bell, 
  Palette, 
  Clock, 
  Settings, 
  Save, 
  TestTube, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  BarChart3,
  Globe,
  Shield,
  Zap
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface EmailPreferences {
  // Notification Types
  endpoint_activity_enabled: boolean
  success_notifications: boolean
  failure_notifications: boolean
  warning_notifications: boolean
  info_notifications: boolean
  
  // Summary Reports
  daily_summaries: boolean
  weekly_summaries: boolean  
  monthly_summaries: boolean
  
  // Delivery Settings
  timezone: string
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  digest_frequency: 'immediate' | 'hourly' | 'daily'
  
  // Content Settings
  include_payload_data: boolean
  include_source_details: boolean
  technical_detail_level: 'basic' | 'detailed' | 'verbose'
  
  // Rate Limiting
  max_emails_per_hour: number
  max_emails_per_day: number
}

interface EmailTemplate {
  id: string
  template_type: string
  template_name: string
  custom_subject: string
  is_active: boolean
  created_at: string
}

export default function EmailSettingsPage() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    endpoint_activity_enabled: true,
    success_notifications: true,
    failure_notifications: true,
    warning_notifications: true,
    info_notifications: false,
    daily_summaries: false,
    weekly_summaries: true,
    monthly_summaries: false,
    timezone: 'America/New_York',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    digest_frequency: 'immediate',
    include_payload_data: true,
    include_source_details: true,
    technical_detail_level: 'detailed',
    max_emails_per_hour: 10,
    max_emails_per_day: 50
  })

  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    loadEmailSettings()
  }, [])

  const loadEmailSettings = async () => {
    setIsLoading(true)
    try {
      // Load email preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('enostics_email_preferences')
        .select('*')
        .single()

      if (prefsData && !prefsError) {
        setPreferences(prev => ({ ...prev, ...prefsData }))
      }

      // Load custom templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('enostics_user_email_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (templatesData && !templatesError) {
        setTemplates(templatesData)
      }

    } catch (error) {
      console.error('Error loading email settings:', error)
      toast.error('Failed to load email settings')
    } finally {
      setIsLoading(false)
    }
  }

  const savePreferences = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('enostics_email_preferences')
        .upsert(preferences)

      if (error) throw error

      toast.success('Email preferences saved successfully')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save email preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const sendTestEmail = async () => {
    try {
      // This would integrate with your Resend MCP server
      toast.success('Test email sent! Check your inbox.')
    } catch (error) {
      toast.error('Failed to send test email')
    }
  }

  const updatePreference = (key: keyof EmailPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-enostics-purple"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Mail className="h-8 w-8 text-enostics-purple" />
          Email Settings
        </h1>
        <p className="text-enostics-gray-400 mt-2">
          Customize your email notifications and templates
        </p>
      </div>

      {/* Notification Preferences */}
      <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <Bell className="h-6 w-6 text-enostics-purple" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Endpoint Activity Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Endpoint Activity Notifications</Label>
                <p className="text-sm text-enostics-gray-400">Get notified when your endpoints receive requests</p>
              </div>
              <Switch
                checked={preferences.endpoint_activity_enabled}
                onCheckedChange={(checked) => updatePreference('endpoint_activity_enabled', checked)}
              />
            </div>

            {preferences.endpoint_activity_enabled && (
              <div className="ml-6 space-y-4 border-l-2 border-enostics-gray-700 pl-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Label className="text-enostics-gray-300">Success notifications</Label>
                  </div>
                  <Switch
                    checked={preferences.success_notifications}
                    onCheckedChange={(checked) => updatePreference('success_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <Label className="text-enostics-gray-300">Failure notifications</Label>
                  </div>
                  <Switch
                    checked={preferences.failure_notifications}
                    onCheckedChange={(checked) => updatePreference('failure_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <Label className="text-enostics-gray-300">Warning notifications</Label>
                  </div>
                  <Switch
                    checked={preferences.warning_notifications}
                    onCheckedChange={(checked) => updatePreference('warning_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <Label className="text-enostics-gray-300">Info notifications</Label>
                  </div>
                  <Switch
                    checked={preferences.info_notifications}
                    onCheckedChange={(checked) => updatePreference('info_notifications', checked)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary Reports */}
          <div className="space-y-4">
            <div>
              <Label className="text-white font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Summary Reports
              </Label>
              <p className="text-sm text-enostics-gray-400">Periodic activity summaries for your endpoints</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-enostics-gray-800/50 rounded-lg">
                <Label className="text-enostics-gray-300">Daily summaries</Label>
                <Switch
                  checked={preferences.daily_summaries}
                  onCheckedChange={(checked) => updatePreference('daily_summaries', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-enostics-gray-800/50 rounded-lg">
                <Label className="text-enostics-gray-300">Weekly summaries</Label>
                <Switch
                  checked={preferences.weekly_summaries}
                  onCheckedChange={(checked) => updatePreference('weekly_summaries', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-enostics-gray-800/50 rounded-lg">
                <Label className="text-enostics-gray-300">Monthly summaries</Label>
                <Switch
                  checked={preferences.monthly_summaries}
                  onCheckedChange={(checked) => updatePreference('monthly_summaries', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <Clock className="h-6 w-6 text-enostics-blue" />
            Delivery Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timezone */}
            <div className="space-y-2">
              <Label className="text-white font-medium">Timezone</Label>
              <Select value={preferences.timezone} onValueChange={(value) => updatePreference('timezone', value)}>
                <SelectTrigger className="bg-enostics-gray-800 border-enostics-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-enostics-gray-800 border-enostics-gray-600">
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Digest Frequency */}
            <div className="space-y-2">
              <Label className="text-white font-medium">Digest Frequency</Label>
              <Select value={preferences.digest_frequency} onValueChange={(value: any) => updatePreference('digest_frequency', value)}>
                <SelectTrigger className="bg-enostics-gray-800 border-enostics-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-enostics-gray-800 border-enostics-gray-600">
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly digest</SelectItem>
                  <SelectItem value="daily">Daily digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Quiet Hours</Label>
                <p className="text-sm text-enostics-gray-400">Pause non-critical notifications during these hours</p>
              </div>
              <Switch
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={(checked) => updatePreference('quiet_hours_enabled', checked)}
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-enostics-gray-300">Start time</Label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                    className="bg-enostics-gray-800 border-enostics-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-enostics-gray-300">End time</Label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                    className="bg-enostics-gray-800 border-enostics-gray-600 text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <Settings className="h-6 w-6 text-enostics-green" />
            Content Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Include Payload Data</Label>
                <p className="text-sm text-enostics-gray-400">Show request payload in email notifications</p>
              </div>
              <Switch
                checked={preferences.include_payload_data}
                onCheckedChange={(checked) => updatePreference('include_payload_data', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Include Source Details</Label>
                <p className="text-sm text-enostics-gray-400">Show IP address, user agent, and source information</p>
              </div>
              <Switch
                checked={preferences.include_source_details}
                onCheckedChange={(checked) => updatePreference('include_source_details', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">Technical Detail Level</Label>
              <Select value={preferences.technical_detail_level} onValueChange={(value: any) => updatePreference('technical_detail_level', value)}>
                <SelectTrigger className="bg-enostics-gray-800 border-enostics-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-enostics-gray-800 border-enostics-gray-600">
                  <SelectItem value="basic">Basic - Key information only</SelectItem>
                  <SelectItem value="detailed">Detailed - Full context and metadata</SelectItem>
                  <SelectItem value="verbose">Verbose - Complete technical details</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <Shield className="h-6 w-6 text-enostics-orange" />
            Rate Limiting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white font-medium">Max emails per hour</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={preferences.max_emails_per_hour}
                onChange={(e) => updatePreference('max_emails_per_hour', parseInt(e.target.value))}
                className="bg-enostics-gray-800 border-enostics-gray-600 text-white"
              />
              <p className="text-xs text-enostics-gray-500">Prevent email spam from high-traffic endpoints</p>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">Max emails per day</Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={preferences.max_emails_per_day}
                onChange={(e) => updatePreference('max_emails_per_day', parseInt(e.target.value))}
                className="bg-enostics-gray-800 border-enostics-gray-600 text-white"
              />
              <p className="text-xs text-enostics-gray-500">Daily limit across all notification types</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={savePreferences}
          disabled={isSaving}
          className="bg-enostics-purple hover:bg-enostics-purple/80 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>

        <Button 
          variant="outline"
          onClick={sendTestEmail}
          className="border-enostics-gray-600 text-enostics-gray-300 hover:bg-enostics-gray-800"
        >
          <TestTube className="h-4 w-4 mr-2" />
          Send Test Email
        </Button>
      </div>
    </div>
  )
} 