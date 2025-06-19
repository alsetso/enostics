'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClientSupabaseClient } from '@/lib/supabase'
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  Zap,
  Database,
  Shield,
  Globe,
  CheckCircle,
  Mail,
  User,
  Lock,
  Sparkles,
  Users,
  Building
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

const plans: Plan[] = [
  {
    id: 'citizen',
    name: 'Citizen',
    price: 0,
    period: 'forever',
    description: 'Perfect for personal data management',
    icon: <User className="h-6 w-6" />,
    features: [
      '1 personal endpoint',
      '1,000 requests/month',
      'Basic data classification',
      'Standard support'
    ]
  },
  {
    id: 'developer',
    name: 'Developer',
    price: 29,
    period: 'month',
    description: 'For developers building on Enostics',
    icon: <Sparkles className="h-6 w-6" />,
    features: [
      '5 endpoints',
      '50,000 requests/month',
      'Advanced data classification',
      'AI-powered insights',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    period: 'month',
    description: 'For teams and organizations',
    icon: <Building className="h-6 w-6" />,
    features: [
      'Unlimited endpoints',
      '500,000 requests/month',
      'Enterprise classification',
      'Dedicated support',
      'Team management'
    ]
  }
]

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState('citizen')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [registrationEmail, setRegistrationEmail] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    
    try {
      // Get selected plan details for metadata
      const selectedPlanDetails = plans.find(p => p.id === selectedPlan)
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback',
          data: {
            username: formData.username,
            full_name: formData.username,
            display_name: formData.username,
            selected_plan: selectedPlan,
            plan_tier: selectedPlan,
            plan_name: selectedPlanDetails?.name || 'Citizen',
            plan_price: selectedPlanDetails?.price || 0,
            plan_period: selectedPlanDetails?.period || 'forever',
            registration_source: 'web_registration',
            registration_timestamp: new Date().toISOString(),
            endpoint_path: formData.username
          }
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'This email is already registered. Try signing in instead.' })
        } else if (error.message.includes('invalid email')) {
          setErrors({ email: 'Please enter a valid email address.' })
        } else if (error.message.includes('password')) {
          setErrors({ password: 'Password must be at least 8 characters long.' })
        } else {
          setErrors({ general: error.message })
        }
      } else {
        setRegistrationEmail(formData.email)
        nextStep()
      }
    } catch (err) {
      console.error('Registration error:', err)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = async () => {
    setIsTransitioning(true)
    await new Promise(resolve => setTimeout(resolve, 150))
    setCurrentStep(prev => Math.min(prev + 1, 4))
    await new Promise(resolve => setTimeout(resolve, 150))
    setIsTransitioning(false)
  }

  const prevStep = async () => {
    setIsTransitioning(true)
    await new Promise(resolve => setTimeout(resolve, 150))
    setCurrentStep(prev => Math.max(prev - 1, 1))
    await new Promise(resolve => setTimeout(resolve, 150))
    setIsTransitioning(false)
  }

  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast Setup',
      description: 'Get your personal API endpoint running in under 5 minutes'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and API key management'
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Intelligent Processing',
      description: 'Automatic data classification and real-time analytics'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Global Accessibility',
      description: 'Worldwide access with 99.9% uptime guarantee'
    }
  ]

  const formatPrice = (price: number, period: string) => {
    if (price === 0) return 'Free'
    return `$${price}/${period}`
  }

  return (
    <div className="min-h-screen bg-enostics-gray-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  step <= currentStep 
                    ? 'bg-brand text-white' 
                    : 'bg-enostics-gray-800 text-enostics-gray-400'
                }`}>
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all duration-200 ${
                    step < currentStep ? 'bg-brand' : 'bg-enostics-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-enostics-gray-400">
              Step {currentStep} of 4
            </p>
          </div>
        </div>

        <Card variant="glass" className="min-h-[500px]">
          <CardContent className="p-8">
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              
              {/* Step 1: Why Choose Enostics */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">
                      Welcome to Enostics
                    </h1>
                    <p className="text-lg text-enostics-gray-300">
                      Your universal personal API layer
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex flex-col items-center text-center p-4 bg-enostics-gray-900/50 rounded-xl border border-enostics-gray-700/50">
                        <div className="p-2 bg-brand/10 border border-brand/20 rounded-lg text-brand mb-3">
                          {benefit.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1 text-sm">
                            {benefit.title}
                          </h3>
                          <p className="text-xs text-enostics-gray-400">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={nextStep}
                    className="w-full"
                    size="lg"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Step 2: Plan Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Choose Your Plan
                    </h2>
                    <p className="text-enostics-gray-400">
                      Select the plan that fits your needs
                    </p>
                  </div>

                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          selectedPlan === plan.id
                            ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                            : 'border-enostics-gray-700/50 bg-enostics-gray-900/50 hover:border-enostics-gray-600/50'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <span className="px-3 py-1 bg-brand text-white text-xs font-medium rounded-full">
                              Most Popular
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            selectedPlan === plan.id ? 'bg-brand/20 text-brand' : 'bg-enostics-gray-800 text-enostics-gray-400'
                          }`}>
                            {plan.icon}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-white">{plan.name}</h3>
                              <div className="text-right">
                                <div className="text-lg font-bold text-white">
                                  {formatPrice(plan.price, plan.period)}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-enostics-gray-400 mb-3">
                              {plan.description}
                            </p>
                            
                            <div className="space-y-1">
                              {plan.features.slice(0, 3).map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs text-enostics-gray-300">
                                  <Check className="h-3 w-3 text-enostics-green" />
                                  {feature}
                                </div>
                              ))}
                              {plan.features.length > 3 && (
                                <div className="text-xs text-enostics-gray-500">
                                  +{plan.features.length - 3} more features
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === plan.id
                              ? 'border-brand bg-brand'
                              : 'border-enostics-gray-600'
                          }`}>
                            {selectedPlan === plan.id && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      className="flex-1"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Registration Form */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Create Your Account
                    </h2>
                    <p className="text-enostics-gray-400">
                      Claim your personal endpoint
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="your-username"
                          className={`w-full px-4 py-3 pl-12 bg-enostics-gray-900 border rounded-lg text-white placeholder-enostics-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.username 
                              ? 'border-enostics-red focus:ring-enostics-red/50' 
                              : 'border-enostics-gray-700 focus:ring-brand/50 focus:border-brand'
                          }`}
                        />
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                      </div>
                      {errors.username && (
                        <p className="mt-1 text-sm text-enostics-red">{errors.username}</p>
                      )}
                      <p className="mt-1 text-xs text-enostics-gray-500">
                        Your endpoint: api.enostics.com/v1/{formData.username || 'username'}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          className={`w-full px-4 py-3 pl-12 bg-enostics-gray-900 border rounded-lg text-white placeholder-enostics-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.email 
                              ? 'border-enostics-red focus:ring-enostics-red/50' 
                              : 'border-enostics-gray-700 focus:ring-brand/50 focus:border-brand'
                          }`}
                        />
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-enostics-red">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 pl-12 bg-enostics-gray-900 border rounded-lg text-white placeholder-enostics-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.password 
                              ? 'border-enostics-red focus:ring-enostics-red/50' 
                              : 'border-enostics-gray-700 focus:ring-brand/50 focus:border-brand'
                          }`}
                        />
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-enostics-red">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 pl-12 bg-enostics-gray-900 border rounded-lg text-white placeholder-enostics-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.confirmPassword 
                              ? 'border-enostics-red focus:ring-enostics-red/50' 
                              : 'border-enostics-gray-700 focus:ring-brand/50 focus:border-brand'
                          }`}
                        />
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-enostics-red">{errors.confirmPassword}</p>
                      )}
                    </div>

                    {errors.general && (
                      <div className="rounded-lg bg-enostics-red/10 border border-enostics-red/20 p-3">
                        <p className="text-sm text-enostics-red">{errors.general}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        loading={isLoading}
                      >
                        Create Account
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>

                  <div className="text-center text-sm pt-4 border-t border-enostics-gray-800/50">
                    <span className="text-enostics-gray-400">Already have an account? </span>
                    <button
                      onClick={() => router.push('/login')}
                      className="text-brand hover:text-brand-light transition-colors"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Email Confirmation */}
              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="p-4 bg-enostics-green/10 border border-enostics-green/20 rounded-full">
                      <CheckCircle className="h-16 w-16 text-enostics-green" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Check Your Email
                    </h2>
                    <p className="text-enostics-gray-300 mb-2">
                      We've sent a confirmation link to:
                    </p>
                    <p className="text-brand font-medium mb-6">
                      {registrationEmail}
                    </p>
                    <p className="text-sm text-enostics-gray-400">
                      Click the link in your email to activate your account and start using your personal API endpoint.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push('/login')}
                      className="w-full"
                      size="lg"
                    >
                      Go to Sign In
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep(3)}
                      className="w-full text-enostics-gray-400 hover:text-white"
                    >
                      Didn't receive the email? Try again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 