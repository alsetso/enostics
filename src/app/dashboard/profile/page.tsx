'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Mail, Calendar, Save, MapPin, Clock, Phone, Briefcase, Building, Award, Heart, Smile } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import ProfileSidebar from '@/components/layout/profile-sidebar'
import EmojiPicker from '@/components/ui/emoji-picker'

interface Profile {
  id: string
  email: string
  full_name: string
  username: string
  display_name: string
  bio: string
  location: string
  timezone: string
  phone: string
  avatar_url: string
  profile_emoji: string
  job_title: string
  company: string
  industry: string
  interests: string[]
  expertise: string[]
  created_at: string
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
    location: '',
    timezone: '',
    phone: '',
    avatar_url: '',
    profile_emoji: '',
    job_title: '',
    company: '',
    industry: '',
    interests: '',
    expertise: ''
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
        location: data.location || '',
        timezone: data.timezone || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
        profile_emoji: data.profile_emoji || '',
        job_title: data.job_title || '',
        company: data.company || '',
        industry: data.industry || '',
        interests: Array.isArray(data.interests) ? data.interests.join(', ') : '',
        expertise: Array.isArray(data.expertise) ? data.expertise.join(', ') : ''
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
      // Convert comma-separated strings back to arrays
      const interestsArray = formData.interests
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
      
      const expertiseArray = formData.expertise
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          timezone: formData.timezone,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
          profile_emoji: formData.profile_emoji,
          job_title: formData.job_title,
          company: formData.company,
          industry: formData.industry,
          interests: interestsArray,
          expertise: expertiseArray,
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
          Personal Information
        </h2>
        <p className="text-enostics-gray-400 mb-6">
          Basic information and contact details
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
              placeholder="Enter your full name"
            />
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
              placeholder="How you'd like to be shown"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-enostics-gray-300 font-medium">
              Username
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
              placeholder="Enter your username"
            />
            <div className="flex items-center gap-2 text-xs text-enostics-gray-500 bg-enostics-gray-800/30 p-2 rounded">
              <span>Your endpoint:</span>
              <code className="text-enostics-purple font-mono">
                enostics.com/api/{formData.username || 'your-username'}
              </code>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_emoji" className="text-enostics-gray-300 font-medium">
              <Smile className="inline h-4 w-4 mr-1" />
              Profile Emoji
            </Label>
            <EmojiPicker
              value={formData.profile_emoji}
              onChange={(emoji) => setFormData({ ...formData, profile_emoji: emoji })}
              placeholder="😊"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-enostics-gray-300 font-medium">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-enostics-gray-300 font-medium">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar_url" className="text-enostics-gray-300 font-medium">
            Avatar URL
          </Label>
          <Input
            id="avatar_url"
            value={formData.avatar_url}
            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
            className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
            placeholder="https://example.com/your-avatar.jpg"
          />
          <p className="text-xs text-enostics-gray-500">
            URL to your profile picture
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-enostics-gray-300 font-medium">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
            className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white min-h-[100px] focus:border-enostics-purple focus:ring-enostics-purple/20"
            placeholder="Tell us about yourself..."
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
            placeholder="e.g., America/New_York, Europe/London"
          />
        </div>
      </div>
    </div>
  )

  const renderProfessionalSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Briefcase className="mr-3 h-6 w-6 text-enostics-purple" />
          Professional Information
        </h2>
        <p className="text-enostics-gray-400 mb-6">
          Work and career information
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="job_title" className="text-enostics-gray-300 font-medium">
              Job Title
            </Label>
            <Input
              id="job_title"
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
              placeholder="Software Engineer, Doctor, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-enostics-gray-300 font-medium">
              <Building className="inline h-4 w-4 mr-1" />
              Company
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
              placeholder="Your company name"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="industry" className="text-enostics-gray-300 font-medium">
              Industry
            </Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white focus:border-enostics-purple focus:ring-enostics-purple/20"
              placeholder="Healthcare, Technology, Finance, etc."
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderInterestsSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Heart className="mr-3 h-6 w-6 text-enostics-purple" />
          Skills & Interests
        </h2>
        <p className="text-enostics-gray-400 mb-6">
          Your expertise and interests
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="interests" className="text-enostics-gray-300 font-medium">
            Interests
          </Label>
          <Textarea
            id="interests"
            value={formData.interests}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, interests: e.target.value })}
            className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white min-h-[80px] focus:border-enostics-purple focus:ring-enostics-purple/20"
            placeholder="Health, Technology, AI, Fitness, Reading (separate with commas)"
          />
          <p className="text-xs text-enostics-gray-500">
            Separate multiple interests with commas
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expertise" className="text-enostics-gray-300 font-medium">
            <Award className="inline h-4 w-4 mr-1" />
            Expertise
          </Label>
          <Textarea
            id="expertise"
            value={formData.expertise}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, expertise: e.target.value })}
            className="bg-enostics-gray-800/50 border-enostics-gray-600 text-white min-h-[80px] focus:border-enostics-purple focus:ring-enostics-purple/20"
            placeholder="JavaScript, Healthcare Analytics, Machine Learning (separate with commas)"
          />
          <p className="text-xs text-enostics-gray-500">
            Separate multiple areas of expertise with commas
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
          Email and account details
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
      </div>
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalSection()
      case 'professional':
        return renderProfessionalSection()
      case 'interests':
        return renderInterestsSection()
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