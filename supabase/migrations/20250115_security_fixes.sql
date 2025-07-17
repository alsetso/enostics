-- ============================================================================
-- SECURITY FIXES MIGRATION
-- ============================================================================
-- This migration addresses critical security issues identified by Supabase:
-- 1. auth_users_exposed - user_details view exposing auth.users data
-- 2. security_definer_view - multiple views using SECURITY DEFINER

-- ----------------------------------------------------------------------------
-- 1. Fix auth_users_exposed: Remove/recreate user_details view safely
-- ----------------------------------------------------------------------------

-- Drop the problematic user_details view if it exists
DROP VIEW IF EXISTS public.user_details;

-- Create a secure user_details view that doesn't expose auth.users directly
-- This view only shows profile data that the user should have access to
CREATE VIEW public.user_details AS
SELECT 
    p.id,
    p.username,
    p.email,  -- Already mirrored from auth.users in profiles table
    p.full_name,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.timezone,
    p.job_title,
    p.company,
    p.industry,
    p.phone,
    p.plan_tier,
    p.organization_id,
    p.created_at,
    p.updated_at,
    p.last_active_at,
    p.profile_completed_at,
    p.onboarding_completed,
    -- Only show privacy settings that user should see
    CASE 
        WHEN p.privacy_settings->>'public_profile' = 'true' OR p.id = auth.uid()
        THEN p.privacy_settings
        ELSE NULL
    END as privacy_settings
FROM public.profiles p
WHERE p.id = auth.uid()  -- Only show current user's details
   OR (p.privacy_settings->>'public_profile' = 'true');  -- Or public profiles

-- Grant appropriate permissions
GRANT SELECT ON public.user_details TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. Fix security_definer_view: Remove SECURITY DEFINER from all views
-- ----------------------------------------------------------------------------

-- Drop all problematic views with SECURITY DEFINER
DROP VIEW IF EXISTS public.enostics_endpoints;
DROP VIEW IF EXISTS public.data_enhanced;
DROP VIEW IF EXISTS public.user_profiles;
DROP VIEW IF EXISTS public.organization_users;

-- Recreate enostics_endpoints view without SECURITY DEFINER
CREATE VIEW public.enostics_endpoints AS
SELECT 
    e.id,
    e.name,
    e.url_path,
    e.user_id,
    e.is_active,
    e.created_at,
    e.updated_at,
    e.description,
    e.settings,
    -- Include user profile info for context
    p.display_name as owner_name,
    p.avatar_url as owner_avatar
FROM public.endpoints e
LEFT JOIN public.profiles p ON e.user_id = p.id
WHERE e.user_id = auth.uid();  -- Only show user's own endpoints

-- Grant appropriate permissions
GRANT SELECT ON public.enostics_endpoints TO authenticated;

-- Recreate data_enhanced view without SECURITY DEFINER
CREATE VIEW public.data_enhanced AS
SELECT 
    d.id,
    d.endpoint_id,
    d.created_at,
    d.updated_at,
    d.is_read,
    d.is_starred,
    d.subject,
    d.preview,
    d.source,
    d.type,
    -- Include endpoint info for context
    e.name as endpoint_name,
    e.url_path as endpoint_path
FROM public.data d
LEFT JOIN public.endpoints e ON d.endpoint_id = e.id
WHERE e.user_id = auth.uid();  -- Only show data for user's endpoints

-- Grant appropriate permissions
GRANT SELECT ON public.data_enhanced TO authenticated;

-- Recreate user_profiles view without SECURITY DEFINER (backward compatibility)
CREATE VIEW public.user_profiles AS
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
    created_at,
    updated_at,
    last_active_at,
    profile_completed_at
FROM public.profiles
WHERE id = auth.uid();  -- Only show current user's profile

-- Grant appropriate permissions
GRANT SELECT ON public.user_profiles TO authenticated;

