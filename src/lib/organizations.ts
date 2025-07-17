// 🏢 Enostics Organization Management
// Utilities for organization membership, permissions, and data access

import { createServerSupabaseClient } from '@/lib/supabase'
import type { UserOrganization } from '@/app/api/user/organizations/route'

export interface OrganizationMember {
  id: string
  organization_id: string
  profile_id: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  joined_at: string
  invitation_status: 'pending' | 'accepted' | 'declined'
  permissions: Record<string, any>
  custom_permissions?: Record<string, any>
  last_active_at?: string
}

export interface Organization {
  id: string
  name: string
  description: string
  plan: 'hobby' | 'pro'
  subscription_status: 'active' | 'trial' | 'past_due' | 'canceled'
  domain?: string
  max_users: number
  max_storage: number
  max_executions_per_month: number
  max_workflows: number
  current_month_executions: number
  billing_cycle: 'monthly' | 'yearly'
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface OrganizationInvitation {
  id: string
  organization_id: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  invited_by: string
  token: string
  created_at: string
  expires_at: string
  invitation_status: 'pending' | 'accepted' | 'declined'
}

/**
 * Get all organizations a user belongs to
 */
export async function getUserOrganizations(
  userId: string,
  options: {
    includeBilling?: boolean
    includeUsage?: boolean
    activeOnly?: boolean
  } = {}
): Promise<UserOrganization[]> {
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('organization_members')
    .select(`
      role,
      joined_at,
      invitation_status,
      permissions,
      custom_permissions,
      last_active_at,
      organizations!inner (
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
        current_month_executions,
        billing_cycle,
        next_billing_date,
        cancel_at_period_end,
        trial_ends_at,
        deleted_at
      )
    `)
    .eq('profile_id', userId)
    .eq('invitation_status', 'accepted')

  if (options.activeOnly !== false) {
    // Filter out deleted organizations unless explicitly requested
    query = query.is('organizations.deleted_at', null)
  }

  const { data: organizationsData, error } = await query

  if (error) {
    console.error('Error fetching user organizations:', error)
    throw new Error('Failed to fetch organizations')
  }

  const organizations: UserOrganization[] = organizationsData.map((item: any) => {
    const org = item.organizations
    const membership = {
      role: item.role,
      joined_at: item.joined_at,
      invitation_status: item.invitation_status,
      permissions: item.permissions || {},
      custom_permissions: item.custom_permissions,
      last_active_at: item.last_active_at
    }

    const limits = {
      max_users: org.max_users,
      max_storage: org.max_storage,
      max_executions_per_month: org.max_executions_per_month,
      max_workflows: org.max_workflows,
      current_month_executions: org.current_month_executions
    }

    const result: UserOrganization = {
      id: org.id,
      name: org.name,
      description: org.description || '',
      plan: org.plan,
      subscription_status: org.subscription_status || 'active',
      domain: org.domain,
      created_at: org.created_at,
      updated_at: org.updated_at,
      membership,
      limits
    }

    // Include billing info only for owners/admins and if requested
    if (options.includeBilling && (item.role === 'owner' || item.role === 'admin')) {
      result.billing = {
        billing_cycle: org.billing_cycle,
        next_billing_date: org.next_billing_date,
        cancel_at_period_end: org.cancel_at_period_end,
        trial_ends_at: org.trial_ends_at
      }
    }

    return result
  })

  // Get additional usage stats if requested
  if (options.includeUsage) {
    for (const org of organizations) {
      const { count: memberCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)
        .eq('invitation_status', 'accepted')

      org.limits = {
        ...org.limits,
        current_users: memberCount || 0
      } as any
    }
  }

  return organizations
}

/**
 * Get a specific organization by ID with user's membership details
 */
export async function getUserOrganization(
  userId: string, 
  organizationId: string
): Promise<UserOrganization | null> {
  const organizations = await getUserOrganizations(userId, { 
    includeBilling: true, 
    includeUsage: true 
  })
  
  return organizations.find(org => org.id === organizationId) || null
}

/**
 * Check if user has specific role in organization
 */
export async function hasOrganizationRole(
  userId: string,
  organizationId: string,
  requiredRole: 'owner' | 'admin' | 'member' | 'guest'
): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('profile_id', userId)
    .eq('organization_id', organizationId)
    .eq('invitation_status', 'accepted')
    .single()

  if (error || !data) return false

  const roleHierarchy: Record<string, number> = { guest: 1, member: 2, admin: 3, owner: 4 }
  return roleHierarchy[data.role] >= roleHierarchy[requiredRole]
}

/**
 * Check if user is owner or admin of organization
 */
export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return hasOrganizationRole(userId, organizationId, 'admin')
}

/**
 * Get organization member count
 */
export async function getOrganizationMemberCount(organizationId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  
  const { count, error } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('invitation_status', 'accepted')

  if (error) {
    console.error('Error getting member count:', error)
    return 0
  }

  return count || 0
}

/**
 * Get pending invitations for an organization
 */
export async function getOrganizationInvitations(
  organizationId: string
): Promise<OrganizationInvitation[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('invitation_status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invitations:', error)
    return []
  }

  return data || []
} 