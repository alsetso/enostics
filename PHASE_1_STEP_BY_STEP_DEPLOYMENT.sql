-- 🚀 PHASE 1: ENOSTICS FOUNDATION - STEP BY STEP DEPLOYMENT
-- Copy and run this ENTIRE script in Supabase Dashboard > SQL Editor

-- ==============================================================================
-- STEP 1: SUBSCRIPTION PLANS (Foundation)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enostics_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly INTEGER DEFAULT 0,
  price_yearly INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  max_endpoints INTEGER DEFAULT 1,
  max_requests_per_month INTEGER DEFAULT 1000,
  max_payload_size_mb INTEGER DEFAULT 1,
  max_api_keys INTEGER DEFAULT 3,
  max_storage_gb INTEGER DEFAULT 1,
  has_ai_insights BOOLEAN DEFAULT false,
  has_custom_webhooks BOOLEAN DEFAULT false,
  has_advanced_analytics BOOLEAN DEFAULT false,
  has_team_management BOOLEAN DEFAULT false,
  has_priority_support BOOLEAN DEFAULT false,
  has_custom_branding BOOLEAN DEFAULT false,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert plans
INSERT INTO public.enostics_subscription_plans (
  plan_id, name, description, price_monthly, price_yearly,
  max_endpoints, max_requests_per_month, max_api_keys,
  has_ai_insights, has_custom_webhooks, has_advanced_analytics,
  has_team_management, has_priority_support
) VALUES 
  ('citizen', 'Citizen', 'Perfect for personal data management', 0, 0, 1, 1000, 3, false, false, false, false, false),
  ('developer', 'Developer', 'For developers building on Enostics', 2900, 29000, 5, 50000, 10, true, true, true, false, true),
  ('business', 'Business', 'For teams and organizations', 9900, 99000, -1, 500000, -1, true, true, true, true, true)
ON CONFLICT (plan_id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  updated_at = NOW();

-- ==============================================================================
-- STEP 2: PROFILES TABLE (Main Profile Table)
-- ==============================================================================

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
  job_title TEXT,
  company TEXT,
  industry TEXT,
  profile_emoji TEXT DEFAULT '👤',
  interests TEXT[],
  expertise TEXT[],
  current_plan VARCHAR(50) DEFAULT 'citizen',
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- STEP 3: USER_PROFILES TABLE (Backward Compatibility)
-- ==============================================================================

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

-- ==============================================================================
-- STEP 4: OTHER CORE TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enostics_user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_month_requests INTEGER DEFAULT 0,
  current_month_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_subscription UNIQUE (user_id),
  CONSTRAINT valid_status CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly'))
);

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
-- STEP 5: ADD FOREIGN KEY CONSTRAINTS (After All Tables Exist)
-- ==============================================================================

-- Add foreign key constraints only if they don't exist
DO $$ 
BEGIN
  -- profiles.current_plan -> enostics_subscription_plans.plan_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_current_plan_fkey' 
    AND table_name = 'profiles'
  ) THEN
    -- First check if current_plan column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'current_plan' 
      AND table_schema = 'public'
    ) THEN
      ALTER TABLE public.profiles 
      ADD CONSTRAINT profiles_current_plan_fkey 
      FOREIGN KEY (current_plan) REFERENCES public.enostics_subscription_plans(plan_id);
      RAISE NOTICE 'Added profiles current_plan foreign key';
    ELSE
      RAISE NOTICE 'current_plan column does not exist in profiles table';
    END IF;
  END IF;

  -- user_profiles.current_plan -> enostics_subscription_plans.plan_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_current_plan_fkey'
    AND table_name = 'user_profiles'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name = 'current_plan' 
      AND table_schema = 'public'
    ) THEN
      ALTER TABLE public.user_profiles 
      ADD CONSTRAINT user_profiles_current_plan_fkey 
      FOREIGN KEY (current_plan) REFERENCES public.enostics_subscription_plans(plan_id);
      RAISE NOTICE 'Added user_profiles current_plan foreign key';
    END IF;
  END IF;

  -- enostics_user_subscriptions.plan_id -> enostics_subscription_plans.plan_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'enostics_user_subscriptions_plan_id_fkey'
    AND table_name = 'enostics_user_subscriptions'
  ) THEN
    ALTER TABLE public.enostics_user_subscriptions 
    ADD CONSTRAINT enostics_user_subscriptions_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES public.enostics_subscription_plans(plan_id);
    RAISE NOTICE 'Added subscriptions plan_id foreign key';
  END IF;
END $$;

