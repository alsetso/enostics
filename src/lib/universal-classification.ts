// Universal Classification Engine for Enostics
// Intelligently classifies incoming data payloads

export interface ClassificationResult {
  type: string
  source: string
  tags: string[]
  confidence: number
  contentSummary: string
  qualityScore: number
  metadata: Record<string, any>
}

export interface DataTypeDefinition {
  name: string
  displayName: string
  category: string
  icon: string
  color: string
  patterns: {
    required?: string[]
    optional?: string[]
    keywords?: string[]
  }
}

export interface DataSourceDefinition {
  name: string
  displayName: string
  category: string
  icon: string
  color: string
  patterns: {
    userAgents?: string[]
    domains?: string[]
    fields?: string[]
  }
}

// Predefined data types for classification
export const DATA_TYPES: DataTypeDefinition[] = [
  {
    name: 'sensor_data',
    displayName: 'Sensor Data',
    category: 'iot',
    icon: 'thermometer',
    color: '#10B981',
    patterns: {
      required: ['temperature', 'humidity', 'sensor_id', 'pressure', 'light'],
      optional: ['location', 'battery', 'signal_strength'],
      keywords: ['sensor', 'reading', 'measurement', 'device']
    }
  },
  {
    name: 'health_data',
    displayName: 'Health Data',
    category: 'health',
    icon: 'heart',
    color: '#EF4444',
    patterns: {
      required: ['heart_rate', 'steps', 'sleep_hours', 'blood_pressure', 'weight', 'calories'],
      optional: ['date', 'activity', 'mood'],
      keywords: ['health', 'medical', 'fitness', 'wellness']
    }
  },
  {
    name: 'financial_data',
    displayName: 'Financial Data',
    category: 'finance',
    icon: 'dollar-sign',
    color: '#F59E0B',
    patterns: {
      required: ['amount', 'currency', 'transaction_id', 'merchant', 'account'],
      optional: ['category', 'description', 'balance'],
      keywords: ['payment', 'transaction', 'bank', 'money', 'purchase']
    }
  },
  {
    name: 'location_data',
    displayName: 'Location Data',
    category: 'location',
    icon: 'map-pin',
    color: '#3B82F6',
    patterns: {
      required: ['lat', 'lng', 'latitude', 'longitude', 'coordinates'],
      optional: ['accuracy', 'altitude', 'speed', 'heading'],
      keywords: ['location', 'gps', 'coordinates', 'position']
    }
  },
  {
    name: 'message',
    displayName: 'Message',
    category: 'communication',
    icon: 'message-circle',
    color: '#8B5CF6',
    patterns: {
      required: ['message', 'content', 'text', 'body'],
      optional: ['sender', 'recipient', 'subject'],
      keywords: ['message', 'chat', 'communication', 'text']
    }
  },
  {
    name: 'event',
    displayName: 'Event',
    category: 'system',
    icon: 'bell',
    color: '#F97316',
    patterns: {
      required: ['event', 'action', 'trigger', 'notification'],
      optional: ['timestamp', 'severity', 'data'],
      keywords: ['event', 'notification', 'alert', 'trigger']
    }
  },
  {
    name: 'task',
    displayName: 'Task',
    category: 'productivity',
    icon: 'check-square',
    color: '#06B6D4',
    patterns: {
      required: ['task', 'todo', 'reminder', 'assignment'],
      optional: ['due_date', 'priority', 'status', 'assignee'],
      keywords: ['task', 'todo', 'reminder', 'assignment', 'work']
    }
  },
  {
    name: 'note',
    displayName: 'Note',
    category: 'content',
    icon: 'file-text',
    color: '#6B7280',
    patterns: {
      required: ['note', 'notes', 'content', 'text'],
      optional: ['title', 'tags', 'category'],
      keywords: ['note', 'notes', 'content', 'memo']
    }
  },
  {
    name: 'media',
    displayName: 'Media',
    category: 'media',
    icon: 'image',
    color: '#EC4899',
    patterns: {
      required: ['image', 'video', 'audio', 'file', 'media'],
      optional: ['url', 'size', 'format', 'duration'],
      keywords: ['media', 'file', 'image', 'video', 'audio']
    }
  }
]

