import { createServerSupabaseClient } from '@/lib/supabase'
import crypto from 'crypto'

// Types for webhook system
export interface Webhook {
  id: string
  endpoint_id: string
  user_id: string
  name: string
  description?: string
  webhook_url: string
  webhook_secret?: string
  trigger_events: string[]
  trigger_conditions: any
  is_active: boolean
  timeout_seconds: number
  max_retries: number
  retry_backoff: 'exponential' | 'linear' | 'fixed'
  calls_this_month: number
  successful_calls: number
  failed_calls: number
  total_calls: number
  last_triggered_at?: string
  last_successful_at?: string
  avg_response_time_ms: number
  created_at: string
  updated_at: string
}

export interface WebhookLog {
  id: string
  webhook_id: string
  triggered_by_data_id?: string
  trigger_event: string
  trigger_conditions_met?: any
  request_url: string
  request_method: string
  request_headers: any
  request_payload: any
  response_status?: number
  response_headers?: any
  response_body?: string
  response_time_ms?: number
  attempt_number: number
  max_attempts: number
  is_successful: boolean
  error_message?: string
  error_type?: string
  webhook_secret_used: boolean
  signature_sent?: string
  user_agent: string
  executed_at: string
}

export interface WebhookExecutionResult {
  success: boolean
  statusCode?: number
  responseBody?: string
  responseHeaders?: any
  error?: string
  errorType?: string
  duration: number
  attempt: number
}

export interface WebhookPayload {
  event: string
  webhook_id: string
  endpoint: {
    id: string
    name: string
    url_path: string
  }
  data: any
  metadata: {
    timestamp: string
    request_id?: string
    api_key_id?: string
    source_ip?: string
    user_agent?: string
  }
  conditions_met?: any[]
  signature?: string
}

/**
 * Smart Webhooks Engine - Handles intelligent webhook processing
 */
export class SmartWebhooksEngine {
  private supabase: any

