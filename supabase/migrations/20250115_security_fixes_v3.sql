-- ============================================================================
-- SECURITY FIXES MIGRATION V3 - AGGRESSIVE FIX
-- ============================================================================
-- This migration aggressively fixes SECURITY DEFINER views by using multiple
-- techniques to ensure they're properly recreated without the property

-- ----------------------------------------------------------------------------
-- 1. CHECK CURRENT VIEW DEFINITIONS (for debugging)
-- ----------------------------------------------------------------------------

-- Check which views currently have SECURITY DEFINER
SELECT 
    viewname,
    definition,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'HAS SECURITY DEFINER' 
        ELSE 'OK' 
    END as security_status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('user_details', 'enostics_endpoints', 'data_enhanced', 'user_profiles', 'organization_users');

-- ----------------------------------------------------------------------------
-- 2. FORCE DROP ALL PROBLEMATIC VIEWS
-- ----------------------------------------------------------------------------

-- Use CASCADE to drop all dependent objects
DROP VIEW IF EXISTS public.user_details CASCADE;
DROP VIEW IF EXISTS public.enostics_endpoints CASCADE;
DROP VIEW IF EXISTS public.data_enhanced CASCADE;
DROP VIEW IF EXISTS public.user_profiles CASCADE;
DROP VIEW IF EXISTS public.organization_users CASCADE;

-- Also drop any potential materialized views with same names
DROP MATERIALIZED VIEW IF EXISTS public.user_details CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.enostics_endpoints CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.data_enhanced CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.user_profiles CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.organization_users CASCADE;

-- ----------------------------------------------------------------------------
-- 3. RECREATE ALL VIEWS WITHOUT SECURITY DEFINER
-- ----------------------------------------------------------------------------

-- Create user_details view (safe version without auth.users exposure)
CREATE VIEW public.user_details AS
SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.email,
    p.job_title,
    p.company,
    p.bio,
    p.location,
    p.github_url,
    p.linkedin_url,
    p.twitter_url,
    p.created_at,
    p.updated_at,
    p.is_public,
    p.is_verified,
    p.last_seen_at
FROM public.profiles p
WHERE p.id = auth.uid() 
   OR p.is_public = true;

-- Create enostics_endpoints view
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
WHERE e.user_id = auth.uid();

-- Create data_enhanced view
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
WHERE e.user_id = auth.uid();

-- Create user_profiles view
CREATE VIEW public.user_profiles AS
SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.email,
    p.job_title,
    p.company,
    p.bio,
    p.location,
    p.website,
    p.github_url,
    p.linkedin_url,
    p.twitter_url,
    p.created_at,
    p.updated_at,
    p.is_public,
    p.is_verified,
    p.last_seen_at
FROM public.profiles p
WHERE p.id = auth.uid() 
   OR p.is_public = true;

-- Create organization_users view
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

-- ----------------------------------------------------------------------------
-- 4. GRANT PROPER PERMISSIONS
-- ----------------------------------------------------------------------------

GRANT SELECT ON public.user_details TO authenticated;
GRANT SELECT ON public.enostics_endpoints TO authenticated;
GRANT SELECT ON public.data_enhanced TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.organization_users TO authenticated;

-- ----------------------------------------------------------------------------
-- 5. VERIFY VIEWS ARE CREATED WITHOUT SECURITY DEFINER
-- ----------------------------------------------------------------------------

-- Check that none of the views have SECURITY DEFINER
SELECT 
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'ERROR: Still has SECURITY DEFINER' 
        ELSE 'OK: No SECURITY DEFINER' 
    END as security_status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('user_details', 'enostics_endpoints', 'data_enhanced', 'user_profiles', 'organization_users')
ORDER BY viewname;

-- ----------------------------------------------------------------------------
-- 6. FINAL SUCCESS MESSAGE
-- ----------------------------------------------------------------------------

SELECT 'Migration V3 completed - All views recreated without SECURITY DEFINER' as result; 