// Predefined data sources for classification
export const DATA_SOURCES: DataSourceDefinition[] = [
  {
    name: 'iot_device',
    displayName: 'IoT Device',
    category: 'device',
    icon: 'cpu',
    color: '#10B981',
    patterns: {
      fields: ['device_id', 'hardware_id', 'sensor_id', 'mac_address'],
      userAgents: ['arduino', 'raspberry', 'esp32', 'sensor'],
      domains: []
    }
  },
  {
    name: 'mobile_app',
    displayName: 'Mobile App',
    category: 'app',
    icon: 'smartphone',
    color: '#3B82F6',
    patterns: {
      fields: ['app_name', 'app_version', 'device_type'],
      userAgents: ['iPhone', 'Android', 'Mobile', 'iOS'],
      domains: []
    }
  },
  {
    name: 'web_app',
    displayName: 'Web App',
    category: 'app',
    icon: 'globe',
    color: '#8B5CF6',
    patterns: {
      fields: ['browser', 'user_agent', 'session_id'],
      userAgents: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      domains: []
    }
  },
  {
    name: 'webhook',
    displayName: 'Webhook',
    category: 'integration',
    icon: 'link',
    color: '#F59E0B',
    patterns: {
      fields: ['webhook_source', 'webhook_id', 'event_type'],
      userAgents: ['webhook', 'zapier', 'ifttt'],
      domains: ['zapier.com', 'ifttt.com', 'github.com', 'stripe.com']
    }
  },
  {
    name: 'gpt_agent',
    displayName: 'GPT Agent',
    category: 'ai',
    icon: 'brain',
    color: '#EC4899',
    patterns: {
      fields: ['agent_id', 'model', 'assistant_id'],
      userAgents: ['gpt', 'openai', 'assistant', 'agent'],
      domains: ['openai.com']
    }
  },
  {
    name: 'api_client',
    displayName: 'API Client',
    category: 'integration',
    icon: 'code',
    color: '#06B6D4',
    patterns: {
      fields: ['client_id', 'api_key', 'client_name'],
      userAgents: ['curl', 'postman', 'insomnia', 'axios'],
      domains: []
    }
  }
]

/**
 * Classify a payload and extract metadata
 */
export function classifyPayload(
  payload: any,
  userAgent?: string,
  referer?: string
): ClassificationResult {
  const result: ClassificationResult = {
    type: 'unknown',
    source: 'unknown',
    tags: [],
    confidence: 0.5,
    contentSummary: '',
    qualityScore: 50,
    metadata: {}
  }

  // Extract explicit metadata (highest priority)
  const explicitType = payload.type || payload.kind || payload.category
  const explicitSource = payload.source || payload.from || payload.origin
  const explicitTags = Array.isArray(payload.tags) ? payload.tags : 
                      Array.isArray(payload.labels) ? payload.labels : []

  // Start with explicit values
  if (explicitType) {
    result.type = explicitType
    result.confidence = 0.95
  }

  if (explicitSource) {
    result.source = explicitSource
  }

  result.tags = [...explicitTags]

  // Infer type from payload structure if not explicit
  if (!explicitType) {
    const typeResult = inferDataType(payload)
    if (typeResult.type !== 'unknown') {
      result.type = typeResult.type
      result.confidence = typeResult.confidence
      result.metadata.inferredType = true
    }
  }

  // Infer source if not explicit
  if (!explicitSource) {
    const sourceResult = inferDataSource(payload, userAgent, referer)
    if (sourceResult.source !== 'unknown') {
      result.source = sourceResult.source
      result.metadata.inferredSource = true
    }
  }

  // Generate auto-tags
  const autoTags = generateAutoTags(payload, result.type)
  result.tags = Array.from(new Set([...result.tags, ...autoTags]))

  // Generate content summary
  result.contentSummary = generateContentSummary(payload)

  // Calculate quality score
  result.qualityScore = calculateQualityScore(payload)

  // Add processing metadata
  result.metadata = {
    ...result.metadata,
    fieldCount: Object.keys(payload).length,
    hasTimestamp: !!(payload.timestamp || payload.created_at || payload.date),
    hasExplicitMetadata: !!(explicitType || explicitSource || explicitTags.length > 0),
    processingTime: Date.now()
  }

  return result
}

/**
 * Infer data type from payload structure
 */
function inferDataType(payload: any): { type: string; confidence: number } {
  for (const dataType of DATA_TYPES) {
    let score = 0
    let maxScore = 0

    // Check required fields
    if (dataType.patterns.required) {
      for (const field of dataType.patterns.required) {
        maxScore += 10
        if (payload.hasOwnProperty(field)) {
          score += 10
        }
      }
    }

    // Check optional fields
    if (dataType.patterns.optional) {
      for (const field of dataType.patterns.optional) {
        maxScore += 5
        if (payload.hasOwnProperty(field)) {
          score += 5
        }
      }
    }

    // Check keywords in content
    if (dataType.patterns.keywords) {
      const payloadStr = JSON.stringify(payload).toLowerCase()
      for (const keyword of dataType.patterns.keywords) {
        maxScore += 3
        if (payloadStr.includes(keyword.toLowerCase())) {
          score += 3
        }
      }
    }

    // Calculate confidence
    const confidence = maxScore > 0 ? score / maxScore : 0

    // Return if confidence is high enough
    if (confidence >= 0.6) {
      return {
        type: dataType.name,
        confidence: Math.min(0.95, confidence)
      }
    }
  }

  return { type: 'unknown', confidence: 0.5 }
}

/**
 * Infer data source from payload and request metadata
 */
