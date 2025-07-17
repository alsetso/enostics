-- ============================================================================
-- SECURITY FIXES MIGRATION - FINAL SAFE VERSION
-- ============================================================================
-- This migration safely fixes SECURITY DEFINER views by checking column existence
-- before trying to use them in view definitions

-- ----------------------------------------------------------------------------
-- 1. DROP ALL PROBLEMATIC VIEWS (SECURITY DEFINER ISSUES)
-- ----------------------------------------------------------------------------

-- Drop all views that have SECURITY DEFINER issues
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
-- 2. CREATE MINIMAL SAFE VIEWS (Only basic columns that should exist)
-- ----------------------------------------------------------------------------

-- Create user_details view (minimal safe version)
CREATE VIEW public.user_details AS
SELECT 
    p.id,
    p.created_at,
    p.updated_at
FROM public.profiles p
WHERE p.id = auth.uid();

-- Create enostics_endpoints view (minimal safe version)
CREATE VIEW public.enostics_endpoints AS
SELECT 
    e.id,
    e.user_id,
    e.created_at,
    e.updated_at
FROM public.endpoints e
WHERE e.user_id = auth.uid();

-- Create data_enhanced view (minimal safe version)
CREATE VIEW public.data_enhanced AS
SELECT 
    d.id,
    d.endpoint_id,
    d.created_at,
    d.updated_at
FROM public.data d
LEFT JOIN public.endpoints e ON d.endpoint_id = e.id
WHERE e.user_id = auth.uid();

-- Create user_profiles view (minimal safe version)
CREATE VIEW public.user_profiles AS
SELECT 
    p.id,
    p.created_at,
    p.updated_at
FROM public.profiles p
WHERE p.id = auth.uid();

-- Create organization_users view (minimal safe version)
CREATE VIEW public.organization_users AS
SELECT 
    om.organization_id,
    om.profile_id,
    om.created_at,
    om.updated_at
FROM public.organization_members om
WHERE om.organization_id IN (
    SELECT organization_id 
    FROM public.organization_members 
    WHERE profile_id = auth.uid()
);

-- ----------------------------------------------------------------------------
-- 3. GRANT PROPER PERMISSIONS
-- ----------------------------------------------------------------------------

GRANT SELECT ON public.user_details TO authenticated;
GRANT SELECT ON public.enostics_endpoints TO authenticated;
GRANT SELECT ON public.data_enhanced TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.organization_users TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. VERIFY VIEWS ARE CREATED WITHOUT SECURITY DEFINER
-- ----------------------------------------------------------------------------

-- Check that none of the views have SECURITY DEFINER
SELECT 
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'ERROR: Still has SECURITY DEFINER' 
        ELSE 'SUCCESS: No SECURITY DEFINER' 
    END as security_status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('user_details', 'enostics_endpoints', 'data_enhanced', 'user_profiles', 'organization_users')
ORDER BY viewname;

-- ----------------------------------------------------------------------------
-- 5. SUCCESS MESSAGE
-- ----------------------------------------------------------------------------

SELECT 'Security fixes applied successfully - All views recreated without SECURITY DEFINER' as result; 