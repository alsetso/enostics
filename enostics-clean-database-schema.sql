-- 🚀 Enostics Clean Database Schema
-- Complete system for universal personal API platform
-- Run this in your Supabase SQL Editor

-- ==============================================================================
-- 🛡️ Enable Extensions & Security
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ==============================================================================
-- 👤 User Management System
-- ==============================================================================

-- User profiles with subscription tiers
CREATE TABLE IF NOT EXISTS public.enostics_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Profile information
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  
  -- Subscription & tier
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'developer', 'business'
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Settings
  is_public BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  timezone VARCHAR(100) DEFAULT 'UTC',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'developer', 'business')),
  CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
  CONSTRAINT valid_username CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$')
);

-- ==============================================================================
-- 🔗 Universal Endpoint System
-- ==============================================================================

-- Enhanced endpoints table
CREATE TABLE IF NOT EXISTS public.enostics_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Endpoint details
  name VARCHAR(100) NOT NULL,
  description TEXT,
  endpoint_path VARCHAR(100) NOT NULL, -- e.g., 'health', 'iot', 'main'
  
  -- Configuration
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  requires_api_key BOOLEAN DEFAULT FALSE,
  
  -- Processing settings
  auto_classify BOOLEAN DEFAULT TRUE,
  webhook_url TEXT,
  webhook_secret TEXT,
  webhook_enabled BOOLEAN DEFAULT FALSE,
  
  -- Rate limiting
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_endpoint_path UNIQUE (user_id, endpoint_path),
  CONSTRAINT valid_endpoint_path CHECK (endpoint_path ~ '^[a-zA-Z0-9_-]{1,100}$')
);

-- Universal inbox data (all incoming data)
CREATE TABLE IF NOT EXISTS public.enostics_inbox_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES public.enostics_endpoints(id) ON DELETE SET NULL,
  
  -- Request metadata
  method VARCHAR(10) NOT NULL DEFAULT 'POST',
  source_ip INET,
  user_agent TEXT,
  referer TEXT,
  content_type VARCHAR(100) DEFAULT 'application/json',
  content_length INTEGER,
  
  -- Data payload
  payload JSONB NOT NULL,
  
  -- Classification
  data_type VARCHAR(100), -- 'health', 'iot', 'financial', 'message', etc.
  data_source VARCHAR(255), -- 'apple_health', 'tesla_api', 'stripe', etc.
  data_tags TEXT[],
  classification_confidence DECIMAL(3,2) DEFAULT 0.50,
  
  -- Processing status
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_status INTEGER,
  
  -- Security
  is_suspicious BOOLEAN DEFAULT FALSE,
  abuse_score INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_method CHECK (method IN ('POST', 'PUT', 'PATCH', 'GET')),
  CONSTRAINT valid_abuse_score CHECK (abuse_score >= 0 AND abuse_score <= 100)
);

-- ==============================================================================
-- 🔑 API Key Management
-- ==============================================================================

-- Enhanced API keys table
CREATE TABLE IF NOT EXISTS public.enostics_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES public.enostics_endpoints(id) ON DELETE CASCADE,
  
  -- Key details
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Permissions
  is_active BOOLEAN DEFAULT TRUE,
  can_read BOOLEAN DEFAULT TRUE,
  can_write BOOLEAN DEFAULT TRUE,
  allowed_types TEXT[] DEFAULT '{}',
  allowed_sources TEXT[] DEFAULT '{}',
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year')
);

-- ==============================================================================
-- 👥 Inter-User Messaging & Contacts
-- ==============================================================================

-- Contact management
CREATE TABLE IF NOT EXISTS public.enostics_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contact details
  contact_username VARCHAR(50) NOT NULL,
  display_name VARCHAR(100),
  relationship_type VARCHAR(50) DEFAULT 'contact',
  
  -- Permissions
  can_send_messages BOOLEAN DEFAULT TRUE,
  can_send_health_data BOOLEAN DEFAULT FALSE,
  can_send_financial_data BOOLEAN DEFAULT FALSE,
  allowed_data_types TEXT[] DEFAULT '{}',
  
  -- Metadata
  is_favorite BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_contact UNIQUE (user_id, contact_user_id),
  CONSTRAINT no_self_contact CHECK (user_id != contact_user_id),
  CONSTRAINT valid_relationship CHECK (relationship_type IN ('contact', 'family', 'colleague', 'patient', 'doctor', 'team_member', 'organization'))
);

