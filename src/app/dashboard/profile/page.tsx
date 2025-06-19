'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Mail, Calendar, Save, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import ProfileSidebar from '@/components/layout/profile-sidebar'

interface Profile {
  id: string
  email: string
  full_name: string
  username: string
  display_name: string
  bio: string
  timezone: string
  created_at: string
  onboarding_completed: boolean
  onboarding_steps: {
    plan_confirmation?: boolean
    personal_info?: boolean
    endpoint_setup?: boolean
    welcome_tour?: boolean
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('personal')
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    display_name: '',
    bio: '',
    timezone: ''
  })

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      // Combine user email with profile data
      const profileWithEmail = {
        ...data,
        email: user.email
      }

      setProfile(profileWithEmail)
      setFormData({
        full_name: data.full_name || '',
        username: data.username || '',
        display_name: data.display_name || '',
        bio: data.bio || '',
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          timezone: formData.timezone,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) {
        console.error('Error updating profile:', error)
        alert('Failed to update profile')
        return
      }

      console.log('Profile updated successfully!')
      alert('Profile updated successfully!')
      await fetchProfile() // Refresh data
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const renderPersonalSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <User className="mr-3 h-6 w-6 text-enostics-purple" />
          Profile Information
        </h2>
        <p className="text-enostics-gray-400 mb-6">
          Your endpoint identity and basic information
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-enostics-gray-300 font-medium">
              Full Name
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-enostics-gray-300 font-medium">
              Username <span className="text-enostics-gray-500">(Endpoint Path)</span>
            </Label>
            <div className="relative">
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20 pl-20"
                placeholder="username"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enostics-gray-500 text-sm">
                /v1/
              </div>
            </div>
            <p className="text-xs text-enostics-gray-500">
              Your endpoint will be: api.enostics.com/v1/{formData.username || 'username'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-enostics-gray-300 font-medium">
              Display Name
            </Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
              placeholder="How you'd like to appear publicly"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-enostics-gray-300 font-medium">
              <Clock className="inline h-4 w-4 mr-1" />
              Timezone
            </Label>
            <Input
              id="timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
              placeholder="Your timezone"
            />
            <p className="text-xs text-enostics-gray-500">
              Used for API logs and activity timestamps
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-enostics-gray-300 font-medium">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
            className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white min-h-[80px] focus:border-enostics-purple focus:ring-enostics-purple/20"
            placeholder="Brief description about yourself or your endpoint usage..."
          />
          <p className="text-xs text-enostics-gray-500">
            Optional description that may appear in public endpoint documentation
          </p>
        </div>
      </div>
    </div>
  )

  const renderAccountSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Mail className="mr-3 h-6 w-6 text-enostics-purple" />
          Account Information
        </h2>
        <p className="text-enostics-gray-400 mb-6">
          Account details and setup status
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-enostics-gray-300 font-medium">Email Address</Label>
            <div className="flex items-center space-x-3 p-4 bg-enostics-gray-800/30 rounded-lg border border-enostics-gray-700/50">
              <Mail className="h-5 w-5 text-enostics-purple" />
              <span className="text-white font-medium">{profile?.email}</span>
            </div>
            <p className="text-xs text-enostics-gray-500">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-enostics-gray-300 font-medium">Account Created</Label>
            <div className="flex items-center space-x-3 p-4 bg-enostics-gray-800/30 rounded-lg border border-enostics-gray-700/50">
              <Calendar className="h-5 w-5 text-enostics-purple" />
              <span className="text-white font-medium">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Onboarding Status Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Setup Status</h3>
          
          <div className="bg-enostics-gray-800/30 rounded-lg border border-enostics-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {profile?.onboarding_completed ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-yellow-500" />
                )}
                <div>
                  <p className="text-white font-medium">
                    {profile?.onboarding_completed ? 'Setup Complete' : 'Setup Incomplete'}
                  </p>
                  <p className="text-sm text-enostics-gray-400">
                    {profile?.onboarding_completed 
                      ? 'Your endpoint is ready to receive data'
                      : 'Complete setup to unlock all endpoint features'
                    }
                  </p>
                </div>
              </div>
              
              {!profile?.onboarding_completed && (
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/onboarding'}
                  className="bg-enostics-purple hover:bg-enostics-purple/80"
                >
                  Continue Setup
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>

            {/* Step Progress */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-enostics-gray-300">Setup Steps:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'plan_confirmation', label: 'Plan Confirmation' },
                  { key: 'personal_info', label: 'Profile Information' },
                  { key: 'endpoint_setup', label: 'Endpoint Configuration' },
                  { key: 'welcome_tour', label: 'Platform Tour' }
                ].map(step => {
                  const completed = profile?.onboarding_steps?.[step.key as keyof typeof profile.onboarding_steps] || false
                  return (
                    <div key={step.key} className="flex items-center gap-2">
                      {completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-enostics-gray-500" />
                      )}
                      <span className={`text-sm ${completed ? 'text-green-400' : 'text-enostics-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Progress Bar */}
            {profile?.onboarding_steps && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-enostics-gray-400">Progress</span>
                  <span className="text-xs text-enostics-gray-400">
                    {Object.values(profile.onboarding_steps).filter(Boolean).length}/4 completed
                  </span>
                </div>
                <div className="w-full bg-enostics-gray-700 rounded-full h-2">
                  <div 
                    className="bg-enostics-purple h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(Object.values(profile.onboarding_steps).filter(Boolean).length / 4) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalSection()
      case 'account':
        return renderAccountSection()
      default:
        return renderPersonalSection()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-enostics-gray-400">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="flex h-full">
        {/* Sidebar */}
        <ProfileSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          username={formData.username}
          simplified={true}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <div className="space-y-8">
              {/* Active Section Content */}
              {renderActiveSection()}

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-enostics-purple hover:bg-enostics-purple/80"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 