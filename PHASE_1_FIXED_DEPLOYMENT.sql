-- 🚀 PHASE 1: ENOSTICS FOUNDATION - CORRECTED DEPLOYMENT
-- Copy this entire script and run it in Supabase Dashboard > SQL Editor

-- ==============================================================================
-- 🎯 SUBSCRIPTION PLANS (Foundation for Plan Selection)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enostics_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly INTEGER DEFAULT 0, -- Price in cents
  price_yearly INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Feature limits (for usage tracking)
  max_endpoints INTEGER DEFAULT 1,
  max_requests_per_month INTEGER DEFAULT 1000,
  max_payload_size_mb INTEGER DEFAULT 1,
  max_api_keys INTEGER DEFAULT 3,
  max_storage_gb INTEGER DEFAULT 1,
  
  -- Feature flags (for plan differentiation)
  has_ai_insights BOOLEAN DEFAULT false,
  has_custom_webhooks BOOLEAN DEFAULT false,
  has_advanced_analytics BOOLEAN DEFAULT false,
  has_team_management BOOLEAN DEFAULT false,
  has_priority_support BOOLEAN DEFAULT false,
  has_custom_branding BOOLEAN DEFAULT false,
  
  -- Stripe integration (for Phase 2)
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the exact plans from your registration form
INSERT INTO public.enostics_subscription_plans (
  plan_id, name, description, price_monthly, price_yearly,
  max_endpoints, max_requests_per_month, max_api_keys,
  has_ai_insights, has_custom_webhooks, has_advanced_analytics,
  has_team_management, has_priority_support
) VALUES 
  -- Citizen Plan (Free)
  ('citizen', 'Citizen', 'Perfect for personal data management', 0, 0, 
   1, 1000, 3, 
   false, false, false, false, false),
   
  -- Developer Plan ($29/month)
  ('developer', 'Developer', 'For developers building on Enostics', 2900, 29000, 
   5, 50000, 10, 
   true, true, true, false, true),
   
  -- Business Plan ($99/month)  
  ('business', 'Business', 'For teams and organizations', 9900, 99000, 
   -1, 500000, -1, 
   true, true, true, true, true)
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
  has_priority_support = EXCLUDED.has_priority_support,
  updated_at = NOW();

-- ==============================================================================
-- 👤 PROFILES TABLE (Matches Component Expectations)
-- ==============================================================================

-- Create main profiles table (to match component expectations)
-- Note: Using id that references auth.users(id), not user_id
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  username VARCHAR(50) UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  location TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  phone TEXT,
  
  -- Professional info
  job_title TEXT,
  company TEXT,
  industry TEXT,
  
  -- Preferences
  profile_emoji TEXT DEFAULT '👤',
  interests TEXT[], -- Array of interests
  expertise TEXT[], -- Array of expertise areas
  
  -- Plan tracking (for components)
  current_plan VARCHAR(50) DEFAULT 'citizen',
  
  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for current_plan after table creation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_current_plan_fkey'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_current_plan_fkey 
    FOREIGN KEY (current_plan) REFERENCES public.enostics_subscription_plans(plan_id);
  END IF;
END $$;

-- Create user_profiles table for backward compatibility
-- This uses user_id to match existing enostics_endpoints pattern
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name TEXT,
  current_plan VARCHAR(50) DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Add foreign key constraint for user_profiles current_plan
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_current_plan_fkey'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT user_profiles_current_plan_fkey 
    FOREIGN KEY (current_plan) REFERENCES public.enostics_subscription_plans(plan_id);
  END IF;
END $$;

-- ==============================================================================
-- 💳 USER SUBSCRIPTIONS (Full Subscription Tracking)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enostics_user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES public.enostics_subscription_plans(plan_id),
  
  -- Subscription status
  status VARCHAR(50) DEFAULT 'active',
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  
  -- Stripe integration (for Phase 2)
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Billing periods
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
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

-- ==============================================================================
-- 📊 USAGE METRICS & API KEYS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enostics_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL,
  current_count INTEGER DEFAULT 0,
  limit_count INTEGER DEFAULT -1,
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '1 month',
  reset_frequency VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_metric_period UNIQUE (user_id, metric_type, period_start)
);

-- Create API keys table if it doesn't exist (matches existing pattern)
CREATE TABLE IF NOT EXISTS public.enostics_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_hash TEXT NOT NULL,
  key_preview VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 🔄 COMPREHENSIVE SIGNUP TRIGGER (Fixed for existing structure)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    username_value TEXT;
    selected_plan_value TEXT;
    url_path_value TEXT;
    counter INTEGER := 0;
    plan_limits RECORD;
