-- Fix missing public inbox tables that are causing errors
-- Run this in your Supabase SQL Editor

-- Create public inbox requests table
CREATE TABLE IF NOT EXISTS public.enostics_public_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES public.enostics_endpoints(id) ON DELETE SET NULL,
  
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
  api_key_used UUID, -- Will reference API keys table when created
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
  
  -- Constraints
  CONSTRAINT valid_method CHECK (method IN ('POST', 'PUT', 'PATCH', 'GET')),
  CONSTRAINT valid_abuse_score CHECK (abuse_score >= 0 AND abuse_score <= 100)
);

-- Create public inbox configuration table
CREATE TABLE IF NOT EXISTS public.enostics_public_inbox_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Access control
  is_public BOOLEAN DEFAULT TRUE,
  requires_api_key BOOLEAN DEFAULT FALSE,
  allowed_api_key_id UUID, -- Will reference API keys table when created
  
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

-- Create comprehensive activity logs table for the logs page
CREATE TABLE IF NOT EXISTS public.enostics_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Log classification
  log_type VARCHAR(50) NOT NULL, -- 'request', 'email', 'auth', 'system', 'webhook', 'error'
  category VARCHAR(100) NOT NULL, -- 'Universal Inbox', 'Endpoint', 'Email Notification', etc.
  action VARCHAR(255) NOT NULL, -- 'POST Request', 'Email Sent', 'Login', etc.
  status VARCHAR(20) NOT NULL DEFAULT 'info', -- 'success', 'failure', 'warning', 'info'
  
  -- Source information
  source_identifier VARCHAR(255), -- IP address, email service, system component, etc.
  source_type VARCHAR(50), -- 'ip_address', 'email_service', 'system', 'user_agent', etc.
  
  -- Event details
  details JSONB DEFAULT '{}', -- Flexible JSON for event-specific data
  metadata JSONB DEFAULT '{}', -- Additional context and tags
  
  -- Related entities
  endpoint_id UUID REFERENCES public.enostics_endpoints(id) ON DELETE SET NULL,
  request_id UUID, -- Can reference various request tables
  email_id VARCHAR(255), -- External email service ID (like Resend)
  
  -- Performance metrics
  response_time_ms INTEGER,
  payload_size INTEGER,
  
  -- Error information
  error_code VARCHAR(50),
  error_message TEXT,
  stack_trace TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_log_type CHECK (log_type IN ('request', 'email', 'auth', 'system', 'webhook', 'error', 'api_key', 'data')),
  CONSTRAINT valid_status CHECK (status IN ('success', 'failure', 'warning', 'info'))
);

