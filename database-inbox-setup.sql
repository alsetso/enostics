-- Universal Public Inbox System for Enostics
-- Every user gets a public inbox at /v1/{username}

-- Public inbox requests table
CREATE TABLE IF NOT EXISTS enostics_public_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES enostics_endpoints(id) ON DELETE SET NULL,
  
  -- Request metadata
  method VARCHAR(10) NOT NULL DEFAULT 'POST',
  source_ip INET,
  user_agent TEXT,
  referer TEXT,
  
  -- Payload data
  payload JSONB NOT NULL,
  payload_type VARCHAR(100), -- extracted from payload.type or inferred
  payload_source VARCHAR(255), -- extracted from payload.source or IP
  
  -- Classification
  content_type VARCHAR(100) DEFAULT 'application/json',
  content_length INTEGER,
  
  -- Security & tracking
  api_key_used UUID REFERENCES enostics_api_keys(id) ON DELETE SET NULL,
  is_authenticated BOOLEAN DEFAULT FALSE,
  is_suspicious BOOLEAN DEFAULT FALSE,
  abuse_score INTEGER DEFAULT 0, -- 0-100 abuse likelihood
  
  -- Processing status
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_status INTEGER,
  webhook_response TEXT,
  agent_processed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for performance
  CONSTRAINT valid_method CHECK (method IN ('POST', 'PUT', 'PATCH')),
  CONSTRAINT valid_abuse_score CHECK (abuse_score >= 0 AND abuse_score <= 100)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_public_inbox_user_id ON enostics_public_inbox(user_id);
CREATE INDEX IF NOT EXISTS idx_public_inbox_created_at ON enostics_public_inbox(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_inbox_type ON enostics_public_inbox(payload_type);
CREATE INDEX IF NOT EXISTS idx_public_inbox_source ON enostics_public_inbox(payload_source);
CREATE INDEX IF NOT EXISTS idx_public_inbox_suspicious ON enostics_public_inbox(is_suspicious) WHERE is_suspicious = TRUE;
CREATE INDEX IF NOT EXISTS idx_public_inbox_user_created ON enostics_public_inbox(user_id, created_at DESC);

-- GIN index for payload search
CREATE INDEX IF NOT EXISTS idx_public_inbox_payload_gin ON enostics_public_inbox USING GIN(payload);

-- Public inbox configuration table
CREATE TABLE IF NOT EXISTS enostics_public_inbox_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Access control
  is_public BOOLEAN DEFAULT TRUE,
  requires_api_key BOOLEAN DEFAULT FALSE,
  allowed_api_key_id UUID REFERENCES enostics_api_keys(id) ON DELETE SET NULL,
  
  -- Filtering & security
  blocked_ips INET[] DEFAULT '{}',
  allowed_sources TEXT[] DEFAULT '{}', -- domain whitelist
  max_payload_size INTEGER DEFAULT 1048576, -- 1MB default
  
  -- Auto-processing
  auto_webhook BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  webhook_secret TEXT,
  auto_agent_process BOOLEAN DEFAULT FALSE,
  
  -- Rate limiting
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_payload_size CHECK (max_payload_size > 0 AND max_payload_size <= 10485760), -- Max 10MB
  CONSTRAINT valid_rate_limits CHECK (rate_limit_per_hour > 0 AND rate_limit_per_day > 0)
);

-- Index for config lookups
CREATE INDEX IF NOT EXISTS idx_public_inbox_config_user_id ON enostics_public_inbox_config(user_id);

-- Rate limiting tracking table
CREATE TABLE IF NOT EXISTS enostics_public_inbox_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_ip INET NOT NULL,
  
  -- Counters
  requests_last_hour INTEGER DEFAULT 0,
  requests_last_day INTEGER DEFAULT 0,
  
  -- Time windows
  hour_window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  day_window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint
  UNIQUE(user_id, source_ip)
);

-- Index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_ip ON enostics_public_inbox_rate_limits(user_id, source_ip);
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON enostics_public_inbox_rate_limits(updated_at) WHERE updated_at < NOW() - INTERVAL '1 day';

-- RLS Policies

-- Public inbox requests - users can only see their own
ALTER TABLE enostics_public_inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inbox requests" ON enostics_public_inbox
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own inbox" ON enostics_public_inbox
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public inbox config - users can only manage their own
ALTER TABLE enostics_public_inbox_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inbox config" ON enostics_public_inbox_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own inbox config" ON enostics_public_inbox_config
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inbox config" ON enostics_public_inbox_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rate limits - users can view their own
ALTER TABLE enostics_public_inbox_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits" ON enostics_public_inbox_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Function to auto-create inbox config for new users
CREATE OR REPLACE FUNCTION create_public_inbox_config()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO enostics_public_inbox_config (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create inbox config
CREATE TRIGGER trigger_create_public_inbox_config
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_public_inbox_config();

-- Function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM enostics_public_inbox_rate_limits
  WHERE updated_at < NOW() - INTERVAL '2 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to extract payload metadata
CREATE OR REPLACE FUNCTION extract_payload_metadata(payload JSONB)
RETURNS TABLE(
  payload_type VARCHAR(100),
  payload_source VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY SELECT
    COALESCE(payload->>'type', 'unknown')::VARCHAR(100) as payload_type,
    COALESCE(payload->>'source', 'unknown')::VARCHAR(255) as payload_source;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate abuse score
CREATE OR REPLACE FUNCTION calculate_abuse_score(
  payload JSONB,
  source_ip INET,
  user_agent TEXT,
  recent_requests INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Large payload penalty
  IF jsonb_typeof(payload) = 'object' AND jsonb_object_keys_count(payload) > 50 THEN
    score := score + 10;
  END IF;
  
  -- Suspicious patterns in payload
  IF payload::TEXT ~* '(script|eval|exec|system|cmd)' THEN
    score := score + 30;
  END IF;
  
  -- High frequency from same IP
  IF recent_requests > 100 THEN
    score := score + 20;
  ELSIF recent_requests > 50 THEN
    score := score + 10;
  END IF;
  
  -- Missing or suspicious user agent
  IF user_agent IS NULL OR user_agent = '' THEN
    score := score + 5;
  ELSIF user_agent ~* '(bot|crawler|spider|scraper)' THEN
    score := score + 15;
  END IF;
  
  -- Cap at 100
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant permissions
GRANT SELECT, INSERT ON enostics_public_inbox TO authenticated;
GRANT SELECT, INSERT, UPDATE ON enostics_public_inbox_config TO authenticated;
GRANT SELECT ON enostics_public_inbox_rate_limits TO authenticated; 