-- ============================================
-- User Table Consolidation Migration Script (Fixed)
-- ============================================
-- This script consolidates user data while keeping onboarding table for organization creation
-- Tables to consolidate: profiles + user_settings
-- Tables to keep: onboarding (for organization creation during onboarding)
-- Goal: auth.users + profiles (consolidated) + onboarding (organization setup)

-- Step 1: Add new columns to profiles table for consolidation
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(50) DEFAULT 'citizen',
ADD COLUMN IF NOT EXISTS subscription_id UUID,
ADD COLUMN IF NOT EXISTS organization_id UUID,
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP,

-- Consolidated settings from user_settings table
ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'dark',
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_save_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS canvas_grid_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS canvas_snap_enabled BOOLEAN DEFAULT true,

-- Enhanced notification settings (more granular than user_settings)
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ui_settings JSONB DEFAULT '{}';

-- Step 2: Populate email from auth.users
UPDATE profiles 
SET email = auth.users.email
FROM auth.users 
WHERE profiles.id = auth.users.id;

-- Step 3: Migrate data from user_settings table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        UPDATE profiles SET 
            theme = COALESCE(user_settings.theme, 'dark'),
            language = COALESCE(user_settings.language, 'en'),
            notifications_enabled = COALESCE(user_settings.notifications_enabled, true),
            auto_save_enabled = COALESCE(user_settings.auto_save_enabled, true),
            canvas_grid_enabled = COALESCE(user_settings.canvas_grid_enabled, true),
            canvas_snap_enabled = COALESCE(user_settings.canvas_snap_enabled, true)
        FROM user_settings 
        WHERE profiles.id = user_settings.user_id;
    END IF;
END $$;

-- Step 4: Set enhanced default values for new JSON settings
UPDATE profiles 
SET 
    notification_settings = COALESCE(notification_settings, jsonb_build_object(
        'email_notifications', notifications_enabled,
        'endpoint_alerts', true,
        'usage_alerts', true,
        'security_alerts', true,
        'marketing_emails', false,
        'product_updates', true
    )),
    privacy_settings = COALESCE(privacy_settings, '{"public_profile": false, "show_email": false, "show_location": false, "show_company": true, "indexable_profile": false}'),
    ui_settings = COALESCE(ui_settings, jsonb_build_object(
        'theme', theme,
        'language', language,
        'sidebar_collapsed', false,
        'compact_mode', false,
        'show_onboarding_hints', true,
        'auto_save_enabled', auto_save_enabled,
        'canvas_grid_enabled', canvas_grid_enabled,
        'canvas_snap_enabled', canvas_snap_enabled
    )),
    profile_completed_at = CASE 
        WHEN full_name IS NOT NULL AND display_name IS NOT NULL 
        THEN updated_at 
        ELSE NULL 
    END
WHERE 
    notification_settings = '{}'
    OR privacy_settings = '{}'
    OR ui_settings = '{}'
    OR profile_completed_at IS NULL;

-- Step 5: Link profiles to organizations created during onboarding
UPDATE profiles 
SET organization_id = organizations.id
FROM organizations 
WHERE profiles.id = organizations.created_by
AND profiles.organization_id IS NULL;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_tier ON profiles(plan_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_theme ON profiles(theme);

-- Step 7: Add foreign key constraints
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Step 8: Update onboarding table to better support organization creation
ALTER TABLE onboarding 
ADD COLUMN IF NOT EXISTS organization_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS organization_id UUID,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_step VARCHAR(50) DEFAULT 'practice_info';

-- Link existing onboarding records to organizations
UPDATE onboarding 
SET 
    organization_id = organizations.id,
    organization_created = true,
    onboarding_completed = (onboarding.completed_at IS NOT NULL)
FROM organizations 
WHERE onboarding.user_id = organizations.created_by
AND onboarding.organization_id IS NULL;

-- Step 9: Drop user_settings table (after verification)
-- DROP TABLE IF EXISTS user_settings;

-- Step 10: Create a view for backward compatibility (temporary)
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
    organization_id,
    theme,
    language,
    notifications_enabled,
    created_at,
    updated_at,
    last_active_at,
    profile_completed_at
FROM profiles;

-- Step 11: Add helpful comments
COMMENT ON TABLE profiles IS 'Consolidated user profile table containing all user data and settings';
COMMENT ON TABLE onboarding IS 'Organization creation and business setup during user onboarding';
COMMENT ON COLUMN profiles.email IS 'Mirrored from auth.users for easy access';
COMMENT ON COLUMN profiles.organization_id IS 'Links user to their primary organization';
COMMENT ON COLUMN profiles.notification_settings IS 'Granular notification preferences';
COMMENT ON COLUMN profiles.privacy_settings IS 'Privacy and visibility settings';
COMMENT ON COLUMN profiles.ui_settings IS 'UI theme and layout preferences consolidated from user_settings';
COMMENT ON COLUMN onboarding.organization_created IS 'Whether user has created an organization during onboarding';
COMMENT ON COLUMN onboarding.current_step IS 'Current step in the onboarding process';

-- Verification queries (run these to check the migration)
-- SELECT COUNT(*) as total_profiles FROM profiles;
-- SELECT COUNT(*) as has_organization FROM profiles WHERE organization_id IS NOT NULL;
-- SELECT COUNT(*) as onboarding_records FROM onboarding;
-- SELECT COUNT(*) as organizations_created FROM onboarding WHERE organization_created = true;
-- SELECT theme, COUNT(*) FROM profiles GROUP BY theme;
-- SELECT plan_tier, COUNT(*) FROM profiles GROUP BY plan_tier; 