function inferDataSource(
  payload: any,
  userAgent?: string,
  referer?: string
): { source: string; confidence: number } {
  for (const dataSource of DATA_SOURCES) {
    let score = 0
    let maxScore = 0

    // Check field patterns
    if (dataSource.patterns.fields) {
      for (const field of dataSource.patterns.fields) {
        maxScore += 10
        if (payload.hasOwnProperty(field)) {
          score += 10
        }
      }
    }

    // Check user agent patterns
    if (userAgent && dataSource.patterns.userAgents) {
      for (const pattern of dataSource.patterns.userAgents) {
        maxScore += 8
        if (userAgent.toLowerCase().includes(pattern.toLowerCase())) {
          score += 8
        }
      }
    }

    // Check domain patterns
    if (referer && dataSource.patterns.domains) {
      for (const domain of dataSource.patterns.domains) {
        maxScore += 8
        if (referer.toLowerCase().includes(domain.toLowerCase())) {
          score += 8
        }
      }
    }

    // Calculate confidence
    const confidence = maxScore > 0 ? score / maxScore : 0

    // Return if confidence is high enough
    if (confidence >= 0.6) {
      return {
        source: dataSource.name,
        confidence: Math.min(0.95, confidence)
      }
    }
  }

  return { source: 'unknown', confidence: 0.5 }
}

/**
 * Generate automatic tags based on content
 */
function generateAutoTags(payload: any, dataType: string): string[] {
  const tags: string[] = []

  // Priority-based tags
  if (payload.urgent || payload.priority === 'high' || payload.priority === 'urgent') {
    tags.push('urgent')
  }

  if (payload.priority === 'low') {
    tags.push('low-priority')
  }

  // Category-based tags
  if (dataType === 'health_data' || payload.health || payload.medical) {
    tags.push('health')
  }

  if (payload.work || payload.business || payload.office) {
    tags.push('work')
  }

  if (payload.personal || payload.private) {
    tags.push('personal')
  }

  if (payload.public) {
    tags.push('public')
  }

  // Time-based tags
  const now = new Date()
  const hour = now.getHours()
  
  if (hour >= 9 && hour <= 17) {
    tags.push('business-hours')
  } else {
    tags.push('after-hours')
  }

  // Content-based tags
  const contentStr = JSON.stringify(payload).toLowerCase()
  
  if (contentStr.includes('error') || contentStr.includes('fail')) {
    tags.push('error')
  }

  if (contentStr.includes('success') || contentStr.includes('complete')) {
    tags.push('success')
  }

  if (contentStr.includes('test') || contentStr.includes('demo')) {
    tags.push('test')
  }

  return tags
}

/**
 * Generate content summary
 */
function generateContentSummary(payload: any): string {
  // Try different content fields in order of preference
  const contentFields = ['content', 'message', 'text', 'body', 'description', 'summary']
  
  for (const field of contentFields) {
    if (payload[field] && typeof payload[field] === 'string') {
      return payload[field].substring(0, 100) + (payload[field].length > 100 ? '...' : '')
    }
  }

  // Fallback to stringified payload
  const str = JSON.stringify(payload)
  return str.substring(0, 100) + (str.length > 100 ? '...' : '')
}

/**
 * Calculate data quality score (0-100)
 */
function calculateQualityScore(payload: any): number {
  let score = 50 // Base score

  const fieldCount = Object.keys(payload).length

  // Score based on structure richness
  if (fieldCount >= 10) {
    score += 20
  } else if (fieldCount >= 5) {
    score += 10
  } else if (fieldCount <= 2) {
    score -= 10
  }

  // Bonus for explicit metadata
  if (payload.type) score += 10
  if (payload.source) score += 10
  if (payload.tags || payload.labels) score += 5
  if (payload.timestamp || payload.created_at || payload.date) score += 5

  // Bonus for structured data
  if (payload.id || payload.uuid) score += 5
  if (payload.version || payload.v) score += 3

  // Penalty for missing common fields
  if (!payload.timestamp && !payload.created_at && !payload.date) {
    score -= 5
  }

  // Penalty for very large payloads (potential spam)
  const payloadSize = JSON.stringify(payload).length
  if (payloadSize > 10000) {
    score -= 15
  } else if (payloadSize > 5000) {
    score -= 5
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Get data type definition by name
 */
export function getDataTypeDefinition(typeName: string): DataTypeDefinition | undefined {
  return DATA_TYPES.find(type => type.name === typeName)
}

/**
 * Get data source definition by name
 */
export function getDataSourceDefinition(sourceName: string): DataSourceDefinition | undefined {
  return DATA_SOURCES.find(source => source.name === sourceName)
}

/**
 * Get all available data types
 */
export function getAllDataTypes(): DataTypeDefinition[] {
  return DATA_TYPES
}

/**
 * Get all available data sources
 */
export function getAllDataSources(): DataSourceDefinition[] {
  return DATA_SOURCES
} 