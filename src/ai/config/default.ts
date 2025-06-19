/**
 * Default AI Configuration for Enostics
 * 
 * This configuration sets up the AI framework with sensible defaults
 * for development and production environments
 */

import { AIConfig } from '../core/types'

export const defaultAIConfig: AIConfig = {
  models: {
    local: {
      enabled: true, // Now we have models!
      models: [
        {
          name: 'llama3.2:3b',
          path: 'llama3.2:3b',
          type: 'llm',
          size: '2.0GB',
          capabilities: ['classification', 'analysis', 'summarization']
        },
        {
          name: 'qwen2.5:7b',
          path: 'qwen2.5:7b',
          type: 'llm',
          size: '4.7GB',
          capabilities: ['advanced-reasoning', 'complex-analysis', 'insights']
        },
        {
          name: 'nomic-embed-text',
          path: 'nomic-embed-text:latest',
          type: 'embedding',
          size: '274MB',
          capabilities: ['embeddings', 'semantic-search', 'similarity']
        }
      ],
      cachePath: './ai-models',
      maxMemoryUsage: 8192 // 8GB for multiple models
    },
    cloud: {
      enabled: true,
      providers: [
        {
          name: 'openai',
          models: ['gpt-3.5-turbo', 'gpt-4'],
          enabled: false, // Enable when API key is provided
        }
      ],
      apiKeys: {},
      rateLimits: {
        enabled: true,
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    },
    embeddings: {
      provider: 'local',
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      dimensions: 384,
      batchSize: 32
    }
  },
  memory: {
    enabled: true,
    type: 'local',
    maxSize: 1000,
    ttl: 3600, // 1 hour
    compression: false
  },
  agents: {
    classification: {
      enabled: true,
      model: 'local-classifier',
      confidence_threshold: 0.7,
      categories: [
        'healthcare',
        'iot',
        'financial',
        'communication',
        'general'
      ]
    }
  },
  filters: {
    quality: {
      enabled: true,
      scoring_model: 'quality-scorer',
      min_score: 50,
      factors: [
        { name: 'completeness', weight: 0.3, enabled: true },
        { name: 'accuracy', weight: 0.4, enabled: true },
        { name: 'consistency', weight: 0.3, enabled: true }
      ]
    },
    spam: {
      enabled: true,
      model: 'spam-detector',
      threshold: 0.8
    },
    security: {
      enabled: true,
      threatDetection: true,
      malwareScanning: false
    }
  },
  summarizers: {
    data: {
      enabled: true,
      model: 'data-summarizer',
      max_length: 500,
      include_metadata: true
    }
  },
  inference: {
    local: {
      enabled: false,
      maxConcurrency: 4,
      timeout: 30000,
      memoryLimit: 2048
    },
    cloud: {
      enabled: true,
      providers: [],
      fallbackChain: ['openai'],
      timeout: 10000
    }
  },
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: false
    },
    audit: {
      enabled: true,
      logLevel: 'detailed',
      retention: 30 // days
    },
    access: {
      apiKeys: true,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    }
  }
}

// Environment-specific overrides
export const developmentConfig: Partial<AIConfig> = {
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: false
    },
    audit: {
      enabled: true,
      logLevel: 'verbose',
      retention: 7
    },
    access: {
      apiKeys: true,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    }
  }
}

export const productionConfig: Partial<AIConfig> = {
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: true
    },
    audit: {
      enabled: true,
      logLevel: 'basic',
      retention: 90
    },
    access: {
      apiKeys: true,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    }
  }
}

export function getAIConfig(environment: 'development' | 'production' = 'development'): AIConfig {
  const envConfig = environment === 'production' ? productionConfig : developmentConfig
  return {
    ...defaultAIConfig,
    ...envConfig
  }
} 