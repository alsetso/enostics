// Enhanced Payload Enrichment System
// Industry best practices for maximizing data quality and sender identification

export interface EnhancedPayloadData {
  // Core payload
  raw_payload: any
  
  // Sender identification (multiple methods)
  sender: {
    // Method 1: Explicit sender fields in payload
    explicit_id?: string          // payload.sender_id, payload.user_id, payload.client_id
    explicit_name?: string        // payload.sender, payload.from, payload.user_name
    explicit_email?: string       // payload.email, payload.sender_email
    explicit_org?: string         // payload.organization, payload.company
    
    // Method 2: API authentication
    api_key_id?: string          // Which API key was used
    api_key_name?: string        // Named API key (e.g. "Mobile App", "IoT Sensors")
    
    // Method 3: Technical fingerprinting  
    ip_address?: string
    user_agent?: string
    device_fingerprint?: string
    session_id?: string
    
    // Method 4: Inferred from payload patterns
    inferred_source?: string     // Based on data structure/patterns
    confidence_score?: number    // How confident we are about sender ID
  }
  
  // Payload structure analysis
  structure: {
    schema_detected?: string     // JSON schema or known format
    field_count: number
    nested_levels: number
    data_types: string[]         // array, object, string, number, etc.
    known_standards?: string[]   // ISO formats, RFC standards detected
  }
  
  // Content analysis
  content: {
    category: string             // health, iot, financial, etc.
    subcategory?: string         // heart_rate, temperature, payment, etc.
    confidence: number
    key_fields: string[]         // Most important fields detected
    sensitive_data: boolean      // Contains PII/sensitive info
    data_quality_score: number   // 0-100 based on completeness/validity
  }
  
  // Context enrichment
  context: {
    timestamp_fields: string[]   // All timestamp fields found
    location_fields: string[]    // All location data found
    reference_ids: string[]      // External IDs, correlation IDs
    business_context?: string    // Order, transaction, event, etc.
  }
  
  // Industry-specific enhancements
  industry_data?: {
    healthcare?: HealthcareData
    iot?: IoTData
    financial?: FinancialData
    ecommerce?: EcommerceData
  }
}

// Healthcare-specific data structure
interface HealthcareData {
  patient_id?: string
  provider_id?: string
  measurement_type?: string
  units?: string
  normal_range?: { min: number; max: number }
  clinical_significance?: string
}

// IoT-specific data structure  
interface IoTData {
  device_id?: string
  device_type?: string
  sensor_type?: string
  location?: { lat: number; lng: number }
  battery_level?: number
  signal_strength?: number
  firmware_version?: string
}

// Financial-specific data structure
interface FinancialData {
  transaction_id?: string
  account_id?: string
  merchant?: string
  amount?: number
  currency?: string
  category?: string
  risk_score?: number
}

// E-commerce specific data structure
interface EcommerceData {
  order_id?: string
  customer_id?: string
  product_ids?: string[]
  total_amount?: number
  payment_method?: string
  shipping_address?: any
}

/**
 * Enhanced payload enrichment - extracts maximum information
 */
export function enrichPayload(
  payload: any,
  headers: Record<string, string>,
  apiKeyInfo?: { id: string; name: string }
): EnhancedPayloadData {
  
  const enriched: EnhancedPayloadData = {
    raw_payload: payload,
    sender: extractSenderInfo(payload, headers, apiKeyInfo),
    structure: analyzeStructure(payload),
    content: analyzeContent(payload),
    context: extractContext(payload),
  }
  
  // Add industry-specific analysis
  enriched.industry_data = analyzeIndustrySpecific(payload, enriched.content.category)
  
  return enriched
}

/**
 * Extract sender information using multiple methods
 */
