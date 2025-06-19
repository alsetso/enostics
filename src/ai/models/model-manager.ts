/**
 * Model Manager
 * 
 * Handles loading, management, and orchestration of AI models
 * including local models (Ollama, HuggingFace) and cloud APIs
 */

import { ModelConfig, LocalModel, ModelProvider, ComponentHealth } from '../core/types'
import { OllamaClient } from './local/ollama-client'

export class ModelManager {
  private config: ModelConfig
  private loadedModels: Map<string, any> = new Map()
  private modelHealth: Map<string, ComponentHealth> = new Map()
  private ollamaClient: OllamaClient
  private isInitialized = false

  constructor(config: ModelConfig) {
    this.config = config
    this.ollamaClient = new OllamaClient()
  }

  async initialize(): Promise<void> {
    console.log('🤖 Initializing Model Manager...')
    
    try {
      // Initialize local models if enabled
      if (this.config.local?.enabled) {
        await this.initializeLocalModels()
      }

      // Initialize cloud providers if enabled
      if (this.config.cloud?.enabled) {
        await this.initializeCloudProviders()
      }

      // Initialize embeddings
      if (this.config.embeddings) {
        await this.initializeEmbeddings()
      }

      this.isInitialized = true
      console.log('✅ Model Manager initialized')
    } catch (error) {
      console.error('❌ Model Manager initialization failed:', error)
      throw error
    }
  }

  private async initializeLocalModels(): Promise<void> {
    if (!this.config.local?.models) return

    // Check if Ollama is running
    const isOllamaHealthy = await this.ollamaClient.isHealthy()
    if (!isOllamaHealthy) {
      console.warn('⚠️ Ollama service not running. Local models will be unavailable.')
      return
    }

    // Get available models from Ollama
    const availableModels = await this.ollamaClient.listModels()
    console.log(`🔍 Available Ollama models: ${availableModels.join(', ')}`)

    for (const model of this.config.local.models) {
      try {
        console.log(`📥 Initializing local model: ${model.name}`)
        
        // Check if model is available in Ollama
        const isAvailable = availableModels.some(available => 
          available.includes(model.path) || available === model.name
        )

        if (!isAvailable) {
          console.warn(`⚠️ Model ${model.name} not found in Ollama. Skipping.`)
          this.modelHealth.set(model.name, {
            status: 'unhealthy',
            errors: 1,
            metadata: { error: 'Model not found in Ollama' }
          })
          continue
        }

        // Test the model with a simple prompt
        try {
          const testResponse = await this.ollamaClient.generate({
            model: model.path,
            prompt: 'Hello',
            options: { num_predict: 1 }
          })

          const loadedModel = {
            name: model.name,
            path: model.path,
            type: model.type,
            capabilities: model.capabilities,
            loaded: true,
            loadTime: Date.now(),
            client: this.ollamaClient,
            version: testResponse.model || 'unknown'
          }

          this.loadedModels.set(model.name, loadedModel)
          this.modelHealth.set(model.name, {
            status: 'healthy',
            latency: 100,
            errors: 0,
            metadata: { 
              size: model.size,
              type: model.type,
              capabilities: model.capabilities.join(', ')
            }
          })

          console.log(`✅ Local model ready: ${model.name}`)
        } catch (testError) {
          console.error(`❌ Model test failed for ${model.name}:`, testError)
          this.modelHealth.set(model.name, {
            status: 'degraded',
            errors: 1,
            metadata: { error: 'Model test failed' }
          })
        }
      } catch (error) {
        console.error(`❌ Failed to initialize model ${model.name}:`, error)
        this.modelHealth.set(model.name, {
          status: 'unhealthy',
          errors: 1,
          metadata: { error: error instanceof Error ? error.message : String(error) }
        })
      }
    }
  }

  private async initializeCloudProviders(): Promise<void> {
    if (!this.config.cloud?.providers) return

    for (const provider of this.config.cloud.providers) {
      if (!provider.enabled) continue

      try {
        console.log(`☁️ Initializing cloud provider: ${provider.name}`)
        
        // Stub implementation - would test API connectivity
        this.modelHealth.set(provider.name, {
          status: 'healthy',
          latency: 200,
          errors: 0
        })

        console.log(`✅ Cloud provider ready: ${provider.name}`)
      } catch (error) {
        console.error(`❌ Failed to initialize provider ${provider.name}:`, error)
        this.modelHealth.set(provider.name, {
          status: 'unhealthy',
          errors: 1,
          metadata: { error: error instanceof Error ? error.message : String(error) }
        })
      }
    }
  }

  private async initializeEmbeddings(): Promise<void> {
    const embeddingConfig = this.config.embeddings
    if (!embeddingConfig) return

    console.log(`🔗 Initializing embeddings: ${embeddingConfig.provider}/${embeddingConfig.model}`)
    
    // Stub implementation
    this.modelHealth.set('embeddings', {
      status: 'healthy',
      latency: 100,
      errors: 0
    })
  }

  async getModel(name: string): Promise<any> {
    const model = this.loadedModels.get(name)
    if (!model) {
      throw new Error(`Model not found: ${name}`)
    }
    return model
  }

  async invokeModel(modelName: string, input: any, options?: any): Promise<any> {
    const model = await this.getModel(modelName)
    
    // Stub implementation - would call actual model
    return {
      response: `Mock response from ${modelName}`,
      model: modelName,
      timestamp: new Date().toISOString(),
      metadata: options
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.config.embeddings) {
      throw new Error('Embeddings not configured')
    }

    // Stub implementation - would generate actual embeddings
    return Array.from({ length: this.config.embeddings.dimensions }, () => Math.random())
  }

  getLoadedModels(): string[] {
    return Array.from(this.loadedModels.keys())
  }

  async getModelVersions(): Promise<Record<string, string>> {
    const versions: Record<string, string> = {}
    
    this.loadedModels.forEach((model, name) => {
      versions[name] = model.version || '1.0.0'
    })

    return versions
  }

  async getHealthStatus(): Promise<Record<string, ComponentHealth>> {
    const health: Record<string, ComponentHealth> = {}
    
    this.modelHealth.forEach((status, name) => {
      health[name] = status
    })

    return health
  }

  async updateConfig(newConfig: ModelConfig): Promise<void> {
    this.config = { ...this.config, ...newConfig }
    console.log('🔄 Model Manager configuration updated')
  }

  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Model Manager...')
    
    // Unload all models
    this.loadedModels.clear()
    this.modelHealth.clear()
    this.isInitialized = false
    
    console.log('✅ Model Manager shutdown complete')
  }

  isReady(): boolean {
    return this.isInitialized
  }
} 