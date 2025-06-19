'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  X, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react'

interface OnboardingBannerProps {
  className?: string
}

export function OnboardingBanner({ className = '' }: OnboardingBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)
  const [onboardingProgress, setOnboardingProgress] = useState<{
    completed: number
    total: number
    nextStep: string
  } | null>(null)
  
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setIsLoading(false)
        return
      }

      // Get user profile and onboarding status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_steps, created_at')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        setIsLoading(false)
        return
      }

      // If onboarding is already completed, don't show banner
      if (profile.onboarding_completed) {
        setIsLoading(false)
        return
      }

      // Check if user was created recently (within last 7 days) and hasn't completed onboarding
      const createdAt = new Date(profile.created_at)
      const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceCreation > 7) {
        // Don't show banner for very old accounts
        setIsLoading(false)
        return
      }

      // Calculate onboarding progress
      const steps = profile.onboarding_steps || {}
      const stepKeys = ['plan_confirmation', 'personal_info', 'endpoint_setup', 'welcome_tour']
      const completedSteps = stepKeys.filter(key => steps[key]).length
      const totalSteps = stepKeys.length

      // Determine next step
      let nextStep = 'Get Started'
      if (!steps.plan_confirmation) nextStep = 'Confirm Plan'
      else if (!steps.personal_info) nextStep = 'Complete Profile'
      else if (!steps.endpoint_setup) nextStep = 'Setup Endpoint'
      else if (!steps.welcome_tour) nextStep = 'Take Tour'

      setOnboardingProgress({
        completed: completedSteps,
        total: totalSteps,
        nextStep
      })

      setShowBanner(true)
      setIsLoading(false)

    } catch (err) {
      console.error('Error checking onboarding status:', err)
      setIsLoading(false)
    }
  }

  const handleContinueOnboarding = () => {
    router.push('/onboarding')
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Store dismissal in localStorage to persist for session
    localStorage.setItem('onboarding_banner_dismissed', 'true')
  }

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = localStorage.getItem('onboarding_banner_dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  // Don't render if loading, not needed, or dismissed
  if (isLoading || !showBanner || isDismissed) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${className}`}>
      <div className="bg-gradient-to-r from-brand/20 to-purple-500/20 backdrop-blur-sm border border-brand/30 rounded-lg shadow-lg">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-brand/20 rounded-lg">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  Complete Setup
                </span>
                <button
                  onClick={handleDismiss}
                  className="p-1 text-enostics-gray-400 hover:text-white transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              
              {onboardingProgress && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-enostics-gray-400">
                    <CheckCircle className="h-3 w-3 text-enostics-green" />
                    <span>{onboardingProgress.completed}/{onboardingProgress.total} steps</span>
                    <span>•</span>
                    <span>Next: {onboardingProgress.nextStep}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-enostics-gray-800 rounded-full h-1.5">
                    <div 
                      className="h-full bg-brand transition-all duration-300 rounded-full"
                      style={{ 
                        width: `${(onboardingProgress.completed / onboardingProgress.total) * 100}%` 
                      }}
                    />
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={handleContinueOnboarding}
                    className="w-full h-8 text-xs mt-3"
                  >
                    Continue Setup
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 