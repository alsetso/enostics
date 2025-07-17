import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Add timeout to prevent hanging requests
    const userPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    })

    const { data: { user }, error } = await Promise.race([userPromise, timeoutPromise]) as any

    // Log authentication status for debugging
    console.log(`[Middleware] Path: ${req.nextUrl.pathname}, User: ${user?.id || 'none'}, Error: ${error?.message || 'none'}`)

    // If there's an auth error, allow the request to proceed and let client-side handle it
    if (error) {
      console.warn(`[Middleware] Auth error: ${error.message}`)
      // Don't redirect on auth errors - let client handle it
      return response
    }

    // If user is signed in and tries to access auth pages, redirect to dashboard
    if (user && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
      console.log(`[Middleware] Redirecting authenticated user from ${req.nextUrl.pathname} to /dashboard`)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is not signed in and tries to access protected routes, redirect to login
    if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
      console.log(`[Middleware] Redirecting unauthenticated user from ${req.nextUrl.pathname} to /login`)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return response
  } catch (error) {
    console.error(`[Middleware] Unexpected error: ${error}`)
    // On unexpected errors, allow the request to proceed
    return response
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register'
  ]
} 