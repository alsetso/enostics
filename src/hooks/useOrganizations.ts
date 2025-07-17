import { useState, useEffect } from 'react'
import type { UserOrganization } from '@/app/api/user/organizations/route'

interface UseOrganizationsOptions {
  includeBilling?: boolean
  includeUsage?: boolean
  autoFetch?: boolean
}

interface UseOrganizationsResult {
  organizations: UserOrganization[]
  loading: boolean
  error: string | null
  totalCount: number
  refetch: () => Promise<void>
}

export function useOrganizations(options: UseOrganizationsOptions = {}): UseOrganizationsResult {
  const [organizations, setOrganizations] = useState<UserOrganization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const {
    includeBilling = false,
    includeUsage = false,
    autoFetch = true
  } = options

  const fetchOrganizations = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (includeBilling) params.set('include_billing', 'true')
      if (includeUsage) params.set('include_usage', 'true')

      const response = await fetch(`/api/user/organizations?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch organizations')
      }

      const data = await response.json()
      setOrganizations(data.organizations || [])
      setTotalCount(data.total_count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setOrganizations([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchOrganizations()
    }
  }, [autoFetch, includeBilling, includeUsage])

  return {
    organizations,
    loading,
    error,
    totalCount,
    refetch: fetchOrganizations
  }
}

// Hook for getting a specific organization
export function useOrganization(organizationId: string | null) {
  const { organizations, loading, error } = useOrganizations()
  
  const organization = organizationId 
    ? organizations.find(org => org.id === organizationId) || null
    : null

  return {
    organization,
    loading,
    error
  }
} 