-- Create email logs table for tracking all email communications
CREATE TABLE IF NOT EXISTS public.enostics_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email details
  external_email_id VARCHAR(255), -- Resend email ID
  email_type VARCHAR(100) NOT NULL, -- 'welcome', 'notification', 'summary', 'custom'
  template_name VARCHAR(100),
  
  -- Recipients and content
  to_addresses TEXT[] NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  reply_to VARCHAR(255),
  subject TEXT NOT NULL,
  
  -- Delivery tracking
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked'
  delivery_attempts INTEGER DEFAULT 1,
  last_delivery_attempt TIMESTAMP WITH TIME ZONE,
  
  -- Related entities
  endpoint_id UUID REFERENCES public.enostics_endpoints(id) ON DELETE SET NULL,
  triggered_by_request_id UUID,
  
  -- Metadata
  email_data JSONB DEFAULT '{}', -- Template data used
  provider_response JSONB DEFAULT '{}', -- Response from email service
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_email_status CHECK (status IN ('sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked', 'unsubscribed'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_inbox_user_id ON public.enostics_public_inbox(user_id);
CREATE INDEX IF NOT EXISTS idx_public_inbox_created_at ON public.enostics_public_inbox(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_inbox_type ON public.enostics_public_inbox(payload_type);
CREATE INDEX IF NOT EXISTS idx_public_inbox_source ON public.enostics_public_inbox(payload_source);
CREATE INDEX IF NOT EXISTS idx_public_inbox_suspicious ON public.enostics_public_inbox(is_suspicious) WHERE is_suspicious = TRUE;
CREATE INDEX IF NOT EXISTS idx_public_inbox_user_created ON public.enostics_public_inbox(user_id, created_at DESC);

-- GIN index for payload search
CREATE INDEX IF NOT EXISTS idx_public_inbox_payload_gin ON public.enostics_public_inbox USING GIN(payload);

-- Index for config lookups
CREATE INDEX IF NOT EXISTS idx_public_inbox_config_user_id ON public.enostics_public_inbox_config(user_id);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.enostics_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.enostics_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.enostics_activity_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_status ON public.enostics_activity_logs(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type_created ON public.enostics_activity_logs(user_id, log_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_status_created ON public.enostics_activity_logs(user_id, status, created_at DESC);

-- GIN indexes for JSON columns
CREATE INDEX IF NOT EXISTS idx_activity_logs_details_gin ON public.enostics_activity_logs USING GIN(details);
CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata_gin ON public.enostics_activity_logs USING GIN(metadata);

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.enostics_email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.enostics_email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.enostics_email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.enostics_email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_external_id ON public.enostics_email_logs(external_email_id);

-- Enable Row Level Security
ALTER TABLE public.enostics_public_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_public_inbox_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public inbox
CREATE POLICY "Users can view their own inbox requests" ON public.enostics_public_inbox
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert inbox requests" ON public.enostics_public_inbox
  FOR INSERT WITH CHECK (true);

-- RLS Policies for inbox config
CREATE POLICY "Users can view their own inbox config" ON public.enostics_public_inbox_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own inbox config" ON public.enostics_public_inbox_config
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inbox config" ON public.enostics_public_inbox_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity logs
CREATE POLICY "Users can view their own activity logs" ON public.enostics_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON public.enostics_activity_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for email logs
CREATE POLICY "Users can view their own email logs" ON public.enostics_email_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert email logs" ON public.enostics_email_logs
  FOR INSERT WITH CHECK (true);

-- Create function to automatically log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_log_type VARCHAR(50),
  p_category VARCHAR(100),
  p_action VARCHAR(255),
  p_status VARCHAR(20) DEFAULT 'info',
  p_source_identifier VARCHAR(255) DEFAULT NULL,
  p_source_type VARCHAR(50) DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_metadata JSONB DEFAULT '{}',
  p_endpoint_id UUID DEFAULT NULL,
  p_request_id UUID DEFAULT NULL,
  p_email_id VARCHAR(255) DEFAULT NULL,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_payload_size INTEGER DEFAULT NULL,
  p_error_code VARCHAR(50) DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.enostics_activity_logs (
    user_id,
    log_type,
    category,
    action,
    status,
    source_identifier,
    source_type,
    details,
    metadata,
    endpoint_id,
    request_id,
    email_id,
    response_time_ms,
    payload_size,
    error_code,
    error_message
  ) VALUES (
    p_user_id,
    p_log_type,
    p_category,
    p_action,
    p_status,
    p_source_identifier,
    p_source_type,
    p_details,
    p_metadata,
    p_endpoint_id,
    p_request_id,
    p_email_id,
    p_response_time_ms,
    p_payload_size,
    p_error_code,
    p_error_message
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log inbox requests
CREATE OR REPLACE FUNCTION public.log_inbox_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the inbox request
  PERFORM public.log_activity(
    NEW.user_id,
    'request',
    'Universal Inbox',
    CONCAT(NEW.method, ' Request'),
    CASE 
      WHEN NEW.is_suspicious THEN 'warning'
      WHEN NEW.abuse_score > 70 THEN 'warning'
      ELSE 'success'
    END,
    NEW.source_ip::TEXT,
    'ip_address',
    jsonb_build_object(
      'payload_type', NEW.payload_type,
      'payload_source', NEW.payload_source,
      'content_type', NEW.content_type,
      'content_length', NEW.content_length,
      'is_authenticated', NEW.is_authenticated,
      'is_suspicious', NEW.is_suspicious,
      'abuse_score', NEW.abuse_score
    ),
    jsonb_build_object(
      'user_agent', NEW.user_agent,
      'referer', NEW.referer
    ),
    NEW.endpoint_id,
    NEW.id,
    NULL,
    NULL,
    NEW.content_length
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_log_inbox_request
  AFTER INSERT ON public.enostics_public_inbox
  FOR EACH ROW EXECUTE FUNCTION public.log_inbox_request();

-- Insert some sample activity logs for demonstration
INSERT INTO public.enostics_activity_logs (
  user_id,
  log_type,
  category,
  action,
  status,
  source_identifier,
  source_type,
  details,
  metadata,
  created_at
) VALUES
-- Sample system events
(
  (SELECT id FROM auth.users LIMIT 1),
  'system',
  'Account',
  'User Registration',
  'success',
  'system',
  'system',
  '{"registration_method": "email", "profile_created": true, "endpoint_created": true}',
  '{"ip_address": "192.168.1.100", "user_agent": "Mozilla/5.0"}',
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'auth',
  'Authentication',
  'User Login',
  'success',
  '192.168.1.100',
  'ip_address',
  '{"login_method": "email", "session_duration": "24h"}',
  '{"user_agent": "Mozilla/5.0", "device": "desktop"}',
  NOW() - INTERVAL '1 day'
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully created missing inbox tables and activity logging system!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- enostics_public_inbox';
  RAISE NOTICE '- enostics_public_inbox_config';
  RAISE NOTICE '- enostics_activity_logs';
  RAISE NOTICE '- enostics_email_logs';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '- log_activity()';
  RAISE NOTICE '- log_inbox_request()';
  RAISE NOTICE 'Triggers created:';
  RAISE NOTICE '- trigger_log_inbox_request';
END $$; 