function extractSenderInfo(
  payload: any,
  headers: Record<string, string>,
  apiKeyInfo?: { id: string; name: string }
): EnhancedPayloadData['sender'] {
  
  const sender: EnhancedPayloadData['sender'] = {}
  
  // Method 1: Explicit fields in payload
  if (typeof payload === 'object' && payload !== null) {
    // Common sender ID fields
    sender.explicit_id = payload.sender_id || payload.user_id || payload.client_id || 
                        payload.device_id || payload.account_id || payload.customer_id
    
    // Common sender name fields  
    sender.explicit_name = payload.sender || payload.from || payload.user_name || 
                          payload.client_name || payload.device_name
    
    // Email fields
    sender.explicit_email = payload.email || payload.sender_email || payload.user_email
    
    // Organization fields
    sender.explicit_org = payload.organization || payload.company || payload.org || 
                         payload.tenant || payload.workspace
  }
  
  // Method 2: API Key information
  if (apiKeyInfo) {
    sender.api_key_id = apiKeyInfo.id
    sender.api_key_name = apiKeyInfo.name
  }
  
  // Method 3: Technical fingerprinting
  sender.ip_address = headers['x-forwarded-for'] || headers['x-real-ip']
  sender.user_agent = headers['user-agent']
  sender.session_id = extractSessionId(payload, headers)
  sender.device_fingerprint = generateDeviceFingerprint(headers, payload)
  
  // Method 4: Inferred source
  const inferred = inferSenderFromPayload(payload, headers)
  sender.inferred_source = inferred.source
  sender.confidence_score = inferred.confidence
  
  return sender
}

function extractSessionId(payload: any, headers: Record<string, string>): string | undefined {
  return payload?.session_id || payload?.sessionId || 
         headers['x-session-id'] || headers['session-id']
}

function generateDeviceFingerprint(headers: Record<string, string>, payload: any): string | undefined {
  const components = [
    headers['user-agent'],
    headers['accept-language'],
    payload?.screen_resolution,
    payload?.timezone,
    payload?.device_type
  ].filter(Boolean)
  
  if (components.length === 0) return undefined
  
  // Simple hash of components
  return Buffer.from(components.join('|')).toString('base64').slice(0, 16)
}

function inferSenderFromPayload(payload: any, headers: Record<string, string>): { source: string; confidence: number } {
  // Look for patterns that indicate the sender type
  if (headers['user-agent']?.includes('Arduino') || payload?.device_type?.includes('sensor')) {
    return { source: 'iot_device', confidence: 0.8 }
  }
  
  if (payload?.app_name || headers['user-agent']?.includes('Mobile')) {
    return { source: 'mobile_app', confidence: 0.7 }
  }
  
  if (payload?.webhook_source || headers['user-agent']?.includes('webhook')) {
    return { source: 'webhook', confidence: 0.9 }
  }
  
  return { source: 'unknown', confidence: 0.1 }
}

/**
 * Analyze payload structure
 */
function analyzeStructure(payload: any): EnhancedPayloadData['structure'] {
  if (typeof payload !== 'object' || payload === null) {
    return {
      field_count: 0,
      nested_levels: 0,
      data_types: [typeof payload]
    }
  }
  
  const structure = {
    field_count: Object.keys(payload).length,
    nested_levels: calculateNestingDepth(payload),
    data_types: extractDataTypes(payload),
    known_standards: detectKnownStandards(payload),
    schema_detected: detectSchema(payload)
  }
  
  return structure
}

function calculateNestingDepth(obj: any, depth = 0): number {
  if (typeof obj !== 'object' || obj === null) return depth
  
  let maxDepth = depth
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      maxDepth = Math.max(maxDepth, calculateNestingDepth(value, depth + 1))
    }
  }
  return maxDepth
}

function extractDataTypes(obj: any): string[] {
  if (typeof obj !== 'object' || obj === null) return [typeof obj]
  
  const types = new Set<string>()
  
  function traverse(value: any) {
    if (Array.isArray(value)) {
      types.add('array')
      value.forEach(traverse)
    } else if (value !== null && typeof value === 'object') {
      types.add('object')
      Object.values(value).forEach(traverse)
    } else {
      types.add(typeof value)
    }
  }
  
  traverse(obj)
  return Array.from(types)
}

function detectKnownStandards(payload: any): string[] {
  const standards: string[] = []
  const payloadStr = JSON.stringify(payload)
  
  // ISO 8601 timestamps
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(payloadStr)) {
    standards.push('ISO_8601')
  }
  
  // UUID format
  if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(payloadStr)) {
    standards.push('UUID')
  }
  
  // Email format
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(payloadStr)) {
    standards.push('EMAIL')
  }
  
  // Phone numbers
  if (/\+?[1-9]\d{1,14}/.test(payloadStr)) {
    standards.push('E164_PHONE')
  }
  
  return standards
}