-- Recreate organization_users view without SECURITY DEFINER
CREATE VIEW public.organization_users AS
SELECT 
    om.organization_id,
    om.profile_id,
    om.role,
    om.invitation_status,
    om.created_at,
    om.updated_at,
    -- Include profile info for context
    p.username,
    p.display_name,
    p.avatar_url,
    p.email,
    p.job_title,
    p.company,
    -- Include organization info
    o.name as organization_name,
    o.plan as organization_plan
FROM public.organization_members om
LEFT JOIN public.profiles p ON om.profile_id = p.id
LEFT JOIN public.organizations o ON om.organization_id = o.id
WHERE om.organization_id IN (
    -- Only show organization users if current user is a member
    SELECT organization_id 
    FROM public.organization_members 
    WHERE profile_id = auth.uid() 
    AND invitation_status = 'accepted'
);

-- Grant appropriate permissions
GRANT SELECT ON public.organization_users TO authenticated;

-- ----------------------------------------------------------------------------
-- 3. Ensure proper RLS policies exist for all related tables
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create or update RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can view public profiles"
    ON public.profiles FOR SELECT
    USING (privacy_settings->>'public_profile' = 'true');

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- Create or update RLS policies for endpoints
DROP POLICY IF EXISTS "Users can manage their own endpoints" ON public.endpoints;

CREATE POLICY "Users can manage their own endpoints"
    ON public.endpoints FOR ALL
    USING (user_id = auth.uid());

-- Create or update RLS policies for data
DROP POLICY IF EXISTS "Users can manage data for their endpoints" ON public.data;

CREATE POLICY "Users can manage data for their endpoints"
    ON public.data FOR ALL
    USING (
        endpoint_id IN (
            SELECT id FROM public.endpoints WHERE user_id = auth.uid()
        )
    );

-- Create or update RLS policies for organization_members
DROP POLICY IF EXISTS "Users can view organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can manage their organization membership" ON public.organization_members;

CREATE POLICY "Users can view organization members"
    ON public.organization_members FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM public.organization_members 
            WHERE profile_id = auth.uid() 
            AND invitation_status = 'accepted'
        )
    );

CREATE POLICY "Users can manage their organization membership"
    ON public.organization_members FOR ALL
    USING (profile_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4. Add helpful comments and documentation
-- ----------------------------------------------------------------------------

COMMENT ON VIEW public.user_details IS 'Secure user details view - only shows current user or public profiles';
COMMENT ON VIEW public.enostics_endpoints IS 'User endpoints view - only shows endpoints owned by current user';
COMMENT ON VIEW public.data_enhanced IS 'Enhanced data view with endpoint context - only shows data for user endpoints';
COMMENT ON VIEW public.user_profiles IS 'Backward compatibility view for user profiles - only shows current user';
COMMENT ON VIEW public.organization_users IS 'Organization users view - only shows users from organizations the current user belongs to';

-- ----------------------------------------------------------------------------
-- 5. Verification queries
-- ----------------------------------------------------------------------------

-- Verify views exist and are accessible
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('user_details', 'enostics_endpoints', 'data_enhanced', 'user_profiles', 'organization_users');

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'endpoints', 'data', 'organizations', 'organization_members');

-- Test that views return data only for current user
-- (These should only return data when run by authenticated users)
SELECT 'user_details' as view_name, COUNT(*) as row_count FROM public.user_details
UNION ALL
SELECT 'enostics_endpoints' as view_name, COUNT(*) as row_count FROM public.enostics_endpoints
UNION ALL
SELECT 'data_enhanced' as view_name, COUNT(*) as row_count FROM public.data_enhanced
UNION ALL
SELECT 'user_profiles' as view_name, COUNT(*) as row_count FROM public.user_profiles
UNION ALL
SELECT 'organization_users' as view_name, COUNT(*) as row_count FROM public.organization_users;

-- Success message
SELECT 'Security fixes applied successfully!' as message; 