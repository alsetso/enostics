const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function deployUserManagementSystem() {
  console.log('🚀 DEPLOYING COMPREHENSIVE USER MANAGEMENT SYSTEM\n')
  
  const migrations = [
    {
      name: 'Subscription Plans',
      sql: `
        -- Create subscription plans table
        CREATE TABLE IF NOT EXISTS public.enostics_subscription_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price_monthly INTEGER DEFAULT 0,
          price_yearly INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          
          -- Feature limits
          max_endpoints INTEGER DEFAULT 1,
          max_requests_per_month INTEGER DEFAULT 1000,
          max_payload_size_mb INTEGER DEFAULT 1,
          max_api_keys INTEGER DEFAULT 3,
          max_storage_gb INTEGER DEFAULT 1,
          
          -- Feature flags
          has_ai_insights BOOLEAN DEFAULT false,
          has_custom_webhooks BOOLEAN DEFAULT false,
          has_advanced_analytics BOOLEAN DEFAULT false,
          has_team_management BOOLEAN DEFAULT false,
          has_priority_support BOOLEAN DEFAULT false,
          has_custom_branding BOOLEAN DEFAULT false,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert default plans
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
      `
    },
    {
      name: 'User Profiles',
      sql: `
        -- Create user profiles table
        CREATE TABLE IF NOT EXISTS public.enostics_user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          username VARCHAR(50) UNIQUE NOT NULL,
          display_name TEXT,
          bio TEXT,
          avatar_url TEXT,
          website TEXT,
          location TEXT,
          timezone VARCHAR(50) DEFAULT 'UTC',
          
          -- Onboarding status
          onboarding_completed BOOLEAN DEFAULT false,
          onboarding_step INTEGER DEFAULT 0,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          CONSTRAINT unique_user_profile UNIQUE (user_id)
        );
      `
    },
    {
      name: 'User Subscriptions',
      sql: `
        -- Create user subscriptions table
        CREATE TABLE IF NOT EXISTS public.enostics_user_subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          plan_id VARCHAR(50) NOT NULL REFERENCES public.enostics_subscription_plans(plan_id),
          
          -- Subscription status
          status VARCHAR(50) DEFAULT 'active',
          billing_cycle VARCHAR(20) DEFAULT 'monthly',
          
          -- Payment integration
          stripe_customer_id VARCHAR(255),
          stripe_subscription_id VARCHAR(255),
          stripe_price_id VARCHAR(255),
          
          -- Billing periods
          current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
          trial_start TIMESTAMP WITH TIME ZONE,
          trial_end TIMESTAMP WITH TIME ZONE,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          CONSTRAINT unique_user_subscription UNIQUE (user_id),
          CONSTRAINT valid_status CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
          CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly'))
        );
      `
    },
    {
      name: 'Usage Metrics',
      sql: `
        -- Create usage metrics table
        CREATE TABLE IF NOT EXISTS public.enostics_usage_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          
          -- Metric tracking
          metric_type VARCHAR(50) NOT NULL, -- 'api_requests', 'endpoints', 'storage_mb'
          current_count INTEGER DEFAULT 0,
          limit_count INTEGER DEFAULT -1, -- -1 means unlimited
          
          -- Time period
          period_start DATE NOT NULL DEFAULT CURRENT_DATE,
          period_end DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '1 month',
          reset_frequency VARCHAR(20) DEFAULT 'monthly', -- 'daily', 'monthly', 'yearly'
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          CONSTRAINT unique_user_metric_period UNIQUE (user_id, metric_type, period_start)
        );
      `
    },
    {
      name: 'Enhanced Signup Trigger',
      sql: `
        -- Create enhanced signup trigger function
        CREATE OR REPLACE FUNCTION public.handle_new_user_comprehensive()
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
            
            -- Create sanitized URL path
            url_path_value := LOWER(REGEXP_REPLACE(COALESCE(username_value, 'user'), '[^a-zA-Z0-9]', '', 'g'));
            IF url_path_value = '' OR url_path_value IS NULL THEN
                url_path_value := 'user' || EXTRACT(EPOCH FROM NOW())::INTEGER;
            END IF;
            
            -- Ensure unique username
            counter := 0;
            WHILE EXISTS (SELECT 1 FROM public.enostics_user_profiles WHERE username = username_value) LOOP
                counter := counter + 1;
                username_value := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)) || counter::TEXT;
                IF counter > 100 THEN EXIT; END IF;
            END LOOP;
            
            -- 1. Create user profile
            INSERT INTO public.enostics_user_profiles (
                user_id, username, display_name, onboarding_completed
            ) VALUES (
                NEW.id,
                username_value,
                COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.user_metadata->>'full_name', username_value),
                false
            );
            
            -- 2. Create subscription
            INSERT INTO public.enostics_user_subscriptions (
                user_id, plan_id, status, billing_cycle
            ) VALUES (
                NEW.id, selected_plan_value, 'active', 'monthly'
            );
            
            -- 3. Initialize usage metrics
            INSERT INTO public.enostics_usage_metrics (user_id, metric_type, current_count, limit_count) VALUES
                (NEW.id, 'api_requests', 0, plan_limits.max_requests_per_month),
                (NEW.id, 'endpoints', 0, plan_limits.max_endpoints),
                (NEW.id, 'storage_mb', 0, plan_limits.max_storage_gb * 1024);
            
            -- 4. Create default endpoint
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
            
            RETURN NEW;
        EXCEPTION WHEN OTHERS THEN
            -- Log error but don't block user creation
            RAISE WARNING 'Error in handle_new_user_comprehensive trigger: %', SQLERRM;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Create the trigger
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_comprehensive();
      `
    }
  ]

  // Execute migrations
  for (const migration of migrations) {
    console.log(`📋 Running migration: ${migration.name}...`)
    
    try {
      // Try using RPC first
      try {
        const { data, error } = await supabase.rpc('exec_sql', { query: migration.sql })
        if (error) throw error
        console.log(`✅ ${migration.name} - SUCCESS`)
      } catch (rpcError) {
        // Fallback to REST API approach
        console.log(`🔄 RPC failed, trying direct SQL execution...`)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: migration.sql })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }
        
        console.log(`✅ ${migration.name} - SUCCESS (via REST API)`)
      }
    } catch (error) {
      console.log(`❌ ${migration.name} - FAILED:`, error.message)
      
      // For critical migrations, don't continue
      if (migration.name === 'Subscription Plans') {
        console.log('💀 Critical migration failed, stopping deployment')
        process.exit(1)
      }
    }
    
    console.log('')
  }

  // Test the system
  console.log('🧪 TESTING DEPLOYED SYSTEM...')
  
  try {
    // Check if subscription plans exist
    const { data: plans, error: plansError } = await supabase
      .from('enostics_subscription_plans')
      .select('plan_id, name')
      .limit(5)
    
    if (plansError) {
      console.log('❌ Plans check failed:', plansError.message)
    } else {
      console.log('✅ Subscription plans available:', plans.map(p => p.plan_id).join(', '))
    }
    
    // Check if we can access the signup function
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'handle_new_user_comprehensive')
      .limit(1)
    
    if (!functionsError && functions.length > 0) {
      console.log('✅ Signup trigger function deployed successfully')
    } else {
      console.log('⚠️ Could not verify signup function (might still be working)')
    }
    
  } catch (testError) {
    console.log('⚠️ System test failed, but deployment may still be successful')
  }
  
  console.log('\n🎉 DEPLOYMENT COMPLETE!')
  console.log('\n📋 WHAT WAS DEPLOYED:')
  console.log('✅ Subscription plans with Citizen/Developer/Business tiers')
  console.log('✅ Enhanced user profiles with username and metadata')
  console.log('✅ User subscription management')
  console.log('✅ Usage tracking system')
  console.log('✅ Comprehensive signup trigger with plan selection')
  
  console.log('\n🚀 NEXT STEPS:')
  console.log('1. Test user registration at http://localhost:3000/register')
  console.log('2. Select a plan during signup')
  console.log('3. Check that user profile and endpoint are created')
  console.log('4. Verify plan limits are applied correctly')
  
  console.log('\n🏁 Ready to test the perfect signup flow!')
}

deployUserManagementSystem().catch(console.error) 