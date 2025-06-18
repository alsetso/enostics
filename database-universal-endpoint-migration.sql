-- UNIVERSAL ENDPOINT MIGRATION SCHEMA
-- This extends the existing public inbox system with full universal endpoint capabilities
-- Run this AFTER database-inbox-setup.sql

-- ============================================================================
-- PHASE 1: ENHANCED UNIVERSAL ENDPOINT SYSTEM
-- ============================================================================

-- Enhanced universal endpoint configuration (extends public inbox config)
ALTER TABLE enostics_public_inbox_config 
ADD COLUMN IF NOT EXISTS endpoint_name TEXT DEFAULT 'Universal Inbox',
ADD COLUMN IF NOT EXISTS endpoint_description TEXT DEFAULT 'Your universal personal API endpoint',
ADD COLUMN IF NOT EXISTS classification_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS auto_tagging_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS smart_routing_enabled BOOLEAN DEFAULT TRUE;

-- Enhanced data classification fields
ALTER TABLE enostics_public_inbox
ADD COLUMN IF NOT EXISTS classification_confidence DECIMAL(3,2) DEFAULT 0.50,
ADD COLUMN IF NOT EXISTS inferred_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS inferred_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS auto_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS content_summary TEXT,
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}';

-- User-level API keys (simplified from endpoint-specific)
CREATE TABLE IF NOT EXISTS enostics_universal_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Key details
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Permissions & scope
  is_active BOOLEAN DEFAULT TRUE,
  can_read BOOLEAN DEFAULT TRUE,
  can_write BOOLEAN DEFAULT TRUE,
  allowed_types TEXT[] DEFAULT '{}', -- restrict to specific data types
  allowed_sources TEXT[] DEFAULT '{}', -- restrict to specific sources
  
  -- Usage tracking
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  
  -- Lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
  
  -- Constraints
  CONSTRAINT valid_permissions CHECK (can_read = TRUE OR can_write = TRUE)
);

-- Universal request logs with enhanced classification
CREATE TABLE IF NOT EXISTS enostics_universal_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES enostics_universal_api_keys(id) ON DELETE SET NULL,
  
  -- Request details
  method VARCHAR(10) NOT NULL DEFAULT 'POST',
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  
  -- Enhanced classification
  data_type VARCHAR(100),
  data_source VARCHAR(255),
  data_tags TEXT[],
  classification_confidence DECIMAL(3,2),
  
  -- Request metadata
  source_ip INET,
  user_agent TEXT,
  content_length INTEGER,
  content_type VARCHAR(100),
  
  -- Response details
  response_size INTEGER,
  error_message TEXT,
  
  -- Processing
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_status INTEGER,
  webhook_response_time_ms INTEGER,
  
  -- Intelligence
  abuse_score INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 50, -- 0-100 data quality
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_method CHECK (method IN ('POST', 'PUT', 'PATCH', 'GET')),
  CONSTRAINT valid_status CHECK (status_code >= 100 AND status_code < 600),
  CONSTRAINT valid_scores CHECK (
    abuse_score >= 0 AND abuse_score <= 100 AND
    quality_score >= 0 AND quality_score <= 100
  )
);

-- Data type registry for classification
CREATE TABLE IF NOT EXISTS enostics_data_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type definition
  type_name VARCHAR(100) NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50), -- health, iot, finance, social, etc.
  
  -- Classification patterns
  detection_patterns JSONB, -- JSON patterns for auto-detection
  required_fields TEXT[], -- fields that must be present
  optional_fields TEXT[], -- fields that may be present
  
  -- Visualization
  icon VARCHAR(50) DEFAULT 'file-text',
  color VARCHAR(7) DEFAULT '#6B7280', -- hex color
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Source registry for classification  
CREATE TABLE IF NOT EXISTS enostics_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source definition
  source_name VARCHAR(255) NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50), -- app, device, webhook, api, etc.
  
  -- Detection patterns
  detection_patterns JSONB, -- JSON patterns for auto-detection
  user_agent_patterns TEXT[], -- user agent patterns
  domain_patterns TEXT[], -- domain patterns for webhooks
  
  -- Visualization
  icon VARCHAR(50) DEFAULT 'globe',
  color VARCHAR(7) DEFAULT '#6B7280',
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Universal API keys indexes
CREATE INDEX IF NOT EXISTS idx_universal_api_keys_user_id ON enostics_universal_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_universal_api_keys_hash ON enostics_universal_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_universal_api_keys_active ON enostics_universal_api_keys(user_id, is_active) WHERE is_active = TRUE;

