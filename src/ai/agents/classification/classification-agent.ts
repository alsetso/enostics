/**
 * Classification Agent
 * 
 * Handles automatic data classification and business context detection
 */

import { ClassificationAgentConfig, ClassificationResult } from '../../core/types'
import { OllamaClient } from '../../models/local/ollama-client'

export class ClassificationAgent {
  private config?: ClassificationAgentConfig
  private enabled = true
  private ollamaClient: OllamaClient

  constructor(config?: ClassificationAgentConfig) {
    this.config = config
    this.ollamaClient = new OllamaClient()
  }

  async initialize(): Promise<void> {
    console.log('🏷️ Initializing Classification Agent...')
    console.log('✅ Classification Agent initialized')
  }

  async classify(data: any, context?: any): Promise<ClassificationResult> {
    try {
      // Use Ollama for real AI classification
      const result = await this.ollamaClient.classifyData(data, 'llama3.2:3b')
      
      return {
        businessContext: result.businessContext,
        confidence: result.confidence,
        tags: [result.businessContext, 'ai-classified', 'ollama'],
        category: 'data_input',
        subcategory: result.businessContext,
        metadata: {
          timestamp: new Date().toISOString(),
          agent: 'classification-agent',
          model: 'llama3.2:3b',
          reasoning: result.reasoning
        }
      }
    } catch (error) {
      console.error('AI classification error, using fallback:', error)
      
      // Fallback to rule-based classification
      const businessContexts = ['healthcare', 'iot', 'financial', 'general', 'communication']
      const dataStr = JSON.stringify(data).toLowerCase()
      
      let businessContext = 'general'
      if (dataStr.includes('heart') || dataStr.includes('blood') || dataStr.includes('health')) {
        businessContext = 'healthcare'
      } else if (dataStr.includes('device') || dataStr.includes('sensor') || dataStr.includes('temperature')) {
        businessContext = 'iot'
      } else if (dataStr.includes('payment') || dataStr.includes('amount') || dataStr.includes('currency')) {
        businessContext = 'financial'
      } else if (dataStr.includes('message') || dataStr.includes('email') || dataStr.includes('phone')) {
        businessContext = 'communication'
      }
      
      return {
        businessContext,
        confidence: 0.7,
        tags: [businessContext, 'rule-based', 'fallback'],
        category: 'data_input',
        subcategory: businessContext,
        metadata: {
          timestamp: new Date().toISOString(),
          agent: 'classification-agent',
          model: 'fallback-rules',
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  isEnabled(): boolean {
    return this.enabled && (this.config?.enabled ?? true)
  }

  getStatus(): any {
    return {
      enabled: this.isEnabled(),
      model: this.config?.model || 'default',
      categories: this.config?.categories || []
    }
  }

  async shutdown(): Promise<void> {
    console.log('🔄 Classification Agent shutdown')
  }
} 