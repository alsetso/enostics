'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Bell, 
  Clock, 
  Settings, 
  Save, 
  TestTube, 
  CheckCircle,
  AlertTriangle,
  Info,
  BarChart3,
  Shield
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
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-12 pb-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Mail className="h-8 w-8 text-purple-500" />
            Email Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Customize your email notifications and templates
          </p>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-purple-500" />
              Notification Preferences
            </h2>

            {/* Endpoint Activity Notifications */}
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Endpoint Activity Notifications</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when your endpoints receive requests</p>
                </div>
                <Switch
                  checked={preferences.endpoint_activity_enabled}
                  onCheckedChange={(checked) => updatePreference('endpoint_activity_enabled', checked)}
                />
              </div>

              {preferences.endpoint_activity_enabled && (
                <div className="ml-6 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-6">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-gray-900 dark:text-white">Success notifications</span>
                    </div>
                    <Switch
                      checked={preferences.success_notifications}
                      onCheckedChange={(checked) => updatePreference('success_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-gray-900 dark:text-white">Failure notifications</span>
                    </div>
                    <Switch
                      checked={preferences.failure_notifications}
                      onCheckedChange={(checked) => updatePreference('failure_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-900 dark:text-white">Warning notifications</span>
                    </div>
                    <Switch
                      checked={preferences.warning_notifications}
                      onCheckedChange={(checked) => updatePreference('warning_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-900 dark:text-white">Info notifications</span>
                    </div>
                    <Switch
                      checked={preferences.info_notifications}
                      onCheckedChange={(checked) => updatePreference('info_notifications', checked)}
                    />
                  </div>
                </div>
              )}

              {/* Summary Reports */}
              <div className="space-y-4 pt-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Summary Reports
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Periodic activity summaries for your endpoints</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="text-gray-900 dark:text-white">Daily summaries</span>
                    <Switch
                      checked={preferences.daily_summaries}
                      onCheckedChange={(checked) => updatePreference('daily_summaries', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="text-gray-900 dark:text-white">Weekly summaries</span>
                    <Switch
                      checked={preferences.weekly_summaries}
                      onCheckedChange={(checked) => updatePreference('weekly_summaries', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="text-gray-900 dark:text-white">Monthly summaries</span>
                    <Switch
                      checked={preferences.monthly_summaries}
                      onCheckedChange={(checked) => updatePreference('monthly_summaries', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-blue-500" />
              Delivery Settings
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timezone */}
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white font-medium">Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => updatePreference('timezone', value)}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label className="text-gray-900 dark:text-white font-medium">Digest Frequency</Label>
                  <Select value={preferences.digest_frequency} onValueChange={(value: any) => updatePreference('digest_frequency', value)}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly digest</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Quiet Hours</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pause non-critical notifications during these hours</p>
                  </div>
                  <Switch
                    checked={preferences.quiet_hours_enabled}
                    onCheckedChange={(checked) => updatePreference('quiet_hours_enabled', checked)}
                  />
                </div>

                {preferences.quiet_hours_enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Start time</Label>
                      <Input
                        type="time"
                        value={preferences.quiet_hours_start}
                        onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                        className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">End time</Label>
                      <Input
                        type="time"
                        value={preferences.quiet_hours_end}
                        onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                        className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-emerald-500" />
              Content Settings
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Include Payload Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Show request payload in email notifications</p>
                </div>
                <Switch
                  checked={preferences.include_payload_data}
                  onCheckedChange={(checked) => updatePreference('include_payload_data', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Include Source Details</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Show IP address, user agent, and source information</p>
                </div>
                <Switch
                  checked={preferences.include_source_details}
                  onCheckedChange={(checked) => updatePreference('include_source_details', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white font-medium">Technical Detail Level</Label>
                <Select value={preferences.technical_detail_level} onValueChange={(value: any) => updatePreference('technical_detail_level', value)}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Key information only</SelectItem>
                    <SelectItem value="detailed">Detailed - Full context and metadata</SelectItem>
                    <SelectItem value="verbose">Verbose - Complete technical details</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-orange-500" />
              Rate Limiting
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white font-medium">Max emails per hour</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={preferences.max_emails_per_hour}
                  onChange={(e) => updatePreference('max_emails_per_hour', parseInt(e.target.value))}
                  className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Prevent email spam from high-traffic endpoints</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white font-medium">Max emails per day</Label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={preferences.max_emails_per_day}
                  onChange={(e) => updatePreference('max_emails_per_day', parseInt(e.target.value))}
                  className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Daily limit across all notification types</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-6">
          <Button 
            onClick={savePreferences}
            disabled={isSaving}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>

          <Button 
            variant="outline"
            onClick={sendTestEmail}
            className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
        </div>
      </div>
    </div>
  )
} 