-- ============================================
-- User Table Consolidation Migration Script
-- ============================================
-- This script consolidates user data from multiple tables into a single 'profiles' table
-- Tables to consolidate: profiles, user_settings, onboarding
-- Goal: auth.users + profiles (single comprehensive table)

-- Step 1: Add new columns to profiles table for consolidation
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(50) DEFAULT 'citizen',
ADD COLUMN IF NOT EXISTS subscription_id UUID,
ADD COLUMN IF NOT EXISTS organization_id UUID,
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ui_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP;

-- Step 2: Populate email from auth.users
UPDATE profiles 
SET email = auth.users.email
FROM auth.users 
WHERE profiles.id = auth.users.id;

-- Step 3: Migrate data from onboarding table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'onboarding') THEN
        UPDATE profiles SET 
            onboarding_steps = COALESCE(onboarding.steps, '{}'),
            onboarding_completed_at = onboarding.completed_at
        FROM onboarding 
        WHERE profiles.id = onboarding.user_id;
    END IF;
END $$;

-- Step 4: Migrate data from user_settings table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        UPDATE profiles SET 
            preferences = COALESCE(profiles.preferences, '{}') || COALESCE(user_settings.preferences, '{}'),
            notification_settings = COALESCE(user_settings.notification_settings, '{}'),
            privacy_settings = COALESCE(user_settings.privacy_settings, '{}'),
            ui_settings = COALESCE(user_settings.ui_settings, '{}')
        FROM user_settings 
        WHERE profiles.id = user_settings.user_id;
    END IF;
END $$;

-- Step 5: Set default values for new columns
UPDATE profiles 
SET 
    notification_settings = COALESCE(notification_settings, '{"email_notifications": true, "endpoint_alerts": true, "usage_alerts": true, "security_alerts": true}'),
    privacy_settings = COALESCE(privacy_settings, '{"public_profile": false, "show_email": false}'),
    ui_settings = COALESCE(ui_settings, '{"theme": "dark", "sidebar_collapsed": false}'),
    onboarding_completed_at = CASE 
        WHEN onboarding_completed = true AND onboarding_completed_at IS NULL 
        THEN updated_at 
        ELSE onboarding_completed_at 
    END,
    profile_completed_at = CASE 
        WHEN full_name IS NOT NULL AND display_name IS NOT NULL 
        THEN updated_at 
        ELSE NULL 
    END
WHERE 
    notification_settings IS NULL 
    OR privacy_settings IS NULL 
    OR ui_settings IS NULL 
    OR (onboarding_completed = true AND onboarding_completed_at IS NULL);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_tier ON profiles(plan_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);

-- Step 7: Drop redundant tables (commented out for safety - run manually after verification)
-- DROP TABLE IF EXISTS onboarding;
-- DROP TABLE IF EXISTS user_settings;

-- Step 8: Create a view for backward compatibility (temporary)
CREATE OR REPLACE VIEW user_profiles AS 
SELECT 
    id,
    username,
    email,
    full_name,
    display_name,
    avatar_url,
    bio,
    location,
    timezone,
    job_title,
    company,
    industry,
    phone,
    preferences,
    notification_settings,
    privacy_settings,
    ui_settings,
    onboarding_completed,
    onboarding_steps,
    plan_tier,
    created_at,
    updated_at,
    last_active_at
FROM profiles;

-- Step 9: Add helpful comments
COMMENT ON TABLE profiles IS 'Consolidated user profile table containing all user data';
COMMENT ON COLUMN profiles.email IS 'Mirrored from auth.users for easy access';
COMMENT ON COLUMN profiles.preferences IS 'General user preferences and settings';
COMMENT ON COLUMN profiles.notification_settings IS 'Email, push, and other notification preferences';
COMMENT ON COLUMN profiles.privacy_settings IS 'Privacy and visibility settings';
COMMENT ON COLUMN profiles.ui_settings IS 'UI theme and layout preferences';
COMMENT ON COLUMN profiles.onboarding_steps IS 'Progress tracking for onboarding wizard';
COMMENT ON COLUMN profiles.plan_tier IS 'User subscription tier: citizen, developer, business';

-- Verification queries (run these to check the migration)
-- SELECT COUNT(*) as total_profiles FROM profiles;
-- SELECT COUNT(*) as completed_onboarding FROM profiles WHERE onboarding_completed = true;
-- SELECT COUNT(*) as has_notification_settings FROM profiles WHERE notification_settings IS NOT NULL;
-- SELECT plan_tier, COUNT(*) FROM profiles GROUP BY plan_tier; 