-- ==============================================================================
-- STEP 6: SIGNUP TRIGGER FUNCTION
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
    -- Extract signup data
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
    
    -- Validate plan exists
    IF NOT EXISTS (SELECT 1 FROM public.enostics_subscription_plans WHERE plan_id = selected_plan_value AND is_active = true) THEN
        selected_plan_value := 'citizen';
    END IF;
    
    -- Get plan limits
    SELECT * INTO plan_limits FROM public.enostics_subscription_plans WHERE plan_id = selected_plan_value;
    
    -- Create URL path
    url_path_value := LOWER(REGEXP_REPLACE(COALESCE(username_value, 'user'), '[^a-zA-Z0-9]', '', 'g'));
    IF url_path_value = '' OR url_path_value IS NULL THEN
        url_path_value := 'user' || EXTRACT(EPOCH FROM NOW())::INTEGER;
    END IF;
    
    -- Make username unique
    counter := 0;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_value) OR 
          EXISTS (SELECT 1 FROM public.user_profiles WHERE username = username_value) LOOP
        counter := counter + 1;
        username_value := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)) || counter::TEXT;
        IF counter > 100 THEN EXIT; END IF;
    END LOOP;
    
    -- 1. Create profiles record
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
    
    -- 2. Create user_profiles record
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
    
    -- 4. Initialize usage metrics
    INSERT INTO public.enostics_usage_metrics (user_id, metric_type, current_count, limit_count) VALUES
        (NEW.id, 'api_requests', 0, plan_limits.max_requests_per_month),
        (NEW.id, 'endpoints', 0, plan_limits.max_endpoints),
        (NEW.id, 'storage_mb', 0, plan_limits.max_storage_gb * 1024),
        (NEW.id, 'api_keys', 0, plan_limits.max_api_keys);
    
    -- 5. Create default endpoint (only if none exist)
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
                EXIT;
            EXCEPTION WHEN unique_violation THEN
                counter := counter + 1;
                IF counter > 100 THEN
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
    RAISE WARNING 'Error in handle_new_user_signup trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- ==============================================================================
-- STEP 7: HELPER FUNCTIONS
-- ==============================================================================

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

CREATE OR REPLACE FUNCTION public.increment_user_usage(
    user_uuid UUID,
    metric_type_param VARCHAR(50),
    increment_by INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    current_period_start DATE := CURRENT_DATE;
BEGIN
    INSERT INTO public.enostics_usage_metrics (user_id, metric_type, current_count, period_start, period_end)
    VALUES (user_uuid, metric_type_param, increment_by, current_period_start, current_period_start + INTERVAL '1 month')
    ON CONFLICT (user_id, metric_type, period_start)
    DO UPDATE SET 
        current_count = enostics_usage_metrics.current_count + increment_by,
        updated_at = NOW();
    
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
-- STEP 8: ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE public.enostics_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
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

-- Create policies
CREATE POLICY "Anyone can view active subscription plans" ON public.enostics_subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own user profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own user profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage user profiles" ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "Users can view their own subscription" ON public.enostics_user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage subscriptions" ON public.enostics_user_subscriptions FOR ALL USING (true);
CREATE POLICY "Users can view their own usage" ON public.enostics_usage_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can track usage" ON public.enostics_usage_metrics FOR ALL USING (true);
CREATE POLICY "Users can manage their own API keys" ON public.enostics_api_keys FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- STEP 9: INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_current_plan ON public.profiles(current_plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.enostics_user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.enostics_user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON public.enostics_usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_type ON public.enostics_usage_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.enostics_api_keys(user_id);

-- ==============================================================================
-- STEP 10: VERIFICATION
-- ==============================================================================

DO $$
DECLARE
    table_count INTEGER;
    plan_count INTEGER;
    function_count INTEGER;
    endpoint_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('enostics_subscription_plans', 'profiles', 'user_profiles', 'enostics_user_subscriptions', 'enostics_usage_metrics', 'enostics_api_keys');
    
    -- Count plans
    SELECT COUNT(*) INTO plan_count FROM public.enostics_subscription_plans;
    
    -- Count functions
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('get_user_plan_limits', 'get_user_plan_info', 'increment_user_usage');
    
    -- Count existing endpoints
    SELECT COUNT(*) INTO endpoint_count FROM public.enostics_endpoints;
    
    RAISE NOTICE '✅ PHASE 1 DEPLOYMENT COMPLETE!';
    RAISE NOTICE '📊 Tables created: % / 6', table_count;
    RAISE NOTICE '🎯 Subscription plans: %', plan_count;
    RAISE NOTICE '⚙️ Helper functions: % / 3', function_count;
    RAISE NOTICE '🔗 Existing endpoints: %', endpoint_count;
    RAISE NOTICE '🚀 Ready for user registration testing!';
END $$; 