'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientSupabaseClient } from '@/lib/supabase'
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Check,
  Zap,
  Database,
  Shield,
  Globe,
  CheckCircle
} from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

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
    setMessage('')
    
    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback',
          data: {
            username: formData.username,
            full_name: formData.username
          }
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'This email is already registered. Try signing in instead.' })
        } else {
          setErrors({ general: error.message })
        }
      } else {
        // Check if email confirmation is required
        if (data.user && !data.session) {
          setSuccess(true)
          setMessage(`Please check your email (${formData.email}) and click the confirmation link to complete your registration.`)
        } else if (data.session && data.user) {
          // User is immediately signed in (email confirmation disabled)
          setSuccess(true)
          setMessage('Account created successfully! Redirecting to dashboard...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      }
    } catch (err) {
      console.error('Registration error:', err)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper variant="public" navbarVariant="docs">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-3 bg-enostics-gray-900 border border-enostics-gray-700 rounded-xl">
            <User className="h-8 w-8 text-enostics-blue" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            Create Your Account
          </h1>
        </div>
        <p className="text-xl text-enostics-gray-300 max-w-2xl mx-auto">
          Join thousands of users building intelligent automation with personal API endpoints. 
          Get started in less than 5 minutes.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Registration Form */}
          <Card className="bg-enostics-gray-900 border-enostics-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Sign Up</CardTitle>
              <p className="text-enostics-gray-400">
                Create your free account and claim your endpoint
              </p>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-enostics-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Registration Successful!</h3>
                  <p className="text-enostics-gray-300">{message}</p>
                  <div className="pt-4">
                    <a 
                      href="/login" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-enostics-blue hover:bg-enostics-blue-dark rounded-lg text-white font-medium transition-colors"
                    >
                      Go to Sign In
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username */}
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
                        className={`w-full px-4 py-3 pl-12 bg-enostics-gray-800 border rounded-lg text-white placeholder-enostics-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.username 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-enostics-gray-600 focus:ring-enostics-blue focus:border-enostics-blue'
                        }`}
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                    )}
                    <p className="mt-1 text-xs text-enostics-gray-500">
                      Your endpoint will be: api.enostics.com/v1/{formData.username || 'username'}
                    </p>
                  </div>

                  {/* Email */}
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
                        className={`w-full px-4 py-3 pl-12 bg-enostics-gray-800 border rounded-lg text-white placeholder-enostics-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.email 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-enostics-gray-600 focus:ring-enostics-blue focus:border-enostics-blue'
                        }`}
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
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
                        className={`w-full px-4 py-3 pl-12 bg-enostics-gray-800 border rounded-lg text-white placeholder-enostics-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.password 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-enostics-gray-600 focus:ring-enostics-blue focus:border-enostics-blue'
                        }`}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
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
                        className={`w-full px-4 py-3 pl-12 bg-enostics-gray-800 border rounded-lg text-white placeholder-enostics-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.confirmPassword 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-enostics-gray-600 focus:ring-enostics-blue focus:border-enostics-blue'
                        }`}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enostics-gray-400" />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Error Messages */}
                  {errors.general && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                      <p className="text-sm text-red-400">{errors.general}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      isLoading
                        ? 'bg-enostics-blue/50 cursor-wait'
                        : 'bg-enostics-blue hover:bg-enostics-blue-dark hover:scale-105'
                    } text-white`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  {/* Login Link */}
                  <div className="text-center text-sm">
                    <span className="text-enostics-gray-400">Already have an account? </span>
                    <a href="/login" className="text-enostics-blue hover:text-enostics-blue-light transition-colors">
                      Sign in
                    </a>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Why Choose Enostics?</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-enostics-blue/20 rounded-lg">
                    <Zap className="h-6 w-6 text-enostics-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Lightning Fast Setup</h3>
                    <p className="text-enostics-gray-400">
                      Get your personal API endpoint up and running in under 5 minutes. No complex configuration required.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-enostics-green/20 rounded-lg">
                    <Shield className="h-6 w-6 text-enostics-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Enterprise Security</h3>
                    <p className="text-enostics-gray-400">
                      Bank-grade encryption, API key management, and rate limiting keep your data safe and secure.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-enostics-purple/20 rounded-lg">
                    <Database className="h-6 w-6 text-enostics-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Intelligent Processing</h3>
                    <p className="text-enostics-gray-400">
                      Automatic data classification, real-time analytics, and smart automation for your incoming data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-enostics-amber/20 rounded-lg">
                    <Globe className="h-6 w-6 text-enostics-amber" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Global Accessibility</h3>
                    <p className="text-enostics-gray-400">
                      Your endpoint is accessible worldwide with 99.9% uptime and automatic scaling.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What You Get */}
            <Card className="bg-enostics-gray-900/50 border-enostics-gray-700">
              <CardHeader>
                <CardTitle className="text-white">What You Get</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-enostics-green" />
                    <span className="text-enostics-gray-300">Personal API endpoint</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-enostics-green" />
                    <span className="text-enostics-gray-300">Unlimited requests</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-enostics-green" />
                    <span className="text-enostics-gray-300">Real-time analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-enostics-green" />
                    <span className="text-enostics-gray-300">Webhook automation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-enostics-green" />
                    <span className="text-enostics-gray-300">API key management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-enostics-green" />
                    <span className="text-enostics-gray-300">24/7 support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
} 