-- Inter-user messages
CREATE TABLE IF NOT EXISTS public.enostics_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.enostics_contacts(id) ON DELETE SET NULL,
  
  -- Message details
  message_type VARCHAR(50) DEFAULT 'message',
  subject TEXT,
  body TEXT,
  
  -- Data payload
  payload JSONB NOT NULL,
  data_type VARCHAR(100),
  
  -- Delivery status
  status VARCHAR(20) DEFAULT 'sent',
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_message_type CHECK (message_type IN ('message', 'data_share', 'notification', 'request')),
  CONSTRAINT valid_status CHECK (status IN ('sent', 'delivered', 'read', 'failed'))
);

-- ==============================================================================
-- 💰 Subscription & Billing System
-- ==============================================================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.enostics_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Pricing
  price_monthly INTEGER DEFAULT 0, -- cents
  price_yearly INTEGER DEFAULT 0,
  
  -- Limits
  max_endpoints INTEGER DEFAULT 1,
  max_requests_per_month INTEGER DEFAULT 1000,
  max_api_keys INTEGER DEFAULT 3,
  max_contacts INTEGER DEFAULT 10,
  
  -- Features
  has_inter_user_messaging BOOLEAN DEFAULT FALSE,
  has_advanced_analytics BOOLEAN DEFAULT FALSE,
  has_webhooks BOOLEAN DEFAULT FALSE,
  has_custom_domains BOOLEAN DEFAULT FALSE,
  has_priority_support BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.enostics_user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id VARCHAR(20) NOT NULL REFERENCES public.enostics_subscription_plans(plan_id),
  
  -- Billing
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Usage tracking
  current_month_requests INTEGER DEFAULT 0,
  current_month_reset_date DATE DEFAULT CURRENT_DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly')),
  CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'past_due', 'canceled', 'trialing'))
);

-- ==============================================================================
-- 📊 Analytics & Logging System
-- ==============================================================================

-- Request logs for analytics
CREATE TABLE IF NOT EXISTS public.enostics_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES public.enostics_endpoints(id) ON DELETE SET NULL,
  api_key_id UUID REFERENCES public.enostics_api_keys(id) ON DELETE SET NULL,
  
  -- Request details
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  
  -- Content
  content_type VARCHAR(100),
  content_length INTEGER,
  
  -- Source
  source_ip INET,
  user_agent TEXT,
  referer TEXT,
  
  -- Classification
  data_type VARCHAR(100),
  data_source VARCHAR(255),
  
  -- Processing
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_status INTEGER,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_method CHECK (method IN ('POST', 'PUT', 'PATCH', 'GET')),
  CONSTRAINT valid_status_code CHECK (status_code >= 100 AND status_code < 600)
);

-- Activity logs for user dashboard
CREATE TABLE IF NOT EXISTS public.enostics_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  action VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'success',
  
  -- Context
  details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Related entities
  endpoint_id UUID REFERENCES public.enostics_endpoints(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_activity_type CHECK (activity_type IN ('request', 'message', 'auth', 'subscription', 'webhook', 'system')),
  CONSTRAINT valid_status CHECK (status IN ('success', 'failure', 'warning', 'info'))
);

-- ==============================================================================
-- 🔍 Indexes for Performance
-- ==============================================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_enostics_user_profiles_user_id ON public.enostics_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_user_profiles_username ON public.enostics_user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_enostics_user_profiles_tier ON public.enostics_user_profiles(subscription_tier);

-- Endpoints indexes
CREATE INDEX IF NOT EXISTS idx_enostics_endpoints_user_id ON public.enostics_endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_endpoints_active ON public.enostics_endpoints(user_id, is_active) WHERE is_active = TRUE;

