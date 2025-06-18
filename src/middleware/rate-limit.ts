import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  requests: number[]
  lastCleanup: number
}

// In-memory store for rate limiting
// In production, this should be Redis or another persistent store
const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, // 100 requests per hour
  cleanupInterval: 5 * 60 * 1000, // Clean up every 5 minutes
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest, userId?: string): string {
  // If we have a user ID, use it for per-user rate limiting
  if (userId) {
    return `user:${userId}`
  }
  
  // Fall back to IP-based rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || request.ip || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Clean up old entries from the rate limit store
 */
function cleanupOldEntries(entry: RateLimitEntry): void {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_CONFIG.windowMs
  
  // Remove requests older than the window
  entry.requests = entry.requests.filter(timestamp => timestamp > cutoff)
  entry.lastCleanup = now
}

/**
 * Check if client has exceeded rate limit
 */
function isRateLimited(clientId: string): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  
  // Get or create entry
  let entry = rateLimitStore.get(clientId)
  if (!entry) {
    entry = { requests: [], lastCleanup: now }
    rateLimitStore.set(clientId, entry)
  }
  
  // Clean up old entries if needed
  if (now - entry.lastCleanup > RATE_LIMIT_CONFIG.cleanupInterval) {
    cleanupOldEntries(entry)
  }
  
  // Check if over limit
  const currentRequests = entry.requests.length
  const limited = currentRequests >= RATE_LIMIT_CONFIG.maxRequests
  
  if (!limited) {
    entry.requests.push(now)
  }
  
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxRequests - entry.requests.length)
  const oldestRequest = entry.requests[0] || now
  const resetTime = oldestRequest + RATE_LIMIT_CONFIG.windowMs
  
  return { limited, remaining, resetTime }
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  userId?: string
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const clientId = getClientId(request, userId)
  const { limited, remaining, resetTime } = isRateLimited(clientId)
  
  if (limited) {
    return {
      success: false,
      response: NextResponse.json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${RATE_LIMIT_CONFIG.maxRequests} requests per hour`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      }, {
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      })
    }
  }
  
  return { success: true }
}

/**
 * Create rate limit headers for successful responses
 */
export function createRateLimitHeaders(clientId: string): Record<string, string> {
  const entry = rateLimitStore.get(clientId)
  if (!entry) {
    return {
      'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
      'X-RateLimit-Remaining': RATE_LIMIT_CONFIG.maxRequests.toString(),
    }
  }
  
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxRequests - entry.requests.length)
  const oldestRequest = entry.requests[0] || Date.now()
  const resetTime = oldestRequest + RATE_LIMIT_CONFIG.windowMs
  
  return {
    'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString()
  }
}

/**
 * Periodic cleanup of the rate limit store to prevent memory leaks
 */
export function startRateLimitCleanup(): void {
  setInterval(() => {
    const now = Date.now()
    const cutoff = now - RATE_LIMIT_CONFIG.windowMs * 2 // Clean entries older than 2x window
    
    rateLimitStore.forEach((entry, clientId) => {
      // Remove entries that haven't been used recently
      if (entry.lastCleanup < cutoff && entry.requests.length === 0) {
        rateLimitStore.delete(clientId)
      } else {
        cleanupOldEntries(entry)
      }
    })
  }, RATE_LIMIT_CONFIG.cleanupInterval)
}

// Start cleanup on module load
if (typeof window === 'undefined') {
  startRateLimitCleanup()
} 