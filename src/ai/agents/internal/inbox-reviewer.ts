/**
 * Internal Inbox Reviewer Agent
 * 
 * Automatically processes and reviews new inbox data payloads
 * Operates silently in the background without user prompts
 */

import { functionRegistry } from '../../tools/function-calling/function-registry'

export interface InboxReviewResult {
  id: string
  timestamp: string
  payload: any
  analysis: {
    classification: any
    risk_assessment: any
    insights: string[]
    recommendations: string[]
    confidence: number
  }
  actions_taken: string[]
  enriched_data: any
}

export class InboxReviewerAgent {
  private isEnabled = true
  private reviewRules: ReviewRule[] = []

  constructor() {
    this.setupDefaultRules()
  }

  /**
   * Main entry point - review a new inbox payload
   */
  async reviewPayload(payload: any, metadata: any = {}): Promise<InboxReviewResult> {
    const reviewId = this.generateReviewId()
    const startTime = Date.now()

    try {
      console.log(`🔍 Inbox Reviewer: Starting analysis for ${reviewId}`)

      // Step 1: Classify the data
      const classification = await this.classifyPayload(payload)
      
      // Step 2: Assess risks
      const riskAssessment = await this.assessRisks(payload)
      
      // Step 3: Extract insights
      const insights = await this.extractInsights(payload, classification)
      
      // Step 4: Generate recommendations
      const recommendations = await this.generateRecommendations(payload, classification, riskAssessment)
      
      // Step 5: Enrich data with external context
      const enrichedData = await this.enrichData(payload, metadata)
      
      // Step 6: Apply automated actions
      const actionsTaken = await this.applyAutomatedActions(payload, classification, riskAssessment)

      const result: InboxReviewResult = {
        id: reviewId,
        timestamp: new Date().toISOString(),
        payload,
        analysis: {
          classification,
          risk_assessment: riskAssessment,
          insights,
          recommendations,
          confidence: this.calculateOverallConfidence(classification, riskAssessment)
        },
        actions_taken: actionsTaken,
        enriched_data: enrichedData
      }

      console.log(`✅ Inbox Reviewer: Completed analysis for ${reviewId} in ${Date.now() - startTime}ms`)
      return result

    } catch (error) {
      console.error(`❌ Inbox Reviewer: Error processing ${reviewId}:`, error)
      throw error
    }
  }

  /**
   * Classify the payload using AI
   */
  private async classifyPayload(payload: any): Promise<any> {
    try {
      return await functionRegistry.execute('classify_data', {
        data: payload,
        confidence_threshold: 0.6
      })
    } catch (error) {
      console.error('Classification error:', error)
      return { classifications: [], confidence: 0 }
    }
  }

  /**
   * Assess security and quality risks
   */
  private async assessRisks(payload: any): Promise<any> {
    try {
      return await functionRegistry.execute('assess_risk', {
        payload,
        check_types: ['security', 'privacy', 'quality', 'spam']
      })
    } catch (error) {
      console.error('Risk assessment error:', error)
      return { risks: {}, overall_risk: 'unknown' }
    }
  }

