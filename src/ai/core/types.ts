/**
 * Core TypeScript types for the Enostics AI Framework
 */

// Core AI Configuration
export interface AIConfig {
  models: ModelConfig
  memory?: MemoryConfig
  agents?: AgentConfig
  filters?: FilterConfig
  summarizers?: SummarizerConfig
  inference?: InferenceConfig
  security?: SecurityConfig
}

// Model Management
export interface ModelConfig {
  local?: LocalModelConfig
  cloud?: CloudModelConfig
  embeddings?: EmbeddingConfig
  fallback?: FallbackConfig
}

export interface LocalModelConfig {
  enabled: boolean
  models: LocalModel[]
  cachePath?: string
  maxMemoryUsage?: number
}

export interface LocalModel {
  name: string
  path: string
  type: 'llm' | 'embedding' | 'classification'
  size: string
  capabilities: string[]
}

export interface CloudModelConfig {
  enabled: boolean
  providers: ModelProvider[]
  apiKeys: Record<string, string>
  rateLimits?: RateLimitConfig
}

export interface ModelProvider {
  name: 'openai' | 'anthropic' | 'google' | 'azure'
  models: string[]
  endpoint?: string
  enabled: boolean
}

export interface EmbeddingConfig {
  provider: 'local' | 'openai' | 'huggingface'
  model: string
  dimensions: number
  batchSize?: number
}

// Memory and Context Management
export interface MemoryConfig {
  enabled: boolean
  type: 'local' | 'redis' | 'supabase'
  maxSize?: number
  ttl?: number
  compression?: boolean
}

// Agent Configuration
export interface AgentConfig {
  classification?: ClassificationAgentConfig
  analysis?: AnalysisAgentConfig
  response?: ResponseAgentConfig
  monitoring?: MonitoringAgentConfig
}

export interface ClassificationAgentConfig {
  enabled: boolean
  model: string
  confidence_threshold: number
  categories: string[]
  custom_rules?: ClassificationRule[]
}

export interface ClassificationRule {
  pattern: string
  category: string
  confidence: number
}

export interface AnalysisAgentConfig {
  enabled: boolean
  model: string
  analysisTypes: string[]
}

export interface ResponseAgentConfig {
  enabled: boolean
  model: string
  templates: ResponseTemplate[]
}

export interface ResponseTemplate {
  name: string
  pattern: string
  response: string
}

export interface MonitoringAgentConfig {
  enabled: boolean
  metrics: string[]
  alertThresholds: Record<string, number>
}

// Filter Configuration
export interface FilterConfig {
  quality?: QualityFilterConfig
  spam?: SpamFilterConfig
  security?: SecurityFilterConfig
  content?: ContentFilterConfig
}

export interface QualityFilterConfig {
  enabled: boolean
  scoring_model: string
  min_score: number
  factors: QualityFactor[]
}

export interface QualityFactor {
  name: string
  weight: number
  enabled: boolean
}

export interface SpamFilterConfig {
  enabled: boolean
  model: string
  threshold: number
}

export interface SecurityFilterConfig {
  enabled: boolean
  threatDetection: boolean
  malwareScanning: boolean
}

export interface ContentFilterConfig {
  enabled: boolean
  categories: string[]
  strictMode: boolean
}

// Summarizer Configuration
export interface SummarizerConfig {
  data?: DataSummarizerConfig
  trends?: TrendSummarizerConfig
  insights?: InsightSummarizerConfig
}

export interface DataSummarizerConfig {
  enabled: boolean
  model: string
  max_length: number
  include_metadata: boolean
}

export interface TrendSummarizerConfig {
  enabled: boolean
  model: string
  timeWindow: string
  metrics: string[]
}

export interface InsightSummarizerConfig {
  enabled: boolean
  model: string
  categories: string[]
  depth: 'basic' | 'detailed' | 'comprehensive'
}

// Processing Results
export interface ProcessingResult {
  sessionId: string
  timestamp: string
  processingTime: number
  classification: ClassificationResult
  quality: QualityResult
  summary: SummaryResult
  enrichedData: EnrichedData
}

