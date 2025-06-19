'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'
import { OnboardingWizard } from '@/components/features/onboarding-wizard'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  display_name: string
  full_name: string
  onboarding_completed: boolean
  onboarding_steps: {
    personal_info: boolean
    endpoint_setup: boolean
    welcome_tour: boolean
    plan_confirmation: boolean
  }
  preferences: {
    selected_plan?: string
    plan_name?: string
    registration_source?: string
  }
}

interface UserEndpoint {
  id: string
  name: string
  path: string
  is_active: boolean
  settings: any
}

interface UserOrganization {
  id: string
  name: string
  plan: string
  usage_limits: any
}

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [endpoint, setEndpoint] = useState<UserEndpoint | null>(null)
  const [organization, setOrganization] = useState<UserOrganization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Auth error:', authError)
        router.push('/login')
        return
      }

      setUser(user)

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        setError('Unable to load your profile. Please try refreshing the page.')
        return
      }

      // If onboarding is already completed, redirect to dashboard
      if (profileData.onboarding_completed) {
        router.push('/dashboard')
        return
      }

      setProfile(profileData)

      // Get user's endpoint
      const { data: endpointData, error: endpointError } = await supabase
        .from('endpoints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (!endpointError && endpointData) {
        setEndpoint(endpointData)
      }

      // Get user's organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('created_by', user.id)
        .single()

      if (!orgError && orgData) {
        setOrganization(orgData)
      }

    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Something went wrong. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = async () => {
    try {
      // Mark onboarding as complete
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error completing onboarding:', error)
        return
      }

      // Log completion
      await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          organization_id: organization?.id,
          action: 'onboarding_completed',
          details: {
            completed_at: new Date().toISOString(),
            plan: organization?.plan,
            endpoint_created: !!endpoint
          }
        })

      // Clear any banner dismissal from localStorage since onboarding is now complete
      localStorage.removeItem('onboarding_banner_dismissed')

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Error completing onboarding:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-enostics-gray-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-enostics-gray-400">Setting up your account...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-enostics-gray-950 flex items-center justify-center px-4">
        <Card variant="glass" className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-enostics-red mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-enostics-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-light transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-enostics-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-enostics-gray-400">Unable to load your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-enostics-gray-950">
      <OnboardingWizard
        user={user}
        profile={profile}
        endpoint={endpoint}
        organization={organization}
        onComplete={handleOnboardingComplete}
        onUpdateProfile={setProfile}
        onUpdateEndpoint={setEndpoint}
      />
    </div>
  )
} 