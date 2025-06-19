import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      try {
        // Check if user needs onboarding
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed, username, created_at')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          return NextResponse.redirect(`${origin}/dashboard`)
        }

        // If user just registered (profile created within last 5 minutes) and hasn't completed onboarding
        const isNewUser = profile && new Date(profile.created_at) > new Date(Date.now() - 5 * 60 * 1000)
        const needsOnboarding = !profile?.onboarding_completed

        if (isNewUser && needsOnboarding) {
          // New user - redirect to onboarding
          return NextResponse.redirect(`${origin}/onboarding`)
        } else {
          // Existing user - go to dashboard
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      } catch (err) {
        console.error('Error in auth callback:', err)
        // Fall back to dashboard on any error
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 