-- Enhanced public inbox indexes
CREATE INDEX IF NOT EXISTS idx_public_inbox_user_type_created ON enostics_public_inbox(user_id, payload_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_inbox_user_source_created ON enostics_public_inbox(user_id, payload_source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_inbox_auto_tags_gin ON enostics_public_inbox USING GIN(auto_tags);
CREATE INDEX IF NOT EXISTS idx_public_inbox_confidence ON enostics_public_inbox(classification_confidence DESC);

-- Universal request logs indexes
CREATE INDEX IF NOT EXISTS idx_universal_logs_user_created ON enostics_universal_request_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_universal_logs_user_type ON enostics_universal_request_logs(user_id, data_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_universal_logs_user_source ON enostics_universal_request_logs(user_id, data_source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_universal_logs_tags_gin ON enostics_universal_request_logs USING GIN(data_tags);
CREATE INDEX IF NOT EXISTS idx_universal_logs_status ON enostics_universal_request_logs(status_code, created_at DESC);

-- Data types and sources indexes
CREATE INDEX IF NOT EXISTS idx_data_types_active ON enostics_data_types(is_active, type_name) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_data_sources_active ON enostics_data_sources(is_active, source_name) WHERE is_active = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Universal API keys RLS
ALTER TABLE enostics_universal_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own universal API keys" ON enostics_universal_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own universal API keys" ON enostics_universal_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own universal API keys" ON enostics_universal_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own universal API keys" ON enostics_universal_api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Universal request logs RLS
ALTER TABLE enostics_universal_request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own universal request logs" ON enostics_universal_request_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert universal request logs" ON enostics_universal_request_logs
  FOR INSERT WITH CHECK (true);

-- Data types and sources (public read)
ALTER TABLE enostics_data_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE enostics_data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active data types" ON enostics_data_types
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view active data sources" ON enostics_data_sources
  FOR SELECT USING (is_active = TRUE);

-- Insert common data types
INSERT INTO enostics_data_types (type_name, display_name, description, category, icon, color) VALUES
('sensor_data', 'Sensor Data', 'IoT sensor readings and measurements', 'iot', 'thermometer', '#10B981'),
('health_data', 'Health Data', 'Health metrics and medical information', 'health', 'heart', '#EF4444'),
('financial_data', 'Financial Data', 'Financial transactions and banking', 'finance', 'dollar-sign', '#F59E0B'),
('location_data', 'Location Data', 'GPS coordinates and location info', 'location', 'map-pin', '#3B82F6'),
('message', 'Message', 'Text messages and communications', 'communication', 'message-circle', '#8B5CF6'),
('event', 'Event', 'System events and notifications', 'system', 'bell', '#F97316'),
('task', 'Task', 'Tasks, reminders, and todos', 'productivity', 'check-square', '#06B6D4'),
('note', 'Note', 'Notes and text content', 'content', 'file-text', '#6B7280'),
('media', 'Media', 'Images, videos, and media files', 'media', 'image', '#EC4899'),
('unknown', 'Unknown', 'Unclassified data', 'other', 'help-circle', '#9CA3AF')
ON CONFLICT (type_name) DO NOTHING;

-- Insert common data sources
INSERT INTO enostics_data_sources (source_name, display_name, description, category, icon, color) VALUES
('iot_device', 'IoT Device', 'Internet of Things sensors and devices', 'device', 'cpu', '#10B981'),
('mobile_app', 'Mobile App', 'Smartphone and tablet applications', 'app', 'smartphone', '#3B82F6'),
('web_app', 'Web App', 'Web-based applications', 'app', 'globe', '#8B5CF6'),
('webhook', 'Webhook', 'HTTP webhook integrations', 'integration', 'link', '#F59E0B'),
('api_client', 'API Client', 'Direct API integrations', 'integration', 'code', '#06B6D4'),
('gpt_agent', 'GPT Agent', 'AI agent interactions', 'ai', 'brain', '#EC4899'),
('manual_entry', 'Manual Entry', 'User-entered data', 'user', 'user', '#6B7280'),
('unknown', 'Unknown', 'Unknown data source', 'other', 'help-circle', '#9CA3AF')
ON CONFLICT (source_name) DO NOTHING;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_enostics_data_types_updated_at
  BEFORE UPDATE ON enostics_data_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enostics_data_sources_updated_at
  BEFORE UPDATE ON enostics_data_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION HELPER FUNCTIONS
-- ============================================================================

-- Function to migrate endpoint-specific API keys to universal keys
CREATE OR REPLACE FUNCTION migrate_endpoint_keys_to_universal()
RETURNS TABLE(migrated_count INTEGER, error_count INTEGER) AS $$
DECLARE
  migrated INTEGER := 0;
  errors INTEGER := 0;
  key_record RECORD;
BEGIN
  -- Loop through existing endpoint-specific keys
  FOR key_record IN 
    SELECT DISTINCT user_id, name, key_hash, key_prefix, is_active, created_at, expires_at, last_used_at
    FROM enostics_api_keys 
    WHERE user_id IS NOT NULL
  LOOP
    BEGIN
      -- Insert as universal key (removing endpoint_id reference)
      INSERT INTO enostics_universal_api_keys (
        user_id, name, key_hash, key_prefix, is_active, 
        created_at, expires_at, last_used_at
      ) VALUES (
        key_record.user_id, 
        key_record.name || ' (Migrated)',
        key_record.key_hash,
        key_record.key_prefix,
        key_record.is_active,
        key_record.created_at,
        key_record.expires_at,
        key_record.last_used_at
      ) ON CONFLICT (key_hash) DO NOTHING;
      
      migrated := migrated + 1;
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
    END;
  END LOOP;
  
  RETURN QUERY SELECT migrated, errors;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- View for user dashboard analytics
CREATE OR REPLACE VIEW user_universal_analytics AS
SELECT 
  u.id as user_id,
  up.full_name as username,
  
  -- Request volume
  COUNT(pib.id) as total_requests,
  COUNT(CASE WHEN pib.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as requests_24h,
  COUNT(CASE WHEN pib.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as requests_7d,
  
  -- Data type breakdown
  COUNT(DISTINCT pib.payload_type) as unique_types,
  COUNT(DISTINCT pib.payload_source) as unique_sources,
  
  -- Quality metrics
  AVG(pib.classification_confidence) as avg_confidence,
  COUNT(CASE WHEN pib.is_suspicious = TRUE THEN 1 END) as suspicious_requests,
  AVG(pib.abuse_score) as avg_abuse_score,
  
  -- Recent activity
  MAX(pib.created_at) as last_request_at
  
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN enostics_public_inbox pib ON u.id = pib.user_id
GROUP BY u.id, up.full_name;

-- View for data type analytics
CREATE OR REPLACE VIEW data_type_analytics AS
SELECT 
  pib.payload_type,
  dt.display_name,
  dt.category,
  dt.icon,
  dt.color,
  
  COUNT(*) as total_count,
  COUNT(CASE WHEN pib.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as count_24h,
  COUNT(CASE WHEN pib.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as count_7d,
  
  AVG(pib.classification_confidence) as avg_confidence,
  COUNT(DISTINCT pib.user_id) as unique_users
  
FROM enostics_public_inbox pib
LEFT JOIN enostics_data_types dt ON pib.payload_type = dt.type_name
WHERE pib.payload_type IS NOT NULL
GROUP BY pib.payload_type, dt.display_name, dt.category, dt.icon, dt.color
ORDER BY total_count DESC;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Universal Endpoint Migration Schema Complete!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run migrate_endpoint_keys_to_universal() to migrate existing API keys';
  RAISE NOTICE '2. Update application code to use universal endpoints';
  RAISE NOTICE '3. Test classification engine with sample data';
  RAISE NOTICE '4. Deploy new UI components';
END $$; 