import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-keys'

export interface ApiKeyContext {
  userId: string
  endpointId?: string
  keyId: string
}

/**
 * Extract API key from request headers
 */
function extractApiKey(request: NextRequest): string | null {
  // Check x-api-key header first
  const xApiKey = request.headers.get('x-api-key')
  if (xApiKey) {
    return xApiKey
  }
  
  // Check Authorization header with Bearer token
  const authorization = request.headers.get('authorization')
  if (authorization?.startsWith('Bearer ')) {
    return authorization.substring(7)
  }
  
  // Check Authorization header with API key prefix
  if (authorization?.startsWith('ApiKey ')) {
    return authorization.substring(7)
  }
  
  return null
}

/**
 * Validate API key middleware for v1 endpoints
 */
export async function validateApiKeyMiddleware(
  request: NextRequest
): Promise<{ success: true; context: ApiKeyContext } | { success: false; response: NextResponse }> {
  const apiKey = extractApiKey(request)
  
  if (!apiKey) {
    return {
      success: false,
      response: NextResponse.json({
        error: 'API key required',
        message: 'Provide API key in x-api-key header or Authorization header',
        code: 'MISSING_API_KEY'
      }, { status: 401 })
    }
  }
  
  const validation = await validateApiKey(apiKey)
  
  if (!validation.isValid) {
    return {
      success: false,
      response: NextResponse.json({
        error: 'Invalid API key',
        message: validation.error || 'API key is invalid or expired',
        code: 'INVALID_API_KEY'
      }, { status: 401 })
    }
  }
  
  return {
    success: true,
    context: {
      userId: validation.userId!,
      endpointId: validation.endpointId,
      keyId: validation.keyId!
    }
  }
}

/**
 * Create authenticated response headers
 */
export function createAuthenticatedHeaders(context: ApiKeyContext): Record<string, string> {
  return {
    'X-Authenticated-User': context.userId,
    'X-API-Key-ID': context.keyId,
    ...(context.endpointId && { 'X-Endpoint-ID': context.endpointId })
  }
} 