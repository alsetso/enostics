-- ============================================
-- Test Migration Script
-- ============================================
-- Run this first to verify the migration will work

-- Check current table structures
SELECT 'profiles columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'user_settings columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'onboarding columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'onboarding' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check data counts
SELECT 'Data counts:' as info;
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'user_settings' as table_name, COUNT(*) as count FROM user_settings
UNION ALL
SELECT 'onboarding' as table_name, COUNT(*) as count FROM onboarding;

-- Test if columns exist before migration
SELECT 'Testing column existence:' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'email'
        ) THEN 'profiles.email exists'
        ELSE 'profiles.email does NOT exist - will be added'
    END as email_status;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'theme'
        ) THEN 'profiles.theme exists'
        ELSE 'profiles.theme does NOT exist - will be added'
    END as theme_status;

-- Check if there are any users with settings to migrate
SELECT 'Users with settings to migrate:' as info;
SELECT COUNT(*) as users_with_settings
FROM profiles p
INNER JOIN user_settings us ON p.id = us.user_id;

-- Check if there are any users with onboarding data
SELECT 'Users with onboarding data:' as info;
SELECT COUNT(*) as users_with_onboarding
FROM profiles p
INNER JOIN onboarding o ON p.id = o.user_id; 