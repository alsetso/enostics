-- 🏗️ Enostics Subscription & Billing Schema
-- Complete role-based permissions and billing integration
-- Run this in your Supabase SQL Editor

-- ==============================================================================
-- 📋 Subscription Plans & Features
-- ==============================================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS public.enostics_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id VARCHAR(50) UNIQUE NOT NULL, -- 'citizen', 'developer', 'business'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly INTEGER DEFAULT 0, -- Price in cents
  price_yearly INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Feature limits
  max_endpoints INTEGER DEFAULT 1,
  max_requests_per_month INTEGER DEFAULT 1000,
  max_payload_size INTEGER DEFAULT 1048576, -- 1MB
  max_api_keys INTEGER DEFAULT 3,
  
  -- Feature flags
  has_ai_insights BOOLEAN DEFAULT false,
  has_custom_webhooks BOOLEAN DEFAULT false,
  has_advanced_analytics BOOLEAN DEFAULT false,
  has_team_management BOOLEAN DEFAULT false,
  has_custom_integrations BOOLEAN DEFAULT false,
  has_priority_support BOOLEAN DEFAULT false,
  has_sla_guarantee BOOLEAN DEFAULT false,
  has_custom_branding BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.enostics_user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES public.enostics_subscription_plans(plan_id),
  
  -- Subscription status
  status VARCHAR(50) DEFAULT 'active', -- active, past_due, canceled, incomplete
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
  
  -- Payment details
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Billing dates
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  
  -- Usage tracking
  current_month_requests INTEGER DEFAULT 0,
  current_month_reset_date DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_subscription UNIQUE (user_id),
  CONSTRAINT valid_status CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly'))
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS public.enostics_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES public.enostics_endpoints(id) ON DELETE CASCADE,
  
  -- Usage metrics
  requests_count INTEGER DEFAULT 0,
  data_volume_bytes BIGINT DEFAULT 0,
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_period UNIQUE (user_id, period_start, period_end)
);

-- Billing events table
CREATE TABLE IF NOT EXISTS public.enostics_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(50) NOT NULL, -- subscription_created, payment_succeeded, etc.
  stripe_event_id VARCHAR(255),
  
  -- Event data
  event_data JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 🔧 Insert Default Plans
-- ==============================================================================

INSERT INTO public.enostics_subscription_plans (
  plan_id, name, description, price_monthly, price_yearly,
  max_endpoints, max_requests_per_month, max_api_keys,
  has_ai_insights, has_custom_webhooks, has_advanced_analytics,
  has_team_management, has_custom_integrations, has_priority_support,
  has_sla_guarantee, has_custom_branding
) VALUES 
  (
    'citizen', 'Citizen', 'Perfect for personal data management',
    0, 0, 1, 1000, 3,
    false, false, false, false, false, false, false, false
  ),
  (
    'developer', 'Developer', 'For developers building on Enostics',
    2900, 29000, 5, 50000, 10,
    true, true, true, false, false, true, false, false
  ),
  (
    'business', 'Business', 'For teams and organizations',
    9900, 99000, -1, 500000, -1,
    true, true, true, true, true, true, true, true
  )
