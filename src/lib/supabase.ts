import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client
export const createClientSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug logging
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlLength: supabaseUrl?.length,
    keyLength: supabaseKey?.length
  })

  if (!supabaseUrl) {
    throw new Error('supabaseUrl is required')
  }
  
  if (!supabaseKey) {
    throw new Error('supabaseKey is required')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

// Server-side Supabase client - only use this in Server Components
export const createServerSupabaseClient = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Admin Supabase client (for server-side operations only)
export const getSupabaseAdmin = () => {
  // Only create admin client on server side
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should only be used on server side')
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          role: 'consumer' | 'provider' | 'org_admin' | 'developer'
          full_name: string | null
          avatar_url: string | null
          organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'consumer' | 'provider' | 'org_admin' | 'developer'
          full_name?: string | null
          avatar_url?: string | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'consumer' | 'provider' | 'org_admin' | 'developer'
          full_name?: string | null
          avatar_url?: string | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enostics_endpoints: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          url_path: string
          is_active: boolean
          auth_type: string
          settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          url_path: string
          is_active?: boolean
          auth_type?: string
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          url_path?: string
          is_active?: boolean
          auth_type?: string
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      enostics_data: {
        Row: {
          id: string
          endpoint_id: string
          data: Record<string, any>
          source_ip: string | null
          headers: Record<string, any> | null
          processed_at: string
          status: string
        }
        Insert: {
          id?: string
          endpoint_id: string
          data: Record<string, any>
          source_ip?: string | null
          headers?: Record<string, any> | null
          processed_at?: string
          status?: string
        }
        Update: {
          id?: string
          endpoint_id?: string
          data?: Record<string, any>
          source_ip?: string | null
          headers?: Record<string, any> | null
          processed_at?: string
          status?: string
        }
      }
      enostics_api_keys: {
        Row: {
          id: string
          user_id: string
          endpoint_id: string | null
          key_hash: string
          key_prefix: string
          name: string
          is_active: boolean
          last_used_at: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint_id?: string | null
          key_hash: string
          key_prefix: string
          name: string
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint_id?: string | null
          key_hash?: string
          key_prefix?: string
          name?: string
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
          expires_at?: string
        }
      }
    }
  }
} 