/**
 * Enostics AI Framework - Main Entry Point
 * 
 * This is the primary interface for integrating AI capabilities
 * into the Enostics universal endpoint platform
 */

// Core Engine
export { AIEngine, getAIEngine, isAIEngineInitialized } from './core/engine/ai-engine'

// Configuration
export { getAIConfig, defaultAIConfig, developmentConfig, productionConfig } from './config/default'

// Import for internal use
import { getAIConfig } from './config/default'
import { getAIEngine } from './core/engine/ai-engine'
import type { AICapability } from './core/types'

// Types
export type {
  AIConfig,
  AICapability,
  ProcessingResult,
  ClassificationResult,
  QualityResult,
  SummaryResult,
  EnrichedData,
  ModelProvider,
  ComponentHealth
} from './core/types'

// Model Management
export { ModelManager } from './models/model-manager'

// Memory Management
export { MemoryManager } from './core/memory/memory-manager'

// Agents
export { ClassificationAgent } from './agents/classification/classification-agent'

// Filters
export { QualityFilter } from './filters/quality/quality-filter'

// Summarizers
export { DataSummarizer } from './summarizers/data/data-summarizer'

/**
 * Initialize the AI framework with default configuration
 */
export async function initializeAI(environment: 'development' | 'production' = 'development') {
  const config = getAIConfig(environment)
  const aiEngine = getAIEngine(config)
  
  await aiEngine.initialize()
  
  console.log('🚀 Enostics AI Framework initialized successfully!')
  console.log(`📊 Capabilities: ${aiEngine.getCapabilities().map((c: AICapability) => c.name).join(', ')}`)
  
  return aiEngine
}

/**
 * Quick AI processing function for universal endpoints
 */
export async function processEndpointData(data: any, context?: any) {
  const aiEngine = getAIEngine()
  
  if (!aiEngine.isReady()) {
    throw new Error('AI Engine not initialized. Call initializeAI() first.')
  }
  
  return await aiEngine.processData(data, context)
}

/**
 * Get AI health status for monitoring
 */
export async function getAIHealthStatus() {
  const aiEngine = getAIEngine()
  return await aiEngine.getHealthStatus()
}

/**
 * AI Framework constants
 */
export const AI_FRAMEWORK_VERSION = '1.0.0'
export const SUPPORTED_MODELS = [
  'gpt-3.5-turbo',
  'gpt-4',
  'claude-3-sonnet',
  'llama-2-7b',
  'sentence-transformers'
]
export const SUPPORTED_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'azure',
  'local'
] 