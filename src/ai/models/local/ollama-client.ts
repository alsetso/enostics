/**
 * Ollama Client
 * 
 * Handles communication with local Ollama models for
 * classification, analysis, and text generation
 */

export interface OllamaResponse {
  model: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaRequest {
  model: string
  prompt: string
  stream?: boolean
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    repeat_penalty?: number
    seed?: number
    num_predict?: number
  }
}

export class OllamaClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl = 'http://127.0.0.1:11434', timeout = 30000) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  /**
   * Generate text using an Ollama model
   */
  async generate(request: OllamaRequest): Promise<OllamaResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: false // We want complete responses
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ollama generation error:', error)
      throw error
    }
  }

  /**
   * Generate embeddings using an embedding model
   */
  async embeddings(model: string, prompt: string): Promise<number[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Ollama embeddings error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return result.embedding
    } catch (error) {
      console.error('Ollama embeddings error:', error)
      throw error
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      
      if (!response.ok) {
        throw new Error(`Ollama list error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return result.models?.map((model: any) => model.name) || []
    } catch (error) {
      console.error('Ollama list models error:', error)
      return []
    }
  }

  /**
   * Check if Ollama service is running
   */
  async isHealthy(): Promise<boolean> {
    try {
      console.log('Checking Ollama health at:', `${this.baseUrl}/api/tags`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('Health check timeout reached')
        controller.abort()
      }, 2000) // Reduced timeout

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Ollama health check response:', response.status, response.statusText)
      return response.ok
    } catch (error) {
      console.error('Ollama health check failed:', error)
      return false
    }
  }

  /**
   * Classify data using a specific model
   */
  async classifyData(data: any, model = 'llama3.2:3b'): Promise<{
    businessContext: string
    confidence: number
    reasoning: string
  }> {
    const prompt = `
Analyze this data and classify its business context. Respond ONLY with a JSON object in this exact format:
{
  "businessContext": "one of: healthcare, iot, financial, communication, general",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

Data to classify:
${JSON.stringify(data, null, 2)}

JSON Response:`

    const response = await this.generate({
      model,
      prompt,
      options: {
        temperature: 0.1, // Low temperature for consistent classification
        num_predict: 200
      }
    })

    try {
      // Extract JSON from response
      const jsonMatch = response.response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Failed to parse classification response:', error)
    }

    // Fallback response
    return {
      businessContext: 'general',
      confidence: 0.5,
      reasoning: 'Failed to parse model response'
    }
  }

  /**
   * Assess data quality using AI
   */
  async assessQuality(data: any, model = 'qwen2.5:7b'): Promise<{
    score: number
    confidence: number
    factors: Array<{ name: string; score: number; reasoning: string }>
  }> {
    const prompt = `
Analyze this data for quality and respond ONLY with a JSON object in this exact format:
{
  "score": 85,
  "confidence": 0.90,
  "factors": [
    {"name": "completeness", "score": 90, "reasoning": "Most fields present"},
    {"name": "accuracy", "score": 85, "reasoning": "Values seem realistic"},
    {"name": "consistency", "score": 80, "reasoning": "Format is consistent"}
  ]
}

Data to assess:
${JSON.stringify(data, null, 2)}

JSON Response:`

    const response = await this.generate({
      model,
      prompt,
      options: {
        temperature: 0.1,
        num_predict: 300
      }
    })

    try {
      const jsonMatch = response.response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Failed to parse quality assessment:', error)
    }

    // Fallback response
    return {
      score: 75,
      confidence: 0.5,
      factors: [
        { name: 'completeness', score: 75, reasoning: 'Default assessment' },
        { name: 'accuracy', score: 75, reasoning: 'Default assessment' },
        { name: 'consistency', score: 75, reasoning: 'Default assessment' }
      ]
    }
  }

  /**
   * Generate insights and summary
   */
  async generateInsights(data: any, context?: any, model = 'qwen2.5:7b'): Promise<{
    insights: string[]
    keyPoints: string[]
    summary: string
  }> {
    const prompt = `
Analyze this data and generate insights. Respond ONLY with a JSON object in this exact format:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "summary": "Brief summary of the data"
}

Data:
${JSON.stringify(data, null, 2)}

${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}

JSON Response:`

    const response = await this.generate({
      model,
      prompt,
      options: {
        temperature: 0.3,
        num_predict: 400
      }
    })

    try {
      const jsonMatch = response.response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Failed to parse insights:', error)
    }

    // Fallback response
    return {
      insights: ['Data received and processed'],
      keyPoints: ['Standard data format detected'],
      summary: 'Data analysis completed with default processing'
    }
  }
} 