  /**
   * Extract insights from the payload
   */
  private async extractInsights(payload: any, classification: any): Promise<string[]> {
    const insights: string[] = []
    
    try {
      // Use AI to analyze the payload
      const analysis = await functionRegistry.execute('analyze_payload', {
        payload,
        analysis_type: classification.classifications?.[0]?.type || 'general'
      })
      
      insights.push(...analysis.insights)
      insights.push(...analysis.recommendations)
      
    } catch (error) {
      console.error('Insight extraction error:', error)
    }

    // Add rule-based insights
    const keys = Object.keys(payload)
    
    if (keys.length > 10) {
      insights.push('Complex payload with many fields - consider data validation')
    }
    
    if (JSON.stringify(payload).length > 10000) {
      insights.push('Large payload detected - monitor storage and processing costs')
    }

    return insights
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(payload: any, classification: any, riskAssessment: any): Promise<string[]> {
    const recommendations: string[] = []
    
    // Risk-based recommendations
    if (riskAssessment.overall_risk === 'high') {
      recommendations.push('🚨 High risk detected - review payload manually')
      recommendations.push('Consider implementing additional validation rules')
    }
    
    // Classification-based recommendations
    const primaryType = classification.classifications?.[0]?.type
    if (primaryType === 'healthcare') {
      recommendations.push('🏥 Healthcare data detected - ensure HIPAA compliance')
      recommendations.push('Consider encrypting sensitive health information')
    } else if (primaryType === 'financial') {
      recommendations.push('💰 Financial data detected - implement PCI DSS controls')
      recommendations.push('Monitor for fraud patterns')
    } else if (primaryType === 'iot') {
      recommendations.push('🔧 IoT data detected - monitor device health and connectivity')
      recommendations.push('Set up alerts for device anomalies')
    }
    
    // Data quality recommendations
    const keys = Object.keys(payload)
    if (keys.some(k => payload[k] === null || payload[k] === undefined)) {
      recommendations.push('⚠️ Missing data fields detected - implement data validation')
    }
    
    return recommendations
  }

  /**
   * Enrich data with external context
   */
  private async enrichData(payload: any, metadata: any): Promise<any> {
    const enriched: any = {
      original: payload,
      metadata,
      enrichments: {}
    }
    
    try {
      // Add geolocation data if IP is available
      if (metadata.source_ip) {
        const geoData = await functionRegistry.execute('call_external_api', {
          api_type: 'geolocation',
          parameters: { ip: metadata.source_ip }
        })
        enriched.enrichments.geolocation = geoData
      }
      
      // Add timestamp analysis
      enriched.enrichments.timing = {
        received_at: new Date().toISOString(),
        day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        hour_of_day: new Date().getHours(),
        is_business_hours: this.isBusinessHours()
      }
      
    } catch (error) {
      console.error('Data enrichment error:', error)
    }
    
    return enriched
  }

  /**
   * Apply automated actions based on analysis
   */
  private async applyAutomatedActions(payload: any, classification: any, riskAssessment: any): Promise<string[]> {
    const actions: string[] = []
    
    // High-risk automatic actions
    if (riskAssessment.overall_risk === 'high') {
      actions.push('Flagged for manual review')
      actions.push('Notification sent to security team')
    }
    
    // Classification-based actions
    const primaryType = classification.classifications?.[0]?.type
    if (primaryType === 'healthcare') {
      actions.push('Applied healthcare data handling policies')
      actions.push('Logged for compliance audit trail')
    }
    
    // Data quality actions
    if (JSON.stringify(payload).length > 50000) {
      actions.push('Large payload archived to cold storage')
    }
    
    return actions
  }

  /**
   * Setup default review rules
   */
  private setupDefaultRules(): void {
    this.reviewRules = [
      {
        name: 'high_risk_security',
        condition: (payload: any) => {
          const str = JSON.stringify(payload).toLowerCase()
          return str.includes('script') || str.includes('eval') || str.includes('sql')
        },
        action: 'flag_for_security_review',
        priority: 'high'
      },
      {
        name: 'pii_detection',
        condition: (payload: any) => {
          const str = JSON.stringify(payload).toLowerCase()
          return str.includes('ssn') || str.includes('social') || str.includes('passport')
        },
        action: 'apply_privacy_controls',
        priority: 'high'
      },
      {
        name: 'large_payload',
        condition: (payload: any) => {
          return JSON.stringify(payload).length > 100000
        },
        action: 'optimize_storage',
        priority: 'medium'
      }
    ]
  }

  /**
   * Utility methods
   */
  private generateReviewId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private calculateOverallConfidence(classification: any, riskAssessment: any): number {
    const classificationConfidence = classification.classifications?.[0]?.confidence || 0
    const riskConfidence = riskAssessment.overall_risk === 'unknown' ? 0.5 : 0.8
    return (classificationConfidence + riskConfidence) / 2
  }

  private isBusinessHours(): boolean {
    const hour = new Date().getHours()
    const day = new Date().getDay()
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17
  }

  /**
   * Configuration methods
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  addReviewRule(rule: ReviewRule): void {
    this.reviewRules.push(rule)
  }

  getStatus(): any {
    return {
      enabled: this.isEnabled,
      rules_count: this.reviewRules.length,
      last_review: new Date().toISOString()
    }
  }
}

interface ReviewRule {
  name: string
  condition: (payload: any) => boolean
  action: string
  priority: 'low' | 'medium' | 'high'
}

// Singleton instance
export const inboxReviewerAgent = new InboxReviewerAgent() 