  constructor() {
    this.supabase = null // Will be initialized when needed
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createServerSupabaseClient()
    }
    return this.supabase
  }

  /**
   * Process incoming data and trigger relevant webhooks
   */
  async processDataReceived(
    endpointId: string, 
    data: any, 
    metadata: { 
      request_id?: string
      api_key_id?: string 
      source_ip?: string
      user_agent?: string
    } = {}
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Get all active webhooks for this endpoint
      const { data: webhooks, error } = await supabase
        .from('enostics_webhooks')
        .select('*')
        .eq('endpoint_id', endpointId)
        .eq('is_active', true)
        .contains('trigger_events', ['data_received'])

      if (error) {
        console.error('Error fetching webhooks:', error)
        return
      }

      if (!webhooks || webhooks.length === 0) {
        return // No webhooks to process
      }

      // Get endpoint details
      const { data: endpoint } = await supabase
        .from('enostics_endpoints')
        .select('id, name, url_path')
        .eq('id', endpointId)
        .single()

      if (!endpoint) {
        console.error('Endpoint not found:', endpointId)
        return
      }

      // Process each webhook
      const webhookPromises = webhooks.map((webhook: any) => 
        this.processWebhook(webhook, endpoint, data, metadata)
      )

      await Promise.allSettled(webhookPromises)

    } catch (error) {
      console.error('Error processing webhooks:', error)
    }
  }

  /**
   * Process a single webhook
   */
  private async processWebhook(
    webhook: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    endpoint: any,
    data: any,
    metadata: any
  ): Promise<void> {
    try {
      // Check if user can make webhook call
      const canMakeCall = await this.canUserMakeWebhookCall(webhook.user_id)
      if (!canMakeCall.allowed) {
        console.log(`Webhook ${webhook.id} skipped: ${canMakeCall.reason}`)
        return
      }

      // Evaluate trigger conditions
      const conditionsResult = await this.evaluateConditions(webhook.trigger_conditions, data)
      if (!conditionsResult.shouldTrigger) {
        console.log(`Webhook ${webhook.id} conditions not met`)
        return
      }

      // Build webhook payload
      const payload = this.buildWebhookPayload(webhook, endpoint, data, metadata, conditionsResult.conditionsMet)

      // Execute webhook with retry logic
      await this.executeWebhookWithRetries(webhook, payload)

    } catch (error) {
      console.error(`Error processing webhook ${webhook.id}:`, error)
    }
  }

  /**
   * Check if user can make webhook call (usage limits)
   */
  private async canUserMakeWebhookCall(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase.rpc('can_user_make_webhook_call', {
        user_uuid: userId
      })

      if (error) {
        console.error('Error checking webhook usage:', error)
        return { allowed: false, reason: 'Usage check failed' }
      }

      return {
        allowed: data.allowed,
        reason: data.reason
      }
    } catch (error) {
      console.error('Error in canUserMakeWebhookCall:', error)
      return { allowed: false, reason: 'Usage check error' }
    }
  }

  /**
   * Evaluate webhook trigger conditions
   */
  private async evaluateConditions(conditions: any, data: any): Promise<{ shouldTrigger: boolean; conditionsMet?: any[] }> {
    try {
      // If no conditions, always trigger
      if (!conditions || Object.keys(conditions).length === 0) {
        return { shouldTrigger: true }
      }

      const supabase = await this.getSupabase()
      
      // Use database function for complex condition evaluation
      const { data: result, error } = await supabase.rpc('evaluate_webhook_conditions', {
        conditions: conditions,
        data_payload: { data, metadata: {} }
      })

      if (error) {
        console.error('Error evaluating conditions:', error)
        return { shouldTrigger: false }
      }

      return { 
        shouldTrigger: result,
        conditionsMet: conditions.conditions || []
      }
    } catch (error) {
      console.error('Error in evaluateConditions:', error)
      return { shouldTrigger: false }
    }
  }

  /**
   * Build webhook payload with proper structure
   */
  private buildWebhookPayload(
    webhook: Webhook,
    endpoint: any,
    data: any,
    metadata: any,
    conditionsMet?: any[]
  ): WebhookPayload {
    const payload: WebhookPayload = {
      event: 'data_received',
      webhook_id: webhook.id,
      endpoint: {
        id: endpoint.id,
        name: endpoint.name,
        url_path: endpoint.url_path
      },
      data: data,
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: metadata.request_id,
        api_key_id: metadata.api_key_id,
        source_ip: metadata.source_ip,
        user_agent: metadata.user_agent
      }
    }

    if (conditionsMet && conditionsMet.length > 0) {
      payload.conditions_met = conditionsMet
    }

    // Add HMAC signature if webhook has secret
    if (webhook.webhook_secret) {
      payload.signature = this.generateHMACSignature(payload, webhook.webhook_secret)
    }

    return payload
  }

  /**
   * Generate HMAC signature for webhook security
   */
  private generateHMACSignature(payload: any, secret: string): string {
    const payloadString = JSON.stringify(payload)
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex')
  }

  /**
   * Execute webhook with retry logic
   */
  private async executeWebhookWithRetries(webhook: Webhook, payload: WebhookPayload): Promise<void> {
    let lastError: WebhookExecutionResult | null = null

    for (let attempt = 1; attempt <= webhook.max_retries + 1; attempt++) {
      try {
        const result = await this.executeWebhook(webhook, payload, attempt)
        
        // Log the attempt
        await this.logWebhookExecution(webhook, payload, result, attempt)

        if (result.success) {
          // Update webhook stats for success
          await this.updateWebhookStats(webhook.id, webhook.user_id, true, result.duration)
          return
        } else {
          lastError = result
          
          // If this was the last attempt, break
          if (attempt > webhook.max_retries) {
            break
          }

          // Wait before retry
          await this.waitForRetry(attempt, webhook.retry_backoff)
        }
      } catch (error) {
        lastError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: 'execution_error',
          duration: 0,
          attempt
        }

        // Log the error
        await this.logWebhookExecution(webhook, payload, lastError, attempt)

        if (attempt > webhook.max_retries) {
          break
        }

        await this.waitForRetry(attempt, webhook.retry_backoff)
      }
    }

    // Update webhook stats for failure
    await this.updateWebhookStats(webhook.id, webhook.user_id, false, lastError?.duration || 0)
  }

  /**
   * Execute single webhook attempt
   */
  private async executeWebhook(
    webhook: Webhook, 
    payload: WebhookPayload, 
    attempt: number
  ): Promise<WebhookExecutionResult> {
    const startTime = Date.now()

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Enostics-Webhook/1.0',
        'X-Enostics-Event': payload.event,
        'X-Enostics-Webhook-Id': webhook.id,
        'X-Enostics-Endpoint-Id': payload.endpoint.id,
        'X-Enostics-Attempt': attempt.toString(),
        'X-Enostics-Timestamp': payload.metadata.timestamp
      }

      // Add HMAC signature header if present
      if (payload.signature) {
        headers['X-Enostics-Signature-256'] = `sha256=${payload.signature}`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000)

      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const duration = Date.now() - startTime
      const responseBody = await response.text().catch(() => '')
      const responseHeaders = Object.fromEntries(response.headers.entries())

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          responseBody: responseBody.slice(0, 2000), // Limit response body size
          responseHeaders,
          duration,
          attempt
        }
      } else {
        return {
          success: false,
          statusCode: response.status,
          responseBody: responseBody.slice(0, 2000),
          responseHeaders,
          error: `HTTP ${response.status}: ${response.statusText}`,
          errorType: 'http_error',
          duration,
          attempt
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
            errorType: 'timeout',
            duration,
            attempt
          }
        } else if (error.message.includes('fetch')) {
          return {
            success: false,
            error: 'Connection error',
            errorType: 'connection',
            duration,
            attempt
          }
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: 'unknown',
        duration,
        attempt
      }
    }
  }

  /**
   * Wait before retry with different backoff strategies
   */
  private async waitForRetry(attempt: number, backoffType: string): Promise<void> {
    let delay: number

    switch (backoffType) {
      case 'exponential':
        delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000) // Max 30 seconds
        break
      case 'linear':
        delay = attempt * 2000 // 2, 4, 6 seconds
        break
      case 'fixed':
        delay = 5000 // Always 5 seconds
        break
      default:
        delay = 1000 * attempt
    }

    // Add some jitter to prevent thundering herd
    delay += Math.random() * 1000

    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Log webhook execution attempt
   */
  private async logWebhookExecution(
    webhook: Webhook,
    payload: WebhookPayload,
    result: WebhookExecutionResult,
    attempt: number
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase()

      const logEntry = {
        webhook_id: webhook.id,
        triggered_by_data_id: payload.metadata.request_id,
        trigger_event: payload.event,
        trigger_conditions_met: payload.conditions_met || null,
        request_url: webhook.webhook_url,
        request_method: 'POST',
        request_headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Enostics-Webhook/1.0',
          'X-Enostics-Event': payload.event,
          'X-Enostics-Webhook-Id': webhook.id
        },
        request_payload: payload,
        response_status: result.statusCode || null,
        response_headers: result.responseHeaders || null,
        response_body: result.responseBody || null,
        response_time_ms: result.duration,
        attempt_number: attempt,
        max_attempts: webhook.max_retries + 1,
        is_successful: result.success,
        error_message: result.error || null,
        error_type: result.errorType || null,
        webhook_secret_used: !!webhook.webhook_secret,
        signature_sent: payload.signature || null,
        user_agent: 'Enostics-Webhook/1.0'
      }

      const { error } = await supabase
        .from('enostics_webhook_logs')
        .insert(logEntry)

      if (error) {
        console.error('Error logging webhook execution:', error)
      }
    } catch (error) {
      console.error('Error in logWebhookExecution:', error)
    }
  }

  /**
   * Update webhook statistics
   */
  private async updateWebhookStats(
    webhookId: string,
    userId: string,
    success: boolean,
    duration: number
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase()

      // Increment usage tracking
      await supabase.rpc('increment_webhook_usage', {
        user_uuid: userId,
        webhook_uuid: webhookId,
        success: success
      })

      // Update performance metrics
      if (success && duration > 0) {
        const { data: webhook } = await supabase
          .from('enostics_webhooks')
          .select('avg_response_time_ms, fastest_response_ms, slowest_response_ms, successful_calls')
          .eq('id', webhookId)
          .single()

        if (webhook) {
          const newAvg = webhook.successful_calls > 1 
            ? Math.round((webhook.avg_response_time_ms * (webhook.successful_calls - 1) + duration) / webhook.successful_calls)
            : duration

          const updates: any = {
            avg_response_time_ms: newAvg,
            updated_at: new Date().toISOString()
          }

          if (!webhook.fastest_response_ms || duration < webhook.fastest_response_ms) {
            updates.fastest_response_ms = duration
          }

          if (!webhook.slowest_response_ms || duration > webhook.slowest_response_ms) {
            updates.slowest_response_ms = duration
          }

          await supabase
            .from('enostics_webhooks')
            .update(updates)
            .eq('id', webhookId)
        }
      }
    } catch (error) {
      console.error('Error updating webhook stats:', error)
    }
  }

  /**
   * Test a webhook URL with sample data
   */
  async testWebhook(
    webhookUrl: string,
    webhookSecret?: string,
    sampleData?: any
  ): Promise<WebhookExecutionResult> {
    const testPayload: any = {
      event: 'webhook_test',
      webhook_id: 'test',
      endpoint: {
        id: 'test-endpoint',
        name: 'Test Endpoint',
        url_path: 'test'
      },
      data: sampleData || { test: true, message: 'Webhook test from Enostics' },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: 'test-' + Date.now()
      }
    }

    if (webhookSecret) {
      testPayload.signature = this.generateHMACSignature(testPayload, webhookSecret)
    }

    const testWebhook: Webhook = {
      id: 'test',
      endpoint_id: 'test',
      user_id: 'test',
      name: 'Test Webhook',
      webhook_url: webhookUrl,
      webhook_secret: webhookSecret,
      trigger_events: ['test'],
      trigger_conditions: {},
      is_active: true,
      timeout_seconds: 30,
      max_retries: 0,
      retry_backoff: 'fixed',
      calls_this_month: 0,
      successful_calls: 0,
      failed_calls: 0,
      total_calls: 0,
      avg_response_time_ms: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return this.executeWebhook(testWebhook, testPayload, 1)
  }
}

// Export singleton instance
export const smartWebhooksEngine = new SmartWebhooksEngine() 