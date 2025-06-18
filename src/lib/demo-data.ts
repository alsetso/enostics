// Demo data generation utility for new users

export interface DemoRequestLog {
  id: string
  method: string
  status_code: number
  response_time_ms: number
  source_ip: string
  created_at: string
  error_message?: string
  webhook_sent: boolean
  webhook_status?: number
}

export interface DemoEndpoint {
  id: string
  name: string
  url_path: string
  description: string
  is_demo: boolean
  webhook_enabled: boolean
}

/**
 * Generate realistic demo request logs for showcasing analytics
 */
export function generateDemoRequestLogs(count: number = 25): DemoRequestLog[] {
  const logs: DemoRequestLog[] = []
  const now = new Date()
  
  const methods = ['POST', 'GET', 'PUT', 'PATCH']
  const statusCodes = [200, 201, 400, 401, 403, 404, 500]
  const ips = ['192.168.1.', '10.0.0.', '172.16.0.', '203.0.113.']
  const errors = [
    'Invalid JSON payload',
    'Missing required field: email',
    'Rate limit exceeded',
    'Authentication failed',
    'Endpoint not found'
  ]

  for (let i = 0; i < count; i++) {
    const timeOffset = Math.random() * 24 * 60 * 60 * 1000 // Last 24 hours
    const timestamp = new Date(now.getTime() - timeOffset)
    
    // Bias towards success (80% success rate for demo)
    const isSuccess = Math.random() < 0.8
    const statusCode = isSuccess 
      ? [200, 201][Math.floor(Math.random() * 2)]
      : statusCodes[Math.floor(Math.random() * statusCodes.length)]
    
    const responseTime = isSuccess 
      ? Math.floor(Math.random() * 500) + 50  // 50-550ms for success
      : Math.floor(Math.random() * 2000) + 100 // 100-2100ms for errors
    
    const log: DemoRequestLog = {
      id: `demo-${i + 1}`,
      method: methods[Math.floor(Math.random() * methods.length)],
      status_code: statusCode,
      response_time_ms: responseTime,
      source_ip: ips[Math.floor(Math.random() * ips.length)] + (Math.floor(Math.random() * 255) + 1),
      created_at: timestamp.toISOString(),
      webhook_sent: Math.random() < 0.6, // 60% have webhooks
      webhook_status: Math.random() < 0.9 ? 200 : 500 // 90% webhook success
    }

    // Add error messages for failed requests
    if (!isSuccess && Math.random() < 0.7) {
      log.error_message = errors[Math.floor(Math.random() * errors.length)]
    }

    logs.push(log)
  }

  // Sort by timestamp (newest first)
  return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/**
 * Generate demo endpoints for new users
 */
export function generateDemoEndpoints(): DemoEndpoint[] {
  return [
    {
      id: 'demo-health-tracker',
      name: 'Health Tracker',
      url_path: 'health-data',
      description: 'Receive health metrics from wearables and IoT devices',
      is_demo: true,
      webhook_enabled: true
    },
    {
      id: 'demo-webhook-relay',
      name: 'Webhook Relay',
      url_path: 'webhook-relay',
      description: 'Forward webhook payloads to multiple destinations',
      is_demo: true,
      webhook_enabled: false
    },
    {
      id: 'demo-data-collector',
      name: 'Data Collector',
      url_path: 'collect',
      description: 'General purpose data collection endpoint',
      is_demo: true,
      webhook_enabled: true
    }
  ]
}

/**
 * Calculate analytics from demo request logs
 */
export function calculateDemoAnalytics(logs: DemoRequestLog[]) {
  const total = logs.length
  const successful = logs.filter(log => log.status_code >= 200 && log.status_code < 400).length
  const errors = total - successful
  const avgResponseTime = Math.round(
    logs.reduce((sum, log) => sum + log.response_time_ms, 0) / total
  )

  // Calculate top errors
  const errorMap = new Map<string, number>()
  logs.forEach(log => {
    if (log.error_message) {
      errorMap.set(log.error_message, (errorMap.get(log.error_message) || 0) + 1)
    }
  })

  const topErrors = Array.from(errorMap.entries())
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalRequests: total,
    successRequests: successful,
    errorRequests: errors,
    averageResponseTime: avgResponseTime,
    topErrors,
    successRate: total > 0 ? successful / total : 0
  }
}

/**
 * Check if user has demo data (for cleanup)
 */
export function isDemoData(item: any): boolean {
  return item.id?.startsWith('demo-') || item.is_demo === true
}

/**
 * Generate sample webhook test payload
 */
export function generateDemoWebhookPayload(endpointId: string) {
  return {
    endpoint: {
      id: endpointId,
      name: "Demo Endpoint",
      url_path: "demo-webhook-test"
    },
    request: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Enostics-Demo/1.0"
      },
      data: {
        message: "This is a demo webhook from Enostics!",
        timestamp: new Date().toISOString(),
        demo: true,
        sample_data: {
          user_id: "demo-user-123",
          action: "webhook_test",
          metadata: {
            platform: "Enostics",
            version: "2.5"
          }
        }
      },
      timestamp: new Date().toISOString(),
      source_ip: "192.168.1.100"
    },
    metadata: {
      request_id: `demo-webhook-${Date.now()}`,
      is_demo: true
    }
  }
}

/**
 * Preview mode configuration
 */
export interface PreviewModeConfig {
  enabled: boolean
  simulateDelay: boolean
  simulateErrors: boolean
  errorRate: number // 0.0 to 1.0
  avgResponseTime: number // milliseconds
}

export const defaultPreviewConfig: PreviewModeConfig = {
  enabled: false,
  simulateDelay: true,
  simulateErrors: true,
  errorRate: 0.1, // 10% error rate
  avgResponseTime: 200
}

/**
 * Simulate endpoint response in preview mode
 */
export function simulateEndpointResponse(config: PreviewModeConfig) {
  const isError = Math.random() < config.errorRate
  const baseDelay = config.avgResponseTime
  const delay = baseDelay + (Math.random() * baseDelay * 0.5) // ±25% variance
  
  return new Promise((resolve) => {
    const responseTime = config.simulateDelay ? delay : 0
    
    setTimeout(() => {
      if (isError) {
        resolve({
          success: false,
          status: 500,
          error: 'Simulated error for preview mode',
          response_time: Math.round(responseTime)
        })
      } else {
        resolve({
          success: true,
          status: 200,
          message: 'Preview mode - request simulated successfully',
          timestamp: new Date().toISOString(),
          response_time: Math.round(responseTime)
        })
      }
    }, responseTime)
  })
} 