export interface ClassificationResult {
  businessContext: string
  confidence: number
  tags: string[]
  category: string
  subcategory?: string
  metadata?: Record<string, any>
}

export interface QualityResult {
  score: number
  confidence: number
  factors: QualityFactor[]
  tags: string[]
  issues?: QualityIssue[]
}

export interface QualityIssue {
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
  suggestion?: string
}

export interface SummaryResult {
  insights: string[]
  keyPoints: string[]
  confidence: number
  metadata?: Record<string, any>
}

export interface EnrichedData {
  businessContext: string
  qualityScore: number
  keyInsights: string[]
  confidence: number
  tags: string[]
  metadata: ProcessingMetadata
}

export interface ProcessingMetadata {
  modelVersions: Record<string, string>
  processingPipeline: string
  capabilities: string[]
  timestamp?: string
  sessionId?: string
}

// AI Capabilities
export interface AICapability {
  name: string
  description: string
  enabled: boolean
  confidence: number
  metadata?: Record<string, any>
}

// Inference Configuration
export interface InferenceConfig {
  local?: LocalInferenceConfig
  cloud?: CloudInferenceConfig
  streaming?: StreamingConfig
  batch?: BatchConfig
}

export interface LocalInferenceConfig {
  enabled: boolean
  maxConcurrency: number
  timeout: number
  memoryLimit: number
}

export interface CloudInferenceConfig {
  enabled: boolean
  providers: ModelProvider[]
  fallbackChain: string[]
  timeout: number
}

export interface StreamingConfig {
  enabled: boolean
  bufferSize: number
  timeout: number
}

export interface BatchConfig {
  enabled: boolean
  batchSize: number
  maxWaitTime: number
}

// Security Configuration
export interface SecurityConfig {
  encryption: EncryptionConfig
  audit: AuditConfig
  access: AccessConfig
}

export interface EncryptionConfig {
  enabled: boolean
  algorithm: string
  keyRotation: boolean
}

export interface AuditConfig {
  enabled: boolean
  logLevel: 'basic' | 'detailed' | 'verbose'
  retention: number
}

export interface AccessConfig {
  apiKeys: boolean
  rateLimiting: RateLimitConfig
  ipWhitelist?: string[]
}

export interface RateLimitConfig {
  enabled: boolean
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
}

// Fallback Configuration
export interface FallbackConfig {
  enabled: boolean
  chain: FallbackProvider[]
  timeout: number
}

export interface FallbackProvider {
  type: 'local' | 'cloud'
  provider: string
  priority: number
}

// Error Types
export interface AIError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
  sessionId?: string
}

// Health Status
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  components: Record<string, ComponentHealth>
  timestamp: string
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency?: number
  errors?: number
  metadata?: Record<string, any>
}

// Event Types
export interface AIEvent {
  type: string
  timestamp: string
  sessionId?: string
  data: Record<string, any>
}

// Webhook Integration
export interface WebhookConfig {
  enabled: boolean
  endpoints: WebhookEndpoint[]
  security: WebhookSecurity
}

export interface WebhookEndpoint {
  url: string
  events: string[]
  headers?: Record<string, string>
  timeout: number
}

export interface WebhookSecurity {
  signature: boolean
  secretKey?: string
  ipWhitelist?: string[]
}

// Training Configuration
export interface TrainingConfig {
  enabled: boolean
  datasets: DatasetConfig[]
  pipelines: TrainingPipeline[]
  evaluation: EvaluationConfig
}

export interface DatasetConfig {
  name: string
  path: string
  type: 'classification' | 'summarization' | 'embedding'
  format: 'json' | 'csv' | 'parquet'
}

export interface TrainingPipeline {
  name: string
  model: string
  dataset: string
  hyperparameters: Record<string, any>
}

export interface EvaluationConfig {
  metrics: string[]
  testSplit: number
  validationSplit: number
} 