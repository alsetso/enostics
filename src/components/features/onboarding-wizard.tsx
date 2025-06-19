'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  User,
  Globe,
  Sparkles,
  Zap,
  Copy,
  ExternalLink,
  Mail,
  Bell,
  Shield,
  Database,
  Activity,
  Webhook,
  Key,
  CheckCircle,
  Star,
  Rocket
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { PlanConfirmation } from './plan-confirmation'
import { EndpointSetup } from './endpoint-setup'
import { WelcomeTour } from './welcome-tour'

interface OnboardingWizardProps {
  user: any
  profile: any
  endpoint: any
  organization: any
  onComplete: () => void
  onUpdateProfile: (profile: any) => void
  onUpdateEndpoint: (endpoint: any) => void
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export function OnboardingWizard({
  user,
  profile,
  endpoint,
  organization,
  onComplete,
  onUpdateProfile,
  onUpdateEndpoint
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || profile?.username || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    job_title: profile?.job_title || '',
    company: profile?.company || '',
    timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    notification_preferences: {
      email_notifications: true,
      endpoint_alerts: true,
      usage_alerts: true,
      security_alerts: true
    }
  })

  const supabase = createClientSupabaseClient()

  // Define onboarding steps based on what needs to be completed
  const steps: OnboardingStep[] = [
    {
      id: 'plan_confirmation',
      title: 'Plan Confirmation',
      description: 'Review your selected plan and features',
      icon: <Star className="h-5 w-5" />,
      completed: profile?.onboarding_steps?.plan_confirmation || false
    },
    {
      id: 'personal_info',
      title: 'Personal Information',
      description: 'Complete your profile details',
      icon: <User className="h-5 w-5" />,
      completed: profile?.onboarding_steps?.personal_info || false
    },
    {
      id: 'endpoint_setup',
      title: 'Your Endpoint',
      description: 'Configure your personal API endpoint',
      icon: <Globe className="h-5 w-5" />,
      completed: profile?.onboarding_steps?.endpoint_setup || false
    },
    {
      id: 'welcome_tour',
      title: 'Welcome Tour',
      description: 'Learn about key features and get started',
      icon: <Sparkles className="h-5 w-5" />,
      completed: profile?.onboarding_steps?.welcome_tour || false
    }
  ]

  // Find first incomplete step
  useEffect(() => {
    const firstIncompleteIndex = steps.findIndex(step => !step.completed)
    if (firstIncompleteIndex !== -1) {
      setCurrentStep(firstIncompleteIndex)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
    }))
  }

  const nextStep = async () => {
    setIsTransitioning(true)
    await new Promise(resolve => setTimeout(resolve, 150))
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    await new Promise(resolve => setTimeout(resolve, 150))
    setIsTransitioning(false)
  }

  const prevStep = async () => {
    setIsTransitioning(true)
    await new Promise(resolve => setTimeout(resolve, 150))
    setCurrentStep(prev => Math.max(prev - 1, 0))
    await new Promise(resolve => setTimeout(resolve, 150))
    setIsTransitioning(false)
  }

  const completeStep = async (stepId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_steps: {
            ...profile.onboarding_steps,
            [stepId]: true
          }
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error completing step:', error)
        return false
      }

      // Update local profile state
      onUpdateProfile({
        ...profile,
        onboarding_steps: {
          ...profile.onboarding_steps,
          [stepId]: true
        }
      })

      return true
    } catch (err) {
      console.error('Error completing step:', err)
      return false
    }
  }

  const savePersonalInfo = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          job_title: formData.job_title,
          company: formData.company,
          timezone: formData.timezone,
          preferences: {
            ...profile.preferences,
            notification_preferences: formData.notification_preferences
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving profile:', error)
        return false
      }

      // Mark step as complete
      await completeStep('personal_info')
      return true
    } catch (err) {
      console.error('Error saving profile:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const copyEndpointUrl = async () => {
    if (endpoint) {
      const url = `https://api.enostics.com/v1/${endpoint.path}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStepAction = async () => {
    const currentStepData = steps[currentStep]
    
    switch (currentStepData.id) {
      case 'plan_confirmation':
        await completeStep('plan_confirmation')
        nextStep()
        break
        
      case 'personal_info':
        const saved = await savePersonalInfo()
        if (saved) {
          nextStep()
        }
        break
        
      case 'endpoint_setup':
        await completeStep('endpoint_setup')
        nextStep()
        break
        
      case 'welcome_tour':
        await completeStep('welcome_tour')
        onComplete()
        break
    }
  }

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-brand text-white' 
                    : 'bg-enostics-gray-800 text-enostics-gray-400'
                }`}>
                  {step.completed ? <Check className="h-5 w-5" /> : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-3 transition-all duration-300 ${
                    index < currentStep ? 'bg-brand' : 'bg-enostics-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{currentStepData.title}</h2>
            <p className="text-enostics-gray-400">{currentStepData.description}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card variant="glass" className="min-h-[500px]">
          <CardContent className="p-8">
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              
              {/* Plan Confirmation Step */}
              {currentStepData.id === 'plan_confirmation' && (
                <PlanConfirmation 
                  organization={organization}
                  profile={profile}
                />
              )}

              {/* Personal Information Step */}
              {currentStepData.id === 'personal_info' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="p-3 bg-brand/10 border border-brand/20 rounded-full w-fit mx-auto mb-4">
                      <User className="h-8 w-8 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Tell us about yourself</h3>
                    <p className="text-enostics-gray-400">This helps us personalize your experience</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="display_name">Display Name *</Label>
                      <Input
                        id="display_name"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleInputChange}
                        placeholder="How should we address you?"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleInputChange}
                        placeholder="Your role or profession"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Where do you work?"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us a bit about yourself and what you plan to use Enostics for..."
                      rows={3}
                      className="w-full px-4 py-3 bg-enostics-gray-900 border border-enostics-gray-700 rounded-lg text-white placeholder-enostics-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all duration-200"
                    />
                  </div>

                  {/* Notification Preferences */}
                  <div className="bg-enostics-gray-900/50 rounded-lg p-4 border border-enostics-gray-700/50">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notification Preferences
                    </h4>
                    <div className="space-y-3">
                      {[
                        { key: 'email_notifications', label: 'Email notifications', desc: 'Important updates and summaries' },
                        { key: 'endpoint_alerts', label: 'Endpoint alerts', desc: 'When your endpoint receives data' },
                        { key: 'usage_alerts', label: 'Usage alerts', desc: 'When approaching plan limits' },
                        { key: 'security_alerts', label: 'Security alerts', desc: 'Suspicious activity and security updates' }
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">{label}</div>
                            <div className="text-xs text-enostics-gray-400">{desc}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.notification_preferences[key as keyof typeof formData.notification_preferences]}
                              onChange={(e) => handleNotificationChange(key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-enostics-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Endpoint Setup Step */}
              {currentStepData.id === 'endpoint_setup' && (
                <EndpointSetup 
                  endpoint={endpoint}
                  organization={organization}
                  onCopy={copyEndpointUrl}
                  copied={copied}
                />
              )}

              {/* Welcome Tour Step */}
              {currentStepData.id === 'welcome_tour' && (
                <WelcomeTour 
                  endpoint={endpoint}
                  organization={organization}
                />
              )}

            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-8 border-t border-enostics-gray-800/50 mt-8">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleStepAction}
                className="flex-1"
                loading={loading}
              >
                {isLastStep ? (
                  <>
                    Complete Setup
                    <Rocket className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 