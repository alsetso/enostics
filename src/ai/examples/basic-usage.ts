/**
 * Basic Usage Example - Enostics AI Framework
 * 
 * This example shows how to integrate AI capabilities
 * into your universal endpoint processing
 */

import { initializeAI, processEndpointData, getAIHealthStatus } from '../index'

export async function exampleAIUsage() {
  try {
    // 1. Initialize the AI framework
    // Initialize AI framework
    const aiEngine = await initializeAI('development')
    
    // 2. Example data from a universal endpoint
    const incomingData = {
      timestamp: new Date().toISOString(),
      source: 'health-device',
      data: {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 98.6,
        deviceId: 'FitBit-ABC123'
      },
      metadata: {
        userId: 'user_123',
        endpoint: '/v1/johndoe'
      }
    }
    
    // 3. Process the data through AI pipeline
    const result = await processEndpointData(incomingData, {
      userPreferences: { healthTracking: true },
      endpointHistory: { lastActivity: '2024-01-15' }
    })
    
    // 4. Check AI system health
    const healthStatus = await getAIHealthStatus()
    
    return result
    
  } catch (error) {
    console.error('❌ AI Framework Error:', error)
    throw error
  }
}

// Example of how to use in your endpoint processing
export async function enhanceEndpointWithAI(endpointData: any, userContext?: any) {
  // This would be called from your existing endpoint handlers
  const aiResult = await processEndpointData(endpointData, userContext)
  
  return {
    // Original data
    ...endpointData,
    
    // AI enhancements
    ai: {
      businessContext: aiResult.classification.businessContext,
      qualityScore: aiResult.quality.score,
      insights: aiResult.summary.insights,
      confidence: aiResult.enrichedData.confidence,
      tags: aiResult.enrichedData.tags,
      processingTime: aiResult.processingTime
    },
    
    // Enhanced metadata
    metadata: {
      ...endpointData.metadata,
      aiProcessed: true,
      aiVersion: aiResult.enrichedData.metadata.modelVersions,
      timestamp: aiResult.timestamp
    }
  }
}

// Example of filtering based on AI results
export function shouldTriggerWebhook(aiResult: any): boolean {
  // High confidence and good quality = trigger webhook
  return aiResult.enrichedData.confidence > 0.8 && aiResult.quality.score > 75
}

// Example of routing based on business context
export function getRoutingDestination(businessContext: string): string {
  const routes: Record<string, string> = {
    'healthcare': '/webhooks/health-providers',
    'iot': '/webhooks/device-management',
    'financial': '/webhooks/finance-apps',
    'communication': '/webhooks/messaging',
    'general': '/webhooks/default'
  }
  
  return routes[businessContext] || routes.general
} 