function detectSchema(payload: any): string | undefined {
  // Common schema patterns
  if (payload?.type === 'health' && payload?.measurements) {
    return 'health_measurement_v1'
  }
  
  if (payload?.sensor_id && payload?.readings) {
    return 'iot_sensor_data_v1'
  }
  
  if (payload?.transaction_id && payload?.amount) {
    return 'financial_transaction_v1'
  }
  
  return undefined
}

/**
 * Analyze content for categorization and quality
 */
function analyzeContent(payload: any): EnhancedPayloadData['content'] {
  const analysis = classifyPayloadContent(payload)
  
  return {
    category: analysis.category,
    subcategory: analysis.subcategory,
    confidence: analysis.confidence,
    key_fields: extractKeyFields(payload),
    sensitive_data: detectSensitiveData(payload),
    data_quality_score: calculateDataQuality(payload)
  }
}

function classifyPayloadContent(payload: any): { category: string; subcategory?: string; confidence: number } {
  // Implementation similar to existing classification but more detailed
  // This would use your existing classification logic but enhanced
  return { category: 'general', confidence: 0.5 }
}

function extractKeyFields(payload: any): string[] {
  if (typeof payload !== 'object' || payload === null) return []
  
  // Fields that are typically most important
  const importantFields = [
    'id', 'user_id', 'transaction_id', 'order_id', 'device_id',
    'timestamp', 'created_at', 'updated_at',
    'amount', 'value', 'measurement', 'reading',
    'status', 'state', 'type', 'category'
  ]
  
  return Object.keys(payload).filter(key => 
    importantFields.includes(key.toLowerCase()) ||
    key.endsWith('_id') ||
    key.endsWith('_at') ||
    key.includes('timestamp')
  )
}

function detectSensitiveData(payload: any): boolean {
  const payloadStr = JSON.stringify(payload).toLowerCase()
  
  const sensitivePatterns = [
    /ssn|social.security/,
    /credit.card|card.number/,
    /password|passwd/,
    /api.key|secret/,
    /bank.account|routing.number/,
    /medical.record|patient.id/
  ]
  
  return sensitivePatterns.some(pattern => pattern.test(payloadStr))
}

function calculateDataQuality(payload: any): number {
  if (typeof payload !== 'object' || payload === null) return 20
  
  let score = 50 // Base score
  
  const keys = Object.keys(payload)
  
  // More fields generally better
  if (keys.length > 5) score += 10
  if (keys.length > 10) score += 10
  
  // Check for timestamps
  if (findTimestampFields(payload).length > 0) score += 15
  
  // Check for IDs
  if (findReferenceIds(payload).length > 0) score += 15
  
  // Check for null/empty values
  const emptyValues = keys.filter(key => 
    payload[key] === null || payload[key] === undefined || payload[key] === ''
  ).length
  
  score -= (emptyValues / keys.length) * 20
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Extract contextual information
 */
function extractContext(payload: any): EnhancedPayloadData['context'] {
  return {
    timestamp_fields: findTimestampFields(payload),
    location_fields: findLocationFields(payload),
    reference_ids: findReferenceIds(payload),
    business_context: inferBusinessContext(payload)
  }
}

function findTimestampFields(payload: any): string[] {
  if (typeof payload !== 'object' || payload === null) return []
  
  const timestampFields: string[] = []
  
  function traverse(obj: any, path = '') {
    if (typeof obj !== 'object' || obj === null) return
    
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key
      
      // Check if field name suggests timestamp
      if (key.includes('time') || key.includes('date') || key.endsWith('_at')) {
        timestampFields.push(fullPath)
      }
      
      // Check if value looks like timestamp
      if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}/.test(value)) {
        timestampFields.push(fullPath)
      }
      
      if (typeof value === 'object') {
        traverse(value, fullPath)
      }
    }
  }
  
  traverse(payload)
  return timestampFields
}