ON CONFLICT (plan_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_endpoints = EXCLUDED.max_endpoints,
  max_requests_per_month = EXCLUDED.max_requests_per_month,
  max_api_keys = EXCLUDED.max_api_keys,
  has_ai_insights = EXCLUDED.has_ai_insights,
  has_custom_webhooks = EXCLUDED.has_custom_webhooks,
  has_advanced_analytics = EXCLUDED.has_advanced_analytics,
  has_team_management = EXCLUDED.has_team_management,
  has_custom_integrations = EXCLUDED.has_custom_integrations,
  has_priority_support = EXCLUDED.has_priority_support,
  has_sla_guarantee = EXCLUDED.has_sla_guarantee,
  has_custom_branding = EXCLUDED.has_custom_branding,
  updated_at = NOW();

-- ==============================================================================
-- 🔄 Update Existing Tables
-- ==============================================================================

-- Add plan tracking to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS current_plan VARCHAR(50) DEFAULT 'citizen' REFERENCES public.enostics_subscription_plans(plan_id);

-- Add usage tracking to endpoints
ALTER TABLE public.enostics_endpoints
ADD COLUMN IF NOT EXISTS monthly_requests INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_request_reset DATE DEFAULT CURRENT_DATE;

-- ==============================================================================
-- 🔒 Row Level Security
-- ==============================================================================

ALTER TABLE public.enostics_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_billing_events ENABLE ROW LEVEL SECURITY;

-- Plans are public (read-only)
CREATE POLICY "Anyone can view active subscription plans" ON public.enostics_subscription_plans
  FOR SELECT USING (is_active = true);

-- User subscriptions - users can only see their own
CREATE POLICY "Users can view their own subscription" ON public.enostics_user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.enostics_user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscriptions" ON public.enostics_user_subscriptions
  FOR ALL USING (true);

-- Usage tracking - users can only see their own
CREATE POLICY "Users can view their own usage" ON public.enostics_usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can track usage" ON public.enostics_usage_tracking
  FOR ALL USING (true);

-- Billing events - users can only see their own
CREATE POLICY "Users can view their own billing events" ON public.enostics_billing_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage billing events" ON public.enostics_billing_events
  FOR ALL USING (true);

-- ==============================================================================
-- 🔧 Helper Functions
-- ==============================================================================

-- Function to get user's current plan with limits
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_uuid UUID)
RETURNS TABLE (
  plan_id VARCHAR(50),
  max_endpoints INTEGER,
  max_requests_per_month INTEGER,
  max_api_keys INTEGER,
  current_month_requests INTEGER,
  has_ai_insights BOOLEAN,
  has_custom_webhooks BOOLEAN,
  has_advanced_analytics BOOLEAN,
  has_team_management BOOLEAN,
  has_custom_integrations BOOLEAN,
  has_priority_support BOOLEAN,
  has_sla_guarantee BOOLEAN,
  has_custom_branding BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.plan_id,
    p.max_endpoints,
    p.max_requests_per_month,
    p.max_api_keys,
    COALESCE(s.current_month_requests, 0) as current_month_requests,
    p.has_ai_insights,
    p.has_custom_webhooks,
    p.has_advanced_analytics,
    p.has_team_management,
    p.has_custom_integrations,
    p.has_priority_support,
    p.has_sla_guarantee,
    p.has_custom_branding
  FROM public.enostics_subscription_plans p
  LEFT JOIN public.enostics_user_subscriptions s ON s.plan_id = p.plan_id AND s.user_id = user_uuid
  LEFT JOIN public.user_profiles up ON up.user_id = user_uuid
  WHERE p.plan_id = COALESCE(s.plan_id, up.current_plan, 'citizen')
  AND p.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION public.increment_user_usage(
  user_uuid UUID,
  endpoint_uuid UUID DEFAULT NULL,
  request_count INTEGER DEFAULT 1,
  data_bytes BIGINT DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
  current_period_start DATE;
  current_period_end DATE;
BEGIN
  -- Calculate current month period
  current_period_start := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  current_period_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  -- Update subscription usage counter
  UPDATE public.enostics_user_subscriptions 
  SET 
    current_month_requests = current_month_requests + request_count,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Update or insert usage tracking
  INSERT INTO public.enostics_usage_tracking (
    user_id, endpoint_id, requests_count, data_volume_bytes, 
    period_start, period_end
  )
  VALUES (
    user_uuid, endpoint_uuid, request_count, data_bytes,
    current_period_start, current_period_end
  )
  ON CONFLICT (user_id, period_start, period_end)
  DO UPDATE SET
    requests_count = enostics_usage_tracking.requests_count + request_count,
    data_volume_bytes = enostics_usage_tracking.data_volume_bytes + data_bytes,
    updated_at = NOW();
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create endpoint
CREATE OR REPLACE FUNCTION public.can_user_create_endpoint(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_limits RECORD;
  current_endpoints INTEGER;
BEGIN
  -- Get user's plan limits
  SELECT * INTO user_limits FROM public.get_user_plan_limits(user_uuid) LIMIT 1;
  
  -- Count current endpoints
  SELECT COUNT(*) INTO current_endpoints
  FROM public.enostics_endpoints
  WHERE user_id = user_uuid AND is_active = true;
  
  -- Check if unlimited (-1) or under limit
  RETURN (user_limits.max_endpoints = -1 OR current_endpoints < user_limits.max_endpoints);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can make request
CREATE OR REPLACE FUNCTION public.can_user_make_request(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_limits RECORD;
BEGIN
  -- Get user's plan limits
  SELECT * INTO user_limits FROM public.get_user_plan_limits(user_uuid) LIMIT 1;
  
  -- Check if unlimited (-1) or under limit
  RETURN (user_limits.max_requests_per_month = -1 OR user_limits.current_month_requests < user_limits.max_requests_per_month);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 🔄 Update User Registration Trigger
-- ==============================================================================

-- Update the handle_new_user function to create default subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_value TEXT;
    url_path_value TEXT;
    counter INTEGER := 0;
BEGIN
    -- Extract username from metadata or use email prefix
    username_value := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name', 
        split_part(NEW.email, '@', 1)
    );
    
    -- Create initial URL path (sanitized)
    url_path_value := LOWER(REGEXP_REPLACE(COALESCE(username_value, 'user'), '[^a-zA-Z0-9]', '', 'g'));
    
    -- Ensure url_path is not empty
    IF url_path_value = '' OR url_path_value IS NULL THEN
        url_path_value := 'user' || EXTRACT(EPOCH FROM NOW())::INTEGER;
    END IF;
    
    -- Insert user profile with default plan
    INSERT INTO public.user_profiles (user_id, full_name, role, current_plan)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', username_value, ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'consumer'),
        'citizen'
    );
    
    -- Create default subscription
    INSERT INTO public.enostics_user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, 'citizen', 'active');
    
    -- Create a default endpoint with unique url_path
    LOOP
        BEGIN
            INSERT INTO public.enostics_endpoints (user_id, name, url_path, description)
            VALUES (
                NEW.id,
                'Default Endpoint',
                CASE 
                    WHEN counter = 0 THEN url_path_value
                    ELSE url_path_value || counter::TEXT
                END,
                'Your personal data endpoint'
            );
            EXIT; -- Success, exit loop
        EXCEPTION WHEN unique_violation THEN
            counter := counter + 1;
            IF counter > 100 THEN -- Prevent infinite loop
                -- Use UUID suffix if we can't find a unique path
                INSERT INTO public.enostics_endpoints (user_id, name, url_path, description)
                VALUES (
                    NEW.id,
                    'Default Endpoint',
                    url_path_value || '_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8),
                    'Your personal data endpoint'
                );
                EXIT;
            END IF;
        END;
    END LOOP;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error and continue (don't block user creation)
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 📊 Indexes for Performance
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.enostics_user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.enostics_user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.enostics_user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.enostics_user_subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.enostics_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON public.enostics_usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_endpoint_id ON public.enostics_usage_tracking(endpoint_id);

CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON public.enostics_billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON public.enostics_billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_id ON public.enostics_billing_events(stripe_event_id);

-- Update existing user_profiles to have current_plan
UPDATE public.user_profiles 
SET current_plan = 'citizen' 
WHERE current_plan IS NULL;

-- Create subscriptions for existing users
INSERT INTO public.enostics_user_subscriptions (user_id, plan_id, status)
SELECT user_id, 'citizen', 'active'
FROM public.user_profiles 
WHERE user_id NOT IN (SELECT user_id FROM public.enostics_user_subscriptions)
ON CONFLICT (user_id) DO NOTHING; 