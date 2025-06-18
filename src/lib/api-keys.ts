import { createHash, randomBytes } from 'crypto'
import { createServerSupabaseClient } from '@/lib/supabase'

export interface ApiKey {
  id: string
  user_id: string
  endpoint_id?: string
  key_hash: string
  key_prefix: string
  name: string
  is_active: boolean
  last_used_at?: string
  created_at: string
  expires_at: string
}

export interface ApiKeyValidationResult {
  isValid: boolean
  userId?: string
  endpointId?: string
  keyId?: string
  error?: string
}

/**
 * Generate a new API key with secure random components
 */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Generate a secure random key: esk_live_[32 random bytes as hex]
  const randomPart = randomBytes(32).toString('hex')
  const key = `esk_live_${randomPart}`
  
  // Create hash for storage (never store the raw key)
  const hash = createHash('sha256').update(key).digest('hex')
  
  // Create prefix for identification (first 8 chars after esk_live_)
  const prefix = `esk_live_${randomPart.substring(0, 8)}...`
  
  return { key, hash, prefix }
}

/**
 * Create a new API key for a user/endpoint
 */
export async function createApiKey(params: {
  userId: string
  endpointId?: string
  name: string
  expiresInDays?: number
}): Promise<{ key: string; keyData: ApiKey } | { error: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { key, hash, prefix } = generateApiKey()
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (params.expiresInDays || 365))
    
    const { data, error } = await supabase
      .from('enostics_api_keys')
      .insert({
        user_id: params.userId,
        endpoint_id: params.endpointId,
        key_hash: hash,
        key_prefix: prefix,
        name: params.name,
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating API key:', error)
      return { error: 'Failed to create API key' }
    }
    
    return { key, keyData: data }
  } catch (error) {
    console.error('Error in createApiKey:', error)
    return { error: 'Internal server error' }
  }
}

/**
 * Validate an API key and return user/endpoint information
 */
export async function validateApiKey(key: string): Promise<ApiKeyValidationResult> {
  if (!key || !key.startsWith('esk_live_')) {
    return { isValid: false, error: 'Invalid API key format' }
  }
  
  try {
    const supabase = await createServerSupabaseClient()
    const keyHash = createHash('sha256').update(key).digest('hex')
    
    const { data, error } = await supabase
      .from('enostics_api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()
    
    if (error || !data) {
      return { isValid: false, error: 'API key not found or inactive' }
    }
    
    // Check if key is expired
    if (new Date(data.expires_at) < new Date()) {
      return { isValid: false, error: 'API key has expired' }
    }
    
    // Update last used timestamp
    await supabase
      .from('enostics_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id)
    
    return {
      isValid: true,
      userId: data.user_id,
      endpointId: data.endpoint_id,
      keyId: data.id
    }
  } catch (error) {
    console.error('Error validating API key:', error)
    return { isValid: false, error: 'Internal server error' }
  }
}

/**
 * Get all API keys for a user
 */
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('enostics_api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching API keys:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getUserApiKeys:', error)
    return []
  }
}

/**
 * Deactivate an API key
 */
export async function deactivateApiKey(keyId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('enostics_api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', userId)
    
    return !error
  } catch (error) {
    console.error('Error deactivating API key:', error)
    return false
  }
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(keyId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('enostics_api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId)
    
    return !error
  } catch (error) {
    console.error('Error deleting API key:', error)
    return false
  }
} 