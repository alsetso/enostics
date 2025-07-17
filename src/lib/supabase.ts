import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client
export const createClientSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Environment validation (removed debug logging for production)
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
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          full_name: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          timezone: string | null
          job_title: string | null
          company: string | null
          industry: string | null
          phone: string | null
          years_of_experience: number | null
          interests: string[] | null
          expertise: string[] | null
          
          // Consolidated preferences (was user_settings table)
          preferences: Record<string, any> | null
          notification_settings: Record<string, any> | null
          privacy_settings: Record<string, any> | null
          ui_settings: Record<string, any> | null
          
          // Consolidated onboarding (was onboarding table)
          onboarding_completed: boolean | null
          onboarding_steps: Record<string, any> | null
          onboarding_completed_at: string | null
          
          // Business/subscription info
          plan_tier: string | null
          subscription_id: string | null
          organization_id: string | null
          
          // Metadata
          created_at: string
          updated_at: string
          last_active_at: string | null
          profile_completed_at: string | null
          
          // Legacy fields (keep for backward compatibility)
          profile_emoji: string | null
          public_id: string | null
          show_full_name: boolean | null
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          full_name: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          timezone?: string | null
          job_title?: string | null
          company?: string | null
          industry?: string | null
          phone?: string | null
          years_of_experience?: number | null
          interests?: string[] | null
          expertise?: string[] | null
          
          // Consolidated preferences
          preferences?: Record<string, any> | null
          notification_settings?: Record<string, any> | null
          privacy_settings?: Record<string, any> | null
          ui_settings?: Record<string, any> | null
          
          // Consolidated onboarding
          onboarding_completed?: boolean | null
          onboarding_steps?: Record<string, any> | null
          onboarding_completed_at?: string | null
          
          // Business/subscription info
          plan_tier?: string | null
          subscription_id?: string | null
          organization_id?: string | null
          
          // Metadata
          created_at?: string
          updated_at?: string
          last_active_at?: string | null
          profile_completed_at?: string | null
          
          // Legacy fields
          profile_emoji?: string | null
          public_id?: string | null
          show_full_name?: boolean | null
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          full_name?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          timezone?: string | null
          job_title?: string | null
          company?: string | null
          industry?: string | null
          phone?: string | null
          years_of_experience?: number | null
          interests?: string[] | null
          expertise?: string[] | null
          
          // Consolidated preferences
          preferences?: Record<string, any> | null
          notification_settings?: Record<string, any> | null
          privacy_settings?: Record<string, any> | null
          ui_settings?: Record<string, any> | null
          
          // Consolidated onboarding
          onboarding_completed?: boolean | null
          onboarding_steps?: Record<string, any> | null
          onboarding_completed_at?: string | null
          
          // Business/subscription info
          plan_tier?: string | null
          subscription_id?: string | null
          organization_id?: string | null
          
          // Metadata
          created_at?: string
          updated_at?: string
          last_active_at?: string | null
          profile_completed_at?: string | null
          
          // Legacy fields
          profile_emoji?: string | null
          public_id?: string | null
          show_full_name?: boolean | null
        }
      }
      endpoints: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          url_path: string
          is_active: boolean | null
          auth_type: string | null
          settings: Record<string, any> | null
          data_filters: Record<string, any> | null
          ai_processing_enabled: boolean | null
          ai_settings: Record<string, any> | null
          rate_limit_per_hour: number | null
          total_requests: number | null
          last_request_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          description?: string | null
          url_path: string
          is_active?: boolean | null
          auth_type?: string | null
          settings?: Record<string, any> | null
          data_filters?: Record<string, any> | null
          ai_processing_enabled?: boolean | null
          ai_settings?: Record<string, any> | null
          rate_limit_per_hour?: number | null
          total_requests?: number | null
          last_request_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          url_path?: string
          is_active?: boolean | null
          auth_type?: string | null
          settings?: Record<string, any> | null
          data_filters?: Record<string, any> | null
          ai_processing_enabled?: boolean | null
          ai_settings?: Record<string, any> | null
          rate_limit_per_hour?: number | null
          total_requests?: number | null
          last_request_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      data: {
        Row: {
          id: string
          endpoint_id: string
          data: Record<string, any>
          source_ip: string | null
          headers: Record<string, any> | null
          user_agent: string | null
          content_type: string | null
          data_size: number | null
          processed_at: string | null
          processed_by_ai: boolean | null
          ai_insights: Record<string, any> | null
          status: string | null
          tags: string[] | null
          is_favorite: boolean | null
          is_archived: boolean | null
          // Add inbox columns
          is_read: boolean | null
          is_starred: boolean | null
          subject: string | null
          preview: string | null
          source: string | null
          type: string | null
          enriched_data: Record<string, any> | null
          sender_info: Record<string, any> | null
          data_quality_score: number | null
          business_context: string | null
          key_fields: string[] | null
          sensitive_data: boolean | null
          user_notes: string | null
          user_category: string | null
          auto_tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          endpoint_id: string
          data: Record<string, any>
          source_ip?: string | null
          headers?: Record<string, any> | null
          user_agent?: string | null
          content_type?: string | null
          data_size?: number | null
          processed_at?: string | null
          processed_by_ai?: boolean | null
          ai_insights?: Record<string, any> | null
          status?: string | null
          tags?: string[] | null
          is_favorite?: boolean | null
          is_archived?: boolean | null
          // Add inbox columns
          is_read?: boolean | null
          is_starred?: boolean | null
          subject?: string | null
          preview?: string | null
          source?: string | null
          type?: string | null
          enriched_data?: Record<string, any> | null
          sender_info?: Record<string, any> | null
          data_quality_score?: number | null
          business_context?: string | null
          key_fields?: string[] | null
          sensitive_data?: boolean | null
          user_notes?: string | null
          user_category?: string | null
          auto_tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          endpoint_id?: string
          data?: Record<string, any>
          source_ip?: string | null
          headers?: Record<string, any> | null
          user_agent?: string | null
          content_type?: string | null
          data_size?: number | null
          processed_at?: string | null
          processed_by_ai?: boolean | null
          ai_insights?: Record<string, any> | null
          status?: string | null
          tags?: string[] | null
          is_favorite?: boolean | null
          is_archived?: boolean | null
          // Add inbox columns
          is_read?: boolean | null
          is_starred?: boolean | null
          subject?: string | null
          preview?: string | null
          source?: string | null
          type?: string | null
          enriched_data?: Record<string, any> | null
          sender_info?: Record<string, any> | null
          data_quality_score?: number | null
          business_context?: string | null
          key_fields?: string[] | null
          sensitive_data?: boolean | null
          user_notes?: string | null
          user_category?: string | null
          auto_tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      data_processor: {
        Row: {
          id: string
          user_id: string
          endpoint_id: string
          source_data_id: string
          processing_plan: string
          priority: number
          status: string
          ai_models_enabled: string[]
          ai_processing_level: string
          custom_ai_prompt: string | null
          ai_temperature: number
          business_domain: string | null
          data_classification: string | null
          sensitivity_level: string
          compliance_requirements: string[]
          workflow_steps: Record<string, any>
          current_step: number
          parallel_processing: boolean
          retry_strategy: string
          data_quality_threshold: number
          validation_rules: Record<string, any>
          enrichment_sources: string[]
          estimated_processing_time_seconds: number | null
          actual_processing_time_seconds: number | null
          resource_allocation: string
          cost_estimate_cents: number | null
          actual_cost_cents: number | null
          retry_count: number
          max_retries: number
          error_threshold: number
          fallback_strategy: string
          user_instructions: string | null
          processing_context: Record<string, any>
          user_tags: string[]
          auto_tags: string[]
          scheduled_for: string | null
          queued_at: string
          started_at: string | null
          completed_at: string | null
          expires_at: string | null
          processing_results: Record<string, any>
          extracted_entities: Record<string, any>
          insights_generated: string[]
          confidence_scores: Record<string, any>
          webhook_urls: string[]
          notification_settings: Record<string, any>
          downstream_systems: string[]
          processing_logs: Record<string, any>[]
          data_lineage: Record<string, any>
          compliance_checks: Record<string, any>
          audit_trail: Record<string, any>[]
          processing_metadata: Record<string, any>
          model_versions: Record<string, any>
          performance_metrics: Record<string, any>
          user_feedback_score: number | null
          organization_id: string | null
          team_assignment: string | null
          approval_required: boolean
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint_id: string
          source_data_id: string
          processing_plan?: string
          priority?: number
          status?: string
          ai_models_enabled?: string[]
          ai_processing_level?: string
          custom_ai_prompt?: string | null
          ai_temperature?: number
          business_domain?: string | null
          data_classification?: string | null
          sensitivity_level?: string
          compliance_requirements?: string[]
          workflow_steps?: Record<string, any>
          current_step?: number
          parallel_processing?: boolean
          retry_strategy?: string
          data_quality_threshold?: number
          validation_rules?: Record<string, any>
          enrichment_sources?: string[]
          estimated_processing_time_seconds?: number | null
          actual_processing_time_seconds?: number | null
          resource_allocation?: string
          cost_estimate_cents?: number | null
          actual_cost_cents?: number | null
          retry_count?: number
          max_retries?: number
          error_threshold?: number
          fallback_strategy?: string
          user_instructions?: string | null
          processing_context?: Record<string, any>
          user_tags?: string[]
          auto_tags?: string[]
          scheduled_for?: string | null
          queued_at?: string
          started_at?: string | null
          completed_at?: string | null
          expires_at?: string | null
          processing_results?: Record<string, any>
          extracted_entities?: Record<string, any>
          insights_generated?: string[]
          confidence_scores?: Record<string, any>
          webhook_urls?: string[]
          notification_settings?: Record<string, any>
          downstream_systems?: string[]
          processing_logs?: Record<string, any>[]
          data_lineage?: Record<string, any>
          compliance_checks?: Record<string, any>
          audit_trail?: Record<string, any>[]
          processing_metadata?: Record<string, any>
          model_versions?: Record<string, any>
          performance_metrics?: Record<string, any>
          user_feedback_score?: number | null
          organization_id?: string | null
          team_assignment?: string | null
          approval_required?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint_id?: string
          source_data_id?: string
          processing_plan?: string
          priority?: number
          status?: string
          ai_models_enabled?: string[]
          ai_processing_level?: string
          custom_ai_prompt?: string | null
          ai_temperature?: number
          business_domain?: string | null
          data_classification?: string | null
          sensitivity_level?: string
          compliance_requirements?: string[]
          workflow_steps?: Record<string, any>
          current_step?: number
          parallel_processing?: boolean
          retry_strategy?: string
          data_quality_threshold?: number
          validation_rules?: Record<string, any>
          enrichment_sources?: string[]
          estimated_processing_time_seconds?: number | null
          actual_processing_time_seconds?: number | null
          resource_allocation?: string
          cost_estimate_cents?: number | null
          actual_cost_cents?: number | null
          retry_count?: number
          max_retries?: number
          error_threshold?: number
          fallback_strategy?: string
          user_instructions?: string | null
          processing_context?: Record<string, any>
          user_tags?: string[]
          auto_tags?: string[]
          scheduled_for?: string | null
          queued_at?: string
          started_at?: string | null
          completed_at?: string | null
          expires_at?: string | null
          processing_results?: Record<string, any>
          extracted_entities?: Record<string, any>
          insights_generated?: string[]
          confidence_scores?: Record<string, any>
          webhook_urls?: string[]
          notification_settings?: Record<string, any>
          downstream_systems?: string[]
          processing_logs?: Record<string, any>[]
          data_lineage?: Record<string, any>
          compliance_checks?: Record<string, any>
          audit_trail?: Record<string, any>[]
          processing_metadata?: Record<string, any>
          model_versions?: Record<string, any>
          performance_metrics?: Record<string, any>
          user_feedback_score?: number | null
          organization_id?: string | null
          team_assignment?: string | null
          approval_required?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_data_processor_stats: {
        Args: {
          user_uuid: string
        }
        Returns: Record<string, any>
      }
      auto_queue_data_for_processing: {
        Args: {
          data_id: string
          processing_plan_override?: string
        }
        Returns: string
      }
      process_next_queue_item: {
        Args: {
          user_uuid?: string
          priority_filter?: number
        }
        Returns: string | null
      }
    }
  }
} 