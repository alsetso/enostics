import { createServerSupabaseClient } from '@/lib/supabase'

interface WebhookPayload {
  endpoint: {
    id: string
    name: string
    url_path: string
  }
  request: {
    method: string
    headers: Record<string, string>
    data: any
    timestamp: string
    source_ip?: string
  }
  metadata: {
    api_key_id?: string
    request_id: string
  }
}

interface WebhookDeliveryResult {
  success: boolean
  statusCode?: number
  responseBody?: string
  error?: string
  duration: number
}

/**
 * Forward data to a webhook URL with retry logic
 */
export async function forwardToWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  secret?: string,
  maxRetries: number = 3
): Promise<WebhookDeliveryResult> {
  const startTime = Date.now()
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Enostics-Webhook/1.0',
        'X-Enostics-Event': 'endpoint.request',
        'X-Enostics-Endpoint': payload.endpoint.id,
        'X-Enostics-Attempt': attempt.toString(),
        'X-Enostics-Timestamp': payload.request.timestamp
      }

      // Add webhook signature if secret is provided
      if (secret) {
        const crypto = await import('crypto')
        const signature = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(payload))
          .digest('hex')
        headers['X-Enostics-Signature'] = `sha256=${signature}`
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      const duration = Date.now() - startTime
      const responseBody = await response.text().catch(() => '')

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          responseBody: responseBody.slice(0, 1000), // Limit response body size
          duration
        }
      } else {
        // Log unsuccessful attempt but continue retrying
        console.warn(`Webhook attempt ${attempt} failed:`, {
          url: webhookUrl,
          status: response.status,
          body: responseBody.slice(0, 500)
        })

        if (attempt === maxRetries) {
          return {
            success: false,
            statusCode: response.status,
            responseBody: responseBody.slice(0, 1000),
            error: `HTTP ${response.status}: ${response.statusText}`,
            duration
          }
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.warn(`Webhook attempt ${attempt} error:`, error)

      if (attempt === maxRetries) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration
        }
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded',
    duration: Date.now() - startTime
  }
}

/**
 * Process webhook delivery for an endpoint
 */
export async function processWebhookDelivery(
  endpointId: string,
  requestLogId: string,
  payload: WebhookPayload
): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get endpoint webhook configuration
    const { data: endpoint, error } = await supabase
      .from('enostics_endpoints')
      .select('webhook_url, webhook_secret, webhook_enabled')
      .eq('id', endpointId)
      .single()

    if (error || !endpoint || !endpoint.webhook_enabled || !endpoint.webhook_url) {
      return // No webhook configured or disabled
    }

    // Deliver webhook
    const result = await forwardToWebhook(
      endpoint.webhook_url,
      payload,
      endpoint.webhook_secret
    )

    // Log the webhook delivery attempt
    await supabase
      .from('enostics_webhook_logs')
      .insert({
        endpoint_id: endpointId,
        request_log_id: requestLogId,
        webhook_url: endpoint.webhook_url,
        attempt_number: 1, // For now, we log the final result
        status_code: result.statusCode,
        response_body: result.responseBody,
        error_message: result.error,
        duration_ms: result.duration
      })

    // Update request log with webhook status
    await supabase
      .from('enostics_request_logs')
      .update({
        webhook_sent: true,
        webhook_status: result.statusCode || 0
      })
      .eq('id', requestLogId)

  } catch (error) {
    console.error('Error processing webhook delivery:', error)
  }
}

/**
 * Validate webhook URL format
 */
export function validateWebhookUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url)
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' }
    }
    
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return { valid: false, error: 'Localhost URLs are not allowed' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Generate a secure webhook secret
 */
export function generateWebhookSecret(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
} 