import { createServerSupabaseClient, getSupabaseAdmin } from '@/lib/supabase'

interface UserCacheEntry {
  userId: string
  timestamp: number
}

interface EndpointCacheEntry {
  id: string
  user_id: string
  name: string
  description?: string
  url_path: string
  is_active: boolean
  auth_type: string
  settings: Record<string, any>
  timestamp: number
}

// In-memory cache for user resolution
// In production, this should be Redis or another persistent cache
const userCache = new Map<string, UserCacheEntry>()
const endpointCache = new Map<string, EndpointCacheEntry>()

// Cache configuration
const CACHE_CONFIG = {
  userTtl: 5 * 60 * 1000, // 5 minutes
  endpointTtl: 2 * 60 * 1000, // 2 minutes (shorter since endpoints change more frequently)
  cleanupInterval: 10 * 60 * 1000, // Clean up every 10 minutes
}

/**
 * Resolve username to user ID with caching
 */
export async function resolveUsername(username: string): Promise<string | null> {
  const cacheKey = username.toLowerCase()
  
  // Check cache first
  const cached = userCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.userTtl) {
    return cached.userId
  }
  
  try {
    const supabase = await createServerSupabaseClient()
    
    // Try to find user by full_name first
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .ilike('full_name', `%${username}%`)
      .single()
    
    if (!userError && userProfile) {
      // Cache the result
      userCache.set(cacheKey, {
        userId: userProfile.user_id,
        timestamp: Date.now()
      })
      return userProfile.user_id
    }
    
    // If not found by full name, try by email username using admin client
    const adminSupabase = getSupabaseAdmin()
    const { data: users } = await adminSupabase.auth.admin.listUsers()
    const matchingUser = users.users.find(user => 
      user.email?.split('@')[0].toLowerCase() === username.toLowerCase()
    )
    
    if (matchingUser) {
      // Cache the result
      userCache.set(cacheKey, {
        userId: matchingUser.id,
        timestamp: Date.now()
      })
      return matchingUser.id
    }
    
    return null
  } catch (error) {
    console.error('Error resolving username:', error)
    return null
  }
}

/**
 * Get endpoint information for a user and endpoint path with caching
 */
export async function resolveEndpoint(
  userId: string, 
  endpointPath: string
): Promise<EndpointCacheEntry | null> {
  const cacheKey = `${userId}:${endpointPath}`
  
  // Check cache first
  const cached = endpointCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.endpointTtl) {
    return cached
  }
  
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: endpoint, error } = await supabase
      .from('enostics_endpoints')
      .select('*')
      .eq('user_id', userId)
      .eq('url_path', endpointPath)
      .eq('is_active', true)
      .single()
    
    if (error || !endpoint) {
      return null
    }
    
    const cacheEntry: EndpointCacheEntry = {
      ...endpoint,
      timestamp: Date.now()
    }
    
    // Cache the result
    endpointCache.set(cacheKey, cacheEntry)
    
    return cacheEntry
  } catch (error) {
    console.error('Error resolving endpoint:', error)
    return null
  }
}

/**
 * Combined resolver for username and endpoint
 */
export async function resolveUsernameAndEndpoint(
  username: string,
  endpointPath: string
): Promise<{
  userId: string
  endpoint: EndpointCacheEntry
} | null> {
  const userId = await resolveUsername(username)
  if (!userId) {
    return null
  }
  
  const endpoint = await resolveEndpoint(userId, endpointPath)
  if (!endpoint) {
    return null
  }
  
  return { userId, endpoint }
}

/**
 * Invalidate cache for a specific user
 */
export function invalidateUserCache(username: string): void {
  const cacheKey = username.toLowerCase()
  userCache.delete(cacheKey)
}

/**
 * Invalidate cache for a specific endpoint
 */
export function invalidateEndpointCache(userId: string, endpointPath: string): void {
  const cacheKey = `${userId}:${endpointPath}`
  endpointCache.delete(cacheKey)
}

/**
 * Invalidate all caches for a user
 */
export function invalidateUserCaches(userId: string): void {
  // Remove all endpoint caches for this user
  endpointCache.forEach((entry, key) => {
    if (key.startsWith(`${userId}:`)) {
      endpointCache.delete(key)
    }
  })
  
  // Remove user cache entries (we don't have reverse mapping, so we check all)
  userCache.forEach((entry, key) => {
    if (entry.userId === userId) {
      userCache.delete(key)
    }
  })
}

/**
 * Clean up expired cache entries
 */
function cleanupCache(): void {
  const now = Date.now()
  
  // Clean up user cache
  userCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_CONFIG.userTtl) {
      userCache.delete(key)
    }
  })
  
  // Clean up endpoint cache
  endpointCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_CONFIG.endpointTtl) {
      endpointCache.delete(key)
    }
  })
}

/**
 * Start periodic cache cleanup
 */
export function startCacheCleanup(): void {
  setInterval(cleanupCache, CACHE_CONFIG.cleanupInterval)
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): {
  userCache: { size: number; entries: number }
  endpointCache: { size: number; entries: number }
} {
  return {
    userCache: {
      size: userCache.size,
      entries: userCache.size
    },
    endpointCache: {
      size: endpointCache.size,
      entries: endpointCache.size
    }
  }
}

// Start cleanup on module load (server-side only)
if (typeof window === 'undefined') {
  startCacheCleanup()
} 