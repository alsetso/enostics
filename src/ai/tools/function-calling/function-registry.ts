/**
 * Function Calling Registry for OpenAI Models
 * 
 * Provides structured function definitions for OpenAI function calling
 */

export interface FunctionDefinition {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
}

export interface FunctionHandler {
  (args: Record<string, any>): Promise<any>
}

export class FunctionRegistry {
  private functions = new Map<string, FunctionHandler>()
  private definitions: FunctionDefinition[] = []

  constructor() {
    this.registerCoreFunctions()
  }

  /**
   * Register a function for OpenAI function calling
   */
  register(definition: FunctionDefinition, handler: FunctionHandler) {
    this.functions.set(definition.name, handler)
    this.definitions.push(definition)
  }

  /**
   * Execute a function call from OpenAI
   */
  async execute(functionName: string, args: Record<string, any>): Promise<any> {
    const handler = this.functions.get(functionName)
    if (!handler) {
      throw new Error(`Function ${functionName} not found`)
    }
    return await handler(args)
  }

  /**
   * Get all function definitions for OpenAI
   */
  getDefinitions(): FunctionDefinition[] {
    return this.definitions
  }

  /**
   * Register core functions
   */
  private registerCoreFunctions() {
    // Web browsing function
    this.register({
      name: 'browse_web',
      description: 'Browse a website and extract content for analysis',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to browse'
          },
          extract_type: {
            type: 'string',
            enum: ['text', 'links', 'images', 'metadata'],
            description: 'Type of content to extract'
          }
        },
        required: ['url']
      }
    }, this.browseWeb)

    // Data analysis function
    this.register({
      name: 'analyze_payload',
      description: 'Analyze JSON payload for patterns, anomalies, and insights',
      parameters: {
        type: 'object',
        properties: {
          payload: {
            type: 'object',
            description: 'The JSON payload to analyze'
          },
          analysis_type: {
            type: 'string',
            enum: ['health', 'financial', 'iot', 'general', 'security'],
            description: 'Type of analysis to perform'
          }
        },
        required: ['payload']
      }
    }, this.analyzePayload)

    // Database query function
    this.register({
      name: 'query_database',
      description: 'Query the user database for related data and patterns',
      parameters: {
        type: 'object',
        properties: {
          table: {
            type: 'string',
            enum: ['data', 'endpoints', 'users'],
            description: 'Database table to query'
          },
          filters: {
            type: 'object',
            description: 'Filters to apply to the query'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of records to return'
          }
        },
        required: ['table']
      }
    }, this.queryDatabase)

    // External API function
    this.register({
      name: 'call_external_api',
      description: 'Make calls to external APIs for data enrichment',
      parameters: {
        type: 'object',
        properties: {
          api_type: {
            type: 'string',
            enum: ['weather', 'stocks', 'news', 'health', 'geolocation'],
            description: 'Type of external API to call'
          },
          parameters: {
            type: 'object',
            description: 'Parameters for the API call'
          }
        },
        required: ['api_type']
      }
    }, this.callExternalAPI)

    // Classification function
    this.register({
      name: 'classify_data',
      description: 'Classify and tag incoming data with business context',
      parameters: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            description: 'Data to classify'
          },
          confidence_threshold: {
            type: 'number',
            description: 'Minimum confidence threshold for classification'
          }
        },
        required: ['data']
      }
    }, this.classifyData)

    // Risk assessment function
    this.register({
      name: 'assess_risk',
      description: 'Assess security and quality risks in data payloads',
      parameters: {
        type: 'object',
        properties: {
          payload: {
            type: 'object',
            description: 'Payload to assess for risks'
          },
          check_types: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['security', 'privacy', 'quality', 'spam']
            },
            description: 'Types of risk checks to perform'
          }
        },
        required: ['payload']
      }
    }, this.assessRisk)
  }

  /**
   * Function implementations
   */
  private async browseWeb(args: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(args.url)
      const html = await response.text()
      
      // Simple text extraction (in production, use a proper HTML parser)
      const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      
      return {
        url: args.url,
        status: response.status,
        content: textContent.substring(0, 2000), // Limit content size
        metadata: {
          title: html.match(/<title>(.*?)<\/title>/i)?.[1] || '',
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        error: `Failed to browse ${args.url}: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  private async analyzePayload(args: Record<string, any>): Promise<any> {
    const payload = args.payload
    const analysisType = args.analysis_type || 'general'
    
    // Perform different analyses based on type
    const analysis = {
      type: analysisType,
      timestamp: new Date().toISOString(),
      insights: [] as string[],
      patterns: [] as string[],
      anomalies: [] as string[],
      recommendations: [] as string[]
    }

    // General analysis
    const keys = Object.keys(payload)
    analysis.insights.push(`Payload contains ${keys.length} fields`)
    
    // Type-specific analysis
    if (analysisType === 'health') {
      const healthFields = keys.filter(k => 
        ['heart_rate', 'blood_pressure', 'temperature', 'weight', 'steps'].some(h => 
          k.toLowerCase().includes(h.toLowerCase())
        )
      )
      if (healthFields.length > 0) {
        analysis.insights.push(`Health-related fields detected: ${healthFields.join(', ')}`)
        analysis.recommendations.push('Consider HIPAA compliance for health data')
      }
    }

    if (analysisType === 'iot') {
      const iotFields = keys.filter(k => 
        ['sensor', 'device', 'temperature', 'humidity', 'battery'].some(i => 
          k.toLowerCase().includes(i.toLowerCase())
        )
      )
      if (iotFields.length > 0) {
        analysis.insights.push(`IoT device fields detected: ${iotFields.join(', ')}`)
        analysis.recommendations.push('Monitor device battery levels and connectivity')
      }
    }

    return analysis
  }

  private async queryDatabase(args: Record<string, any>): Promise<any> {
    // This would integrate with your Supabase client
    // For now, return a mock response
    return {
      table: args.table,
      results: [],
      count: 0,
      message: 'Database query function - implement Supabase integration'
    }
  }

  private async callExternalAPI(args: Record<string, any>): Promise<any> {
    const { api_type, parameters = {} } = args
    
    try {
      switch (api_type) {
        case 'weather':
          // Mock weather API call
          return {
            api_type: 'weather',
            location: parameters.location || 'Unknown',
            temperature: Math.round(Math.random() * 30 + 10),
            condition: 'Partly Cloudy',
            timestamp: new Date().toISOString()
          }
        
        case 'geolocation':
          if (parameters.ip) {
            // Mock IP geolocation
            return {
              api_type: 'geolocation',
              ip: parameters.ip,
              country: 'United States',
              city: 'San Francisco',
              timezone: 'America/Los_Angeles'
            }
          }
          break
          
        default:
          return { error: `API type ${api_type} not implemented` }
      }
    } catch (error) {
      return { error: `External API call failed: ${error instanceof Error ? error.message : String(error)}` }
    }
  }

  private async classifyData(args: Record<string, any>): Promise<any> {
    const data = args.data
    const threshold = args.confidence_threshold || 0.7
    
    const dataStr = JSON.stringify(data).toLowerCase()
    const classifications = []
    
    // Business context classification
    if (dataStr.includes('heart') || dataStr.includes('blood') || dataStr.includes('health')) {
      classifications.push({ type: 'healthcare', confidence: 0.9 })
    }
    if (dataStr.includes('payment') || dataStr.includes('amount') || dataStr.includes('currency')) {
      classifications.push({ type: 'financial', confidence: 0.85 })
    }
    if (dataStr.includes('device') || dataStr.includes('sensor') || dataStr.includes('temperature')) {
      classifications.push({ type: 'iot', confidence: 0.8 })
    }
    
    return {
      classifications: classifications.filter(c => c.confidence >= threshold),
      timestamp: new Date().toISOString(),
      threshold_used: threshold
    }
  }

  private async assessRisk(args: Record<string, any>): Promise<any> {
    const payload = args.payload
    const checkTypes = args.check_types || ['security', 'quality']
    
    const risks = {
      security: { level: 'low', issues: [] as string[] },
      privacy: { level: 'low', issues: [] as string[] },
      quality: { level: 'high', issues: [] as string[] },
      spam: { level: 'low', issues: [] as string[] }
    }
    
    const payloadStr = JSON.stringify(payload).toLowerCase()
    
    // Security checks
    if (checkTypes.includes('security')) {
      if (payloadStr.includes('script') || payloadStr.includes('eval')) {
        risks.security.level = 'high'
        risks.security.issues.push('Potential script injection detected')
      }
    }
    
    // Privacy checks
    if (checkTypes.includes('privacy')) {
      if (payloadStr.includes('ssn') || payloadStr.includes('social')) {
        risks.privacy.level = 'high'
        risks.privacy.issues.push('Potential PII detected')
      }
    }
    
    return {
      risks,
      overall_risk: 'low',
      timestamp: new Date().toISOString(),
      checks_performed: checkTypes
    }
  }
}

// Singleton instance
export const functionRegistry = new FunctionRegistry() 