-- Inbox data indexes
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_data_user_id ON public.enostics_inbox_data(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_data_created ON public.enostics_inbox_data(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_data_type ON public.enostics_inbox_data(data_type);
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_data_source ON public.enostics_inbox_data(data_source);
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_data_unread ON public.enostics_inbox_data(user_id, is_read) WHERE is_read = FALSE;

-- API keys indexes
CREATE INDEX IF NOT EXISTS idx_enostics_api_keys_user_id ON public.enostics_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_api_keys_hash ON public.enostics_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_enostics_api_keys_active ON public.enostics_api_keys(user_id, is_active) WHERE is_active = TRUE;

-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_enostics_contacts_user_id ON public.enostics_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_contacts_contact_user ON public.enostics_contacts(contact_user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_contacts_username ON public.enostics_contacts(contact_username);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_enostics_messages_sender ON public.enostics_messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_messages_recipient ON public.enostics_messages(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_messages_created ON public.enostics_messages(recipient_user_id, created_at DESC);

-- Request logs indexes
CREATE INDEX IF NOT EXISTS idx_enostics_request_logs_user_id ON public.enostics_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_request_logs_created ON public.enostics_request_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_request_logs_endpoint ON public.enostics_request_logs(endpoint_id);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_enostics_activity_logs_user_id ON public.enostics_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_activity_logs_created ON public.enostics_activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_activity_logs_type ON public.enostics_activity_logs(activity_type);

-- ==============================================================================
-- 🛡️ Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.enostics_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_inbox_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_activity_logs ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.enostics_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.enostics_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Endpoints policies
CREATE POLICY "Users can manage own endpoints" ON public.enostics_endpoints
  FOR ALL USING (auth.uid() = user_id);

-- Inbox data policies
CREATE POLICY "Users can view own inbox data" ON public.enostics_inbox_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own inbox data" ON public.enostics_inbox_data
  FOR UPDATE USING (auth.uid() = user_id);

-- API keys policies
CREATE POLICY "Users can manage own API keys" ON public.enostics_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Contacts policies
CREATE POLICY "Users can manage own contacts" ON public.enostics_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view sent messages" ON public.enostics_messages
  FOR SELECT USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can view received messages" ON public.enostics_messages
  FOR SELECT USING (auth.uid() = recipient_user_id);

CREATE POLICY "Users can send messages" ON public.enostics_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.enostics_user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Logs policies
CREATE POLICY "Users can view own request logs" ON public.enostics_request_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity logs" ON public.enostics_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ==============================================================================
-- 🎯 Insert Default Data
-- ==============================================================================

-- Insert default subscription plans
INSERT INTO public.enostics_subscription_plans (
  plan_id, name, description, price_monthly, price_yearly,
  max_endpoints, max_requests_per_month, max_api_keys, max_contacts,
  has_inter_user_messaging, has_advanced_analytics, has_webhooks, has_custom_domains, has_priority_support
) VALUES 
  (
    'free', 'Free', 'Perfect for personal use',
    0, 0, 1, 1000, 3, 5,
    false, false, false, false, false
  ),
  (
    'developer', 'Developer', 'For developers and power users',
    2900, 29000, 5, 50000, 10, 100,
    true, true, true, false, true
  ),
  (
    'business', 'Business', 'For teams and organizations',
    9900, 99000, -1, 500000, -1, -1,
    true, true, true, true, true
  )
ON CONFLICT (plan_id) DO NOTHING;

-- ==============================================================================
-- 🔧 Utility Functions
-- ==============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract username from email
  username_value := split_part(NEW.email, '@', 1);
  username_value := regexp_replace(username_value, '[^a-zA-Z0-9_-]', '', 'g');
  username_value := LOWER(username_value);
  
  -- Ensure username is unique
  WHILE EXISTS (SELECT 1 FROM public.enostics_user_profiles WHERE username = username_value) LOOP
    counter := counter + 1;
    username_value := split_part(NEW.email, '@', 1) || counter;
    username_value := regexp_replace(username_value, '[^a-zA-Z0-9_-]', '', 'g');
    username_value := LOWER(username_value);
  END LOOP;
  
  -- Create user profile
  INSERT INTO public.enostics_user_profiles (user_id, username, display_name, subscription_tier)
  VALUES (NEW.id, username_value, COALESCE(NEW.raw_user_meta_data->>'full_name', username_value), 'free');
  
  -- Create default subscription
  INSERT INTO public.enostics_user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active');
  
  -- Create default endpoint
  INSERT INTO public.enostics_endpoints (user_id, name, description, endpoint_path)
  VALUES (NEW.id, 'Universal Inbox', 'Your personal data endpoint', 'main');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_enostics_user_profiles_updated_at
  BEFORE UPDATE ON public.enostics_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enostics_endpoints_updated_at
  BEFORE UPDATE ON public.enostics_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enostics_contacts_updated_at
  BEFORE UPDATE ON public.enostics_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enostics_user_subscriptions_updated_at
  BEFORE UPDATE ON public.enostics_user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 