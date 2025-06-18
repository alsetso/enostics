// Simplified public inbox handling for universal endpoint system

export interface PublicInboxRequest {
  id: string
  user_id: string
  method: string
  source_ip?: string
  user_agent?: string
  payload: any
  payload_type?: string
  payload_source?: string
  is_authenticated: boolean
  is_suspicious: boolean
  abuse_score: number
  created_at: string
}

export interface InboxConfig {
  id: string
  user_id: string
  is_public: boolean
  requires_api_key: boolean
  allowed_api_key_id?: string
  max_payload_size: number
  rate_limit_per_hour: number
  rate_limit_per_day: number
}

/**
 * Extract metadata from payload
 */
export function extractPayloadMetadata(payload: any): {
  type: string
  source: string
} {
  let type = 'unknown'
  let source = 'unknown'
  
  if (typeof payload === 'object' && payload !== null) {
    // Extract type
    if (payload.type && typeof payload.type === 'string') {
      type = payload.type.slice(0, 100)
    } else if (payload.event_type && typeof payload.event_type === 'string') {
      type = payload.event_type.slice(0, 100)
    } else if (payload.messageType && typeof payload.messageType === 'string') {
      type = payload.messageType.slice(0, 100)
    } else if (payload.kind && typeof payload.kind === 'string') {
      type = payload.kind.slice(0, 100)
    }
    
    // Extract source
    if (payload.source && typeof payload.source === 'string') {
      source = payload.source.slice(0, 255)
    } else if (payload.from && typeof payload.from === 'string') {
      source = payload.from.slice(0, 255)
    } else if (payload.origin && typeof payload.origin === 'string') {
      source = payload.origin.slice(0, 255)
    } else if (payload.sender && typeof payload.sender === 'string') {
      source = payload.sender.slice(0, 255)
    }
  }
  
  return { type, source }
}

/**
 * Calculate abuse score for a request
 */
export function calculateAbuseScore(
  payload: any,
  sourceIp: string,
  userAgent?: string,
  recentRequests: number = 0
): number {
  let score = 0
  
  // Large payload penalty
  if (typeof payload === 'object' && payload !== null) {
    const keyCount = Object.keys(payload).length
    if (keyCount > 50) score += 10
    if (keyCount > 100) score += 20
  }
  
  // Suspicious patterns in payload
  const payloadStr = JSON.stringify(payload).toLowerCase()
  if (payloadStr.includes('script') || payloadStr.includes('eval') || 
      payloadStr.includes('exec') || payloadStr.includes('system')) {
    score += 30
  }
  
  // High frequency penalty
  if (recentRequests > 100) score += 20
  else if (recentRequests > 50) score += 10
  
  // User agent analysis
  if (!userAgent || userAgent === '') {
    score += 5
  } else if (/bot|crawler|spider|scraper/i.test(userAgent)) {
    score += 15
  }
  
  // Private IP ranges are less suspicious
  if (sourceIp.startsWith('192.168.') || sourceIp.startsWith('10.') || 
      sourceIp.startsWith('172.16.') || sourceIp === '127.0.0.1') {
    score = Math.max(0, score - 10)
  }
  
  return Math.min(score, 100)
}

/**
 * Validate payload size
 */
export function validatePayloadSize(payload: any, maxSize: number = 1048576): boolean {
  const payloadStr = JSON.stringify(payload)
  return Buffer.byteLength(payloadStr, 'utf8') <= maxSize
}

/**
 * Sanitize payload for storage
 */
export function sanitizePayload(payload: any): any {
  // Remove potentially dangerous functions
  const sanitized = JSON.parse(JSON.stringify(payload))
  
  // Recursively remove function properties and limit depth
  function sanitizeObject(obj: any, depth: number = 0): any {
    if (depth > 10) return '[Max Depth Exceeded]'
    
    if (typeof obj === 'function') return '[Function]'
    if (obj instanceof Date) return obj.toISOString()
    if (obj === null || typeof obj !== 'object') return obj
    
    if (Array.isArray(obj)) {
      return obj.slice(0, 1000).map(item => sanitizeObject(item, depth + 1))
    }
    
    const result: any = {}
    const keys = Object.keys(obj).slice(0, 100) // Limit keys
    
    for (const key of keys) {
      if (typeof obj[key] !== 'function') {
        result[key] = sanitizeObject(obj[key], depth + 1)
      }
    }
    
    return result
  }
  
  return sanitizeObject(sanitized)
}

/**
 * Generate a simple rate limit key
 */
export function getRateLimitKey(userId: string, sourceIp: string): string {
  return `inbox:${userId}:${sourceIp}`
}

/**
 * Check if IP is in blocked list
 */
export function isIpBlocked(ip: string, blockedIps: string[]): boolean {
  return blockedIps.includes(ip)
}

/**
 * Check if source is allowed
 */
export function isSourceAllowed(source: string, allowedSources: string[]): boolean {
  if (allowedSources.length === 0) return true
  return allowedSources.some(allowed => source.includes(allowed))
}

/**
 * Generate inbox URL for user
 */
export function generateInboxUrl(username: string, baseUrl: string = 'https://api.enostics.com'): string {
  return `${baseUrl}/v1/${username}`
}

/**
 * Parse inbox request headers
 */
export function parseInboxHeaders(headers: Headers): {
  sourceIp?: string
  userAgent?: string
  referer?: string
  contentType?: string
  contentLength?: number
} {
  return {
    sourceIp: headers.get('x-forwarded-for') || headers.get('x-real-ip') || undefined,
    userAgent: headers.get('user-agent') || undefined,
    referer: headers.get('referer') || undefined,
    contentType: headers.get('content-type') || undefined,
    contentLength: parseInt(headers.get('content-length') || '0') || undefined
  }
} 