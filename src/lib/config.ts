/**
 * Environment Configuration for Enostics
 * Handles development vs production settings
 */

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

// Base URLs
export const CONFIG = {
  // Application URLs
  APP_URL: IS_PRODUCTION 
    ? 'https://enostics.com'
    : 'http://localhost:3001',
    
  API_URL: IS_PRODUCTION
    ? 'https://api.enostics.com'
    : 'http://localhost:3001/api',
    
  // User endpoint base URL
  USER_ENDPOINT_BASE: IS_PRODUCTION
    ? 'https://api.enostics.com/v1'
    : 'http://localhost:3001/api/v1',
    
  // Supabase configuration
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  // OpenAI configuration
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY!,
    ENABLED: !!process.env.OPENAI_API_KEY,
  },
  
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
    ENABLED: IS_PRODUCTION,
  },
  
  // Security settings
  SECURITY: {
    API_KEY_SECRET: process.env.API_KEY_SECRET || 'dev-secret-key',
    CORS_ORIGIN: IS_PRODUCTION 
      ? ['https://enostics.com', 'https://api.enostics.com']
      : ['http://localhost:3001', 'http://localhost:3000'],
  },
  
  // Feature flags
  FEATURES: {
    AI_ENABLED: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES !== 'false',
    PREMIUM_ENABLED: process.env.NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES !== 'false',
    MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
  },
  
  // Analytics
  ANALYTICS: {
    ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    ENABLED: IS_PRODUCTION && !!process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },
  
  // Monitoring
  SENTRY: {
    DSN: process.env.SENTRY_DSN,
    ENABLED: IS_PRODUCTION && !!process.env.SENTRY_DSN,
  },
}

// Helper functions
export function getUserEndpointURL(username: string): string {
  return `${CONFIG.USER_ENDPOINT_BASE}/${username}`
}

export function getAPIEndpointURL(path: string): string {
  return `${CONFIG.API_URL}/${path.replace(/^\//, '')}`
}

export function validateEnvironment(): {
  isValid: boolean
  missing: string[]
  warnings: string[]
} {
  const missing: string[] = []
  const warnings: string[] = []
  
  // Required environment variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  
  // Production-specific requirements
  if (IS_PRODUCTION) {
    required.push('API_KEY_SECRET')
  }
  
  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }
  
  // Check optional but recommended variables
  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY not set - AI features will be disabled')
  }
  
  if (IS_PRODUCTION && !process.env.SENTRY_DSN) {
    warnings.push('SENTRY_DSN not set - error tracking disabled')
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

// Environment validation on import (development only)
if (IS_DEVELOPMENT) {
  const validation = validateEnvironment()
  if (!validation.isValid) {
    console.warn('⚠️ Missing required environment variables:', validation.missing)
  }
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:', validation.warnings)
  }
}

export default CONFIG 