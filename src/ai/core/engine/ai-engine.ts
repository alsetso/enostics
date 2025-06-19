/**
 * Enostics AI Engine
 * 
 * Central orchestrator for all AI operations including:
 * - Data classification and analysis
 * - Model management and inference
 * - Pipeline coordination
 * - Memory and context management
 */

import { AIConfig, AICapability, ProcessingResult, ModelProvider } from '../types'
import { ClassificationAgent } from '../../agents/classification/classification-agent'
import { QualityFilter } from '../../filters/quality/quality-filter'
import { DataSummarizer } from '../../summarizers/data/data-summarizer'
import { ModelManager } from '../../models/model-manager'
import { MemoryManager } from '../memory/memory-manager'

export class AIEngine {
  private config: AIConfig
  private modelManager: ModelManager
  private memoryManager: MemoryManager
  private classificationAgent: ClassificationAgent
  private qualityFilter: QualityFilter
  private dataSummarizer: DataSummarizer
  private isInitialized = false

  constructor(config: AIConfig) {
    this.config = config
    this.modelManager = new ModelManager(config.models)
    this.memoryManager = new MemoryManager(config.memory)
    this.classificationAgent = new ClassificationAgent(config.agents?.classification)
    this.qualityFilter = new QualityFilter(config.filters?.quality)
    this.dataSummarizer = new DataSummarizer(config.summarizers?.data)
  }

  /**
   * Initialize the AI engine and all components
   */
  async initialize(): Promise<void> {
    try {
      console.log('🧠 Initializing Enostics AI Engine...')
      
      // Initialize model manager first
      await this.modelManager.initialize()
      
      // Initialize memory system
      await this.memoryManager.initialize()
      
      // Initialize agents and processors
      await Promise.all([
        this.classificationAgent.initialize(),
        this.qualityFilter.initialize(),
        this.dataSummarizer.initialize()
      ])
      
      this.isInitialized = true
      console.log('✅ AI Engine initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize AI Engine:', error)
      throw error
    }
  }

  /**
   * Process incoming data through the AI pipeline
   */
  async processData(data: any, context?: any): Promise<ProcessingResult> {
    if (!this.isInitialized) {
      throw new Error('AI Engine not initialized. Call initialize() first.')
    }

    const startTime = Date.now()
    const sessionId = this.generateSessionId()

    try {
      // Store context in memory
      await this.memoryManager.storeContext(sessionId, { data, context })

      // Run parallel AI processing
      const [classification, quality, summary] = await Promise.all([
        this.classificationAgent.classify(data, context),
        this.qualityFilter.assess(data),
        this.dataSummarizer.summarize(data, context)
      ])

      // Compile results
      const result: ProcessingResult = {
        sessionId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        classification,
        quality,
        summary,
        enrichedData: {
          businessContext: classification.businessContext,
          qualityScore: quality.score,
          keyInsights: summary.insights,
          confidence: Math.min(classification.confidence, quality.confidence),
          tags: [...classification.tags, ...quality.tags],
          metadata: {
            modelVersions: await this.getModelVersions(),
            processingPipeline: 'standard',
            capabilities: this.getActiveCapabilities()
          }
        }
      }

      // Store results in memory for future reference
      await this.memoryManager.storeResult(sessionId, result)

      return result
    } catch (error) {
      console.error('❌ AI processing error:', error)
      throw error
    }
  }

  /**
   * Get available AI capabilities
   */
  getCapabilities(): AICapability[] {
    return [
      {
        name: 'data_classification',
        description: 'Automatic business context and content classification',
        enabled: this.classificationAgent.isEnabled(),
        confidence: 0.95
      },
      {
        name: 'quality_assessment',
        description: 'Data quality scoring and validation',
        enabled: this.qualityFilter.isEnabled(),
        confidence: 0.90
      },
      {
        name: 'data_summarization',
        description: 'Intelligent data summarization and insights',
        enabled: this.dataSummarizer.isEnabled(),
        confidence: 0.88
      },
      {
        name: 'sender_analysis',
        description: 'Sender identification and trust scoring',
        enabled: true,
        confidence: 0.85
      }
    ]
  }

  /**
   * Update AI configuration at runtime
   */
  async updateConfig(newConfig: Partial<AIConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig }
    
    // Reinitialize components that need config updates
    if (newConfig.models) {
      await this.modelManager.updateConfig(newConfig.models)
    }
    
    console.log('🔄 AI Engine configuration updated')
  }

  /**
   * Get health status of all AI components
   */
  async getHealthStatus(): Promise<Record<string, any>> {
    return {
      engine: {
        initialized: this.isInitialized,
        uptime: this.getUptime(),
        status: 'healthy'
      },
      models: await this.modelManager.getHealthStatus(),
      memory: await this.memoryManager.getHealthStatus(),
      agents: {
        classification: this.classificationAgent.getStatus(),
        quality: this.qualityFilter.getStatus(),
        summarization: this.dataSummarizer.getStatus()
      }
    }
  }

  /**
   * Shutdown the AI engine gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down AI Engine...')
    
    await Promise.all([
      this.modelManager.shutdown(),
      this.memoryManager.shutdown(),
      this.classificationAgent.shutdown(),
      this.qualityFilter.shutdown(),
      this.dataSummarizer.shutdown()
    ])
    
    this.isInitialized = false
    console.log('✅ AI Engine shutdown complete')
  }

  // Private helper methods
  private generateSessionId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async getModelVersions(): Promise<Record<string, string>> {
    return this.modelManager.getModelVersions()
  }

  private getActiveCapabilities(): string[] {
    return this.getCapabilities()
      .filter(cap => cap.enabled)
      .map(cap => cap.name)
  }

  private getUptime(): number {
    // Implementation would track actual uptime
    return Date.now()
  }

  isReady(): boolean {
    return this.isInitialized
  }
}

// Singleton instance for global access
let aiEngineInstance: AIEngine | null = null

export function getAIEngine(config?: AIConfig): AIEngine {
  if (!aiEngineInstance && config) {
    aiEngineInstance = new AIEngine(config)
  }
  
  if (!aiEngineInstance) {
    throw new Error('AI Engine not initialized. Provide config on first call.')
  }
  
  return aiEngineInstance
}

export function isAIEngineInitialized(): boolean {
  return aiEngineInstance?.isReady() ?? false
} 