function findLocationFields(payload: any): string[] {
  if (typeof payload !== 'object' || payload === null) return []
  
  const locationFields: string[] = []
  const locationKeys = ['lat', 'lng', 'latitude', 'longitude', 'location', 'coordinates', 'address', 'city', 'country']
  
  function traverse(obj: any, path = '') {
    if (typeof obj !== 'object' || obj === null) return
    
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key
      
      if (locationKeys.some(locKey => key.toLowerCase().includes(locKey))) {
        locationFields.push(fullPath)
      }
      
      if (typeof value === 'object') {
        traverse(value, fullPath)
      }
    }
  }
  
  traverse(payload)
  return locationFields
}

function findReferenceIds(payload: any): string[] {
  if (typeof payload !== 'object' || payload === null) return []
  
  const idFields: string[] = []
  
  function traverse(obj: any, path = '') {
    if (typeof obj !== 'object' || obj === null) return
    
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key
      
      if (key.endsWith('_id') || key === 'id' || key.includes('uuid')) {
        idFields.push(fullPath)
      }
      
      if (typeof value === 'object') {
        traverse(value, fullPath)
      }
    }
  }
  
  traverse(payload)
  return idFields
}

function inferBusinessContext(payload: any): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  
  const keys = Object.keys(payload).map(k => k.toLowerCase())
  
  if (keys.some(k => k.includes('order') || k.includes('purchase'))) return 'ecommerce'
  if (keys.some(k => k.includes('transaction') || k.includes('payment'))) return 'financial'
  if (keys.some(k => k.includes('health') || k.includes('medical'))) return 'healthcare'
  if (keys.some(k => k.includes('sensor') || k.includes('device'))) return 'iot'
  if (keys.some(k => k.includes('user') || k.includes('profile'))) return 'user_management'
  if (keys.some(k => k.includes('event') || k.includes('log'))) return 'system_events'
  
  return undefined
}

function analyzeIndustrySpecific(payload: any, category: string): EnhancedPayloadData['industry_data'] {
  const industryData: EnhancedPayloadData['industry_data'] = {}
  
  switch (category) {
    case 'healthcare':
    case 'health':
      industryData.healthcare = extractHealthcareData(payload)
      break
    case 'iot':
    case 'sensor':
      industryData.iot = extractIoTData(payload)
      break
    case 'financial':
    case 'finance':
      industryData.financial = extractFinancialData(payload)
      break
    case 'ecommerce':
    case 'commerce':
      industryData.ecommerce = extractEcommerceData(payload)
      break
  }
  
  return Object.keys(industryData).length > 0 ? industryData : undefined
}

function extractHealthcareData(payload: any): HealthcareData | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  
  return {
    patient_id: payload.patient_id || payload.user_id,
    provider_id: payload.provider_id || payload.clinic_id,
    measurement_type: payload.measurement_type || payload.type,
    units: payload.units || payload.unit,
    normal_range: payload.normal_range,
    clinical_significance: payload.clinical_significance || payload.significance
  }
}

function extractIoTData(payload: any): IoTData | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  
  return {
    device_id: payload.device_id || payload.sensor_id,
    device_type: payload.device_type || payload.sensor_type,
    sensor_type: payload.sensor_type,
    location: payload.location || (payload.lat && payload.lng ? { lat: payload.lat, lng: payload.lng } : undefined),
    battery_level: payload.battery_level || payload.battery,
    signal_strength: payload.signal_strength || payload.rssi,
    firmware_version: payload.firmware_version || payload.version
  }
}

function extractFinancialData(payload: any): FinancialData | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  
  return {
    transaction_id: payload.transaction_id || payload.txn_id || payload.id,
    account_id: payload.account_id || payload.account,
    merchant: payload.merchant || payload.vendor,
    amount: payload.amount || payload.value,
    currency: payload.currency || payload.curr,
    category: payload.category || payload.type,
    risk_score: payload.risk_score || payload.fraud_score
  }
}

function extractEcommerceData(payload: any): EcommerceData | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  
  return {
    order_id: payload.order_id || payload.order_number,
    customer_id: payload.customer_id || payload.user_id,
    product_ids: payload.product_ids || payload.items?.map((item: any) => item.product_id),
    total_amount: payload.total_amount || payload.total || payload.amount,
    payment_method: payload.payment_method || payload.payment_type,
    shipping_address: payload.shipping_address || payload.address
  }
} 