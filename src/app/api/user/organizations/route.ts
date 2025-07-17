import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getUserOrganizations } from '@/lib/organizations'

export interface UserOrganization {
  id: string
  name: string
  description: string
  plan: 'hobby' | 'pro'
  subscription_status: 'active' | 'trial' | 'past_due' | 'canceled'
  domain?: string
  created_at: string
  updated_at: string
  // Membership details
  membership: {
    role: 'owner' | 'admin' | 'member' | 'guest'
    joined_at: string
    invitation_status: 'pending' | 'accepted' | 'declined'
    permissions: Record<string, any>
    custom_permissions?: Record<string, any>
    last_active_at?: string
  }
  // Organization limits and usage
  limits: {
    max_users: number
    max_storage: number
    max_executions_per_month: number
    max_workflows: number
    current_month_executions: number
  }
  // Billing info (only for owners/admins)
  billing?: {
    billing_cycle: 'monthly' | 'yearly'
    next_billing_date?: string
    cancel_at_period_end: boolean
    trial_ends_at?: string
  }
}

// GET - Get all organizations the user belongs to
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeBilling = searchParams.get('include_billing') === 'true'
    const includeUsage = searchParams.get('include_usage') === 'true'

    // Simple direct query to test basic functionality
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select(`
        role,
        joined_at,
        invitation_status,
        permissions,
        organizations (
          id,
          name,
          description,
          plan,
          subscription_status,
          domain,
          created_at,
          updated_at,
          max_users,
          max_storage,
          max_executions_per_month,
          max_workflows,
          current_month_executions
        )
      `)
      .eq('profile_id', user.id)
      .eq('invitation_status', 'accepted')

    if (memberError) {
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: memberError.message,
        user_id: user.id
      }, { status: 500 })
    }

    // If no data, return empty array instead of null
    if (!memberData || memberData.length === 0) {
      return NextResponse.json({
        organizations: [],
        total_count: 0,
        user_id: user.id,
        debug: 'No accepted organization memberships found for this user'
      })
    }

    // Transform the data to match expected format
    const organizations: UserOrganization[] = memberData
      .filter(member => member.organizations) // Filter out any null organizations
      .map(member => {
        const org = Array.isArray(member.organizations) ? member.organizations[0] : member.organizations;
        return {
          id: org.id,
          name: org.name,
          description: org.description || '',
          plan: org.plan,
          subscription_status: org.subscription_status,
          domain: org.domain,
          created_at: org.created_at,
          updated_at: org.updated_at,
          membership: {
            role: member.role,
            joined_at: member.joined_at,
            invitation_status: member.invitation_status,
            permissions: member.permissions || {},
            last_active_at: undefined
          },
          limits: {
            max_users: org.max_users || 5,
            max_storage: org.max_storage || 5000000000, // 5GB in bytes
            max_executions_per_month: org.max_executions_per_month || 100,
            max_workflows: org.max_workflows || 5,
            current_month_executions: org.current_month_executions || 0
          }
        }
      })

    return NextResponse.json({
      organizations,
      total_count: organizations.length,
      user_id: user.id
    })

  } catch (error) {
    console.error('Organizations API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 