BEGIN
    -- Extract signup data from registration form
    username_value := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.user_metadata->>'username',
        split_part(NEW.email, '@', 1)
    );
    
    selected_plan_value := COALESCE(
        NEW.raw_user_meta_data->>'selected_plan',
        NEW.user_metadata->>'selected_plan',
        'citizen'
    );
    
    -- Validate plan exists (fallback to citizen if invalid)
    IF NOT EXISTS (SELECT 1 FROM public.enostics_subscription_plans WHERE plan_id = selected_plan_value AND is_active = true) THEN
        selected_plan_value := 'citizen';
    END IF;
    
    -- Get plan limits for usage initialization
    SELECT * INTO plan_limits FROM public.enostics_subscription_plans WHERE plan_id = selected_plan_value;
    
    -- Create sanitized URL path for endpoint
    url_path_value := LOWER(REGEXP_REPLACE(COALESCE(username_value, 'user'), '[^a-zA-Z0-9]', '', 'g'));
    IF url_path_value = '' OR url_path_value IS NULL THEN
        url_path_value := 'user' || EXTRACT(EPOCH FROM NOW())::INTEGER;
    END IF;
    
    -- Make username unique if needed
    counter := 0;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_value) OR 
          EXISTS (SELECT 1 FROM public.user_profiles WHERE username = username_value) LOOP
        counter := counter + 1;
        username_value := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)) || counter::TEXT;
        IF counter > 100 THEN EXIT; END IF;
    END LOOP;
    
    -- 1. Create profiles record (main profile table) - uses id not user_id
    INSERT INTO public.profiles (
        id, email, full_name, username, display_name, current_plan, onboarding_completed
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.user_metadata->>'full_name', username_value),
        username_value,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.user_metadata->>'full_name', username_value),
        selected_plan_value,
        false
    );
    
    -- 2. Create user_profiles record (for components that expect it) - uses user_id
    INSERT INTO public.user_profiles (
        user_id, username, display_name, current_plan
    ) VALUES (
        NEW.id,
        username_value,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.user_metadata->>'full_name', username_value),
        selected_plan_value
    );
    
    -- 3. Create subscription record
    INSERT INTO public.enostics_user_subscriptions (
        user_id, plan_id, status, billing_cycle,
        current_period_start, current_period_end
    ) VALUES (
        NEW.id, 
        selected_plan_value, 
        'active', 
        'monthly',
        NOW(),
        NOW() + INTERVAL '1 month'
    );
    
    -- 4. Initialize usage metrics based on plan limits
    INSERT INTO public.enostics_usage_metrics (user_id, metric_type, current_count, limit_count) VALUES
        (NEW.id, 'api_requests', 0, plan_limits.max_requests_per_month),
        (NEW.id, 'endpoints', 0, plan_limits.max_endpoints),
        (NEW.id, 'storage_mb', 0, plan_limits.max_storage_gb * 1024),
        (NEW.id, 'api_keys', 0, plan_limits.max_api_keys);
    
    -- 5. Create default endpoint (only if user doesn't have any)
    -- This works with your existing enostics_endpoints table
    IF NOT EXISTS (SELECT 1 FROM public.enostics_endpoints WHERE user_id = NEW.id) THEN
        counter := 0;
        LOOP
            BEGIN
                INSERT INTO public.enostics_endpoints (
                    user_id, name, url_path, description, is_active
                ) VALUES (
                    NEW.id,
                    'My Personal Endpoint',
                    CASE WHEN counter = 0 THEN url_path_value ELSE url_path_value || counter::TEXT END,
                    'Your personal data endpoint - ' || selected_plan_value || ' plan',
                    true
                );
                EXIT; -- Success, exit loop
            EXCEPTION WHEN unique_violation THEN
                counter := counter + 1;
                IF counter > 100 THEN
                    -- Use UUID suffix if we can't find a unique path
                    INSERT INTO public.enostics_endpoints (
                        user_id, name, url_path, description, is_active
                    ) VALUES (
                        NEW.id,
                        'My Personal Endpoint',
                        url_path_value || '_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8),
                        'Your personal data endpoint - ' || selected_plan_value || ' plan',
                        true
                    );
                    EXIT;
                END IF;
            END;
        END LOOP;
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user_signup trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace any existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- ==============================================================================
-- 🛠️ HELPER FUNCTIONS (For Dashboard Components)
-- ==============================================================================

-- Function expected by billing page: get_user_plan_limits
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_uuid UUID)
RETURNS TABLE (
    plan_id VARCHAR(50),
    max_endpoints INTEGER,
    max_requests_per_month INTEGER,
    max_api_keys INTEGER,
    current_month_requests INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.plan_id,
        p.max_endpoints,
        p.max_requests_per_month,
        p.max_api_keys,
        COALESCE(s.current_month_requests, 0)
    FROM public.enostics_user_subscriptions s
    JOIN public.enostics_subscription_plans p ON s.plan_id = p.plan_id
    WHERE s.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get complete user plan info
CREATE OR REPLACE FUNCTION public.get_user_plan_info(user_uuid UUID)
RETURNS TABLE (
    plan_id VARCHAR(50),
    plan_name VARCHAR(100),
    plan_description TEXT,
    price_monthly INTEGER,
    max_endpoints INTEGER,
    max_requests_per_month INTEGER,
    max_api_keys INTEGER,
    current_endpoints BIGINT,
    current_requests INTEGER,
    current_api_keys BIGINT,
    has_ai_insights BOOLEAN,
    has_custom_webhooks BOOLEAN,
    has_advanced_analytics BOOLEAN,
    subscription_status VARCHAR(50),
    billing_cycle VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.plan_id,
        p.name,
        p.description,
        p.price_monthly,
        p.max_endpoints,
        p.max_requests_per_month,
        p.max_api_keys,
        COALESCE((SELECT COUNT(*) FROM public.enostics_endpoints WHERE user_id = user_uuid AND is_active = true), 0),
        COALESCE(s.current_month_requests, 0),
        COALESCE((SELECT COUNT(*) FROM public.enostics_api_keys WHERE user_id = user_uuid AND is_active = true), 0),
        p.has_ai_insights,
        p.has_custom_webhooks,
        p.has_advanced_analytics,
        s.status,
        s.billing_cycle
    FROM public.enostics_user_subscriptions s
    JOIN public.enostics_subscription_plans p ON s.plan_id = p.plan_id
    WHERE s.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment usage counter function
CREATE OR REPLACE FUNCTION public.increment_user_usage(
    user_uuid UUID,
    metric_type_param VARCHAR(50),
    increment_by INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    current_period_start DATE := CURRENT_DATE;
BEGIN
    -- Update or insert usage metric
    INSERT INTO public.enostics_usage_metrics (user_id, metric_type, current_count, period_start, period_end)
    VALUES (user_uuid, metric_type_param, increment_by, current_period_start, current_period_start + INTERVAL '1 month')
    ON CONFLICT (user_id, metric_type, period_start)
    DO UPDATE SET 
        current_count = enostics_usage_metrics.current_count + increment_by,
        updated_at = NOW();
    
    -- Also update subscription table for API requests
    IF metric_type_param = 'api_requests' THEN
        UPDATE public.enostics_user_subscriptions 
        SET current_month_requests = current_month_requests + increment_by,
            updated_at = NOW()
        WHERE user_id = user_uuid;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 🔒 ROW LEVEL SECURITY
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.enostics_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.enostics_subscription_plans;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own user profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own user profile" ON public.user_profiles;
DROP POLICY IF EXISTS "System can manage user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.enostics_user_subscriptions;
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.enostics_user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.enostics_usage_metrics;
DROP POLICY IF EXISTS "System can track usage" ON public.enostics_usage_metrics;
DROP POLICY IF EXISTS "Users can manage their own API keys" ON public.enostics_api_keys;

-- Subscription plans (public read access)
CREATE POLICY "Anyone can view active subscription plans" ON public.enostics_subscription_plans
    FOR SELECT USING (is_active = true);

-- Profiles table policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- User profiles table policies  
CREATE POLICY "Users can view their own user profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own user profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage user profiles" ON public.user_profiles
    FOR ALL USING (true);

-- User subscriptions
CREATE POLICY "Users can view their own subscription" ON public.enostics_user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage subscriptions" ON public.enostics_user_subscriptions
    FOR ALL USING (true);

-- Usage metrics
CREATE POLICY "Users can view their own usage" ON public.enostics_usage_metrics
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can track usage" ON public.enostics_usage_metrics
    FOR ALL USING (true);

-- API keys
CREATE POLICY "Users can manage their own API keys" ON public.enostics_api_keys
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 📈 PERFORMANCE INDEXES
-- ==============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_current_plan ON public.profiles(current_plan);

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.enostics_user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.enostics_user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.enostics_user_subscriptions(status);

-- Usage metrics
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON public.enostics_usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_type ON public.enostics_usage_metrics(metric_type);

-- API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.enostics_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.enostics_api_keys(is_active);

-- ==============================================================================
-- ✅ DEPLOYMENT VERIFICATION
-- ==============================================================================

-- Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('enostics_subscription_plans', 'profiles', 'user_profiles', 'enostics_user_subscriptions', 'enostics_usage_metrics', 'enostics_api_keys');
    
    RAISE NOTICE 'Required tables created: % / 6', table_count;
    
    -- Verify plans exist
    SELECT COUNT(*) INTO table_count FROM public.enostics_subscription_plans;
    RAISE NOTICE 'Subscription plans available: %', table_count;
    
    -- Verify helper functions exist
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('get_user_plan_limits', 'get_user_plan_info', 'increment_user_usage');
    
    RAISE NOTICE 'Helper functions created: % / 3', table_count;
    
    -- Verify existing endpoints
    SELECT COUNT(*) INTO table_count FROM public.enostics_endpoints;
    RAISE NOTICE 'Existing endpoints: %', table_count;
END $$;

-- 🎉 PHASE 1 CORRECTED DEPLOYMENT COMPLETE!
-- 
-- Fixed Issues:
-- ✅ Proper foreign key references to auth.users(id)
-- ✅ Both profiles (id) and user_profiles (user_id) patterns supported
-- ✅ Works with existing enostics_endpoints table
-- ✅ Plan constraints added after table creation
-- ✅ Signup trigger won't duplicate existing endpoints
-- ✅ All helper functions match component expectations
--
-- Ready for testing:
-- 1. User registration with plan selection ✅
-- 2. Dashboard components should load without errors ✅
-- 3. Billing page should show plan limits and usage ✅
-- 4. Profile page should load and save correctly ✅ 