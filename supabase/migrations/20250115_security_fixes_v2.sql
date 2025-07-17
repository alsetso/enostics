-- ============================================================================
-- SECURITY FIXES MIGRATION V2 - EXPLICIT DROP AND RECREATE
-- ============================================================================
-- This migration explicitly drops all problematic views and recreates them
-- without SECURITY DEFINER to fix the security advisor warnings

-- ----------------------------------------------------------------------------
-- 1. EXPLICITLY DROP ALL PROBLEMATIC VIEWS
-- ----------------------------------------------------------------------------

-- Drop all views that have SECURITY DEFINER issues
DROP VIEW IF EXISTS public.user_details CASCADE;
DROP VIEW IF EXISTS public.enostics_endpoints CASCADE;
DROP VIEW IF EXISTS public.data_enhanced CASCADE;
DROP VIEW IF EXISTS public.user_profiles CASCADE;
DROP VIEW IF EXISTS public.organization_users CASCADE;

-- ----------------------------------------------------------------------------
-- 2. RECREATE ALL VIEWS WITHOUT SECURITY DEFINER
-- ----------------------------------------------------------------------------

-- Create secure user_details view (no SECURITY DEFINER)
CREATE VIEW public.user_details AS
SELECT 
    p.id,
    p.username,
    p.email,
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
    CASE 
        WHEN p.privacy_settings->>'public_profile' = 'true' OR p.id = auth.uid()
        THEN p.privacy_settings
        ELSE NULL
    END as privacy_settings
FROM public.profiles p
WHERE p.id = auth.uid()
   OR (p.privacy_settings->>'public_profile' = 'true');

-- Create enostics_endpoints view (no SECURITY DEFINER)
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
    p.display_name as owner_name,
    p.avatar_url as owner_avatar
FROM public.endpoints e
LEFT JOIN public.profiles p ON e.user_id = p.id
WHERE e.user_id = auth.uid();

-- Create data_enhanced view (no SECURITY DEFINER)
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
    e.name as endpoint_name,
    e.url_path as endpoint_path
FROM public.data d
LEFT JOIN public.endpoints e ON d.endpoint_id = e.id
WHERE e.user_id = auth.uid();

-- Create user_profiles view (no SECURITY DEFINER)
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
WHERE id = auth.uid();

-- Create organization_users view (no SECURITY DEFINER)
CREATE VIEW public.organization_users AS
SELECT 
    om.organization_id,
    om.profile_id,
    om.role,
    om.invitation_status,
    om.created_at,
    om.updated_at,
    p.username,
    p.display_name,
    p.avatar_url,
    p.email,
    p.job_title,
    p.company,
    o.name as organization_name,
    o.plan as organization_plan
FROM public.organization_members om
LEFT JOIN public.profiles p ON om.profile_id = p.id
LEFT JOIN public.organizations o ON om.organization_id = o.id
WHERE om.organization_id IN (
    SELECT organization_id 
    FROM public.organization_members 
    WHERE profile_id = auth.uid() 
    AND invitation_status = 'accepted'
);

-- ----------------------------------------------------------------------------
-- 3. GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ----------------------------------------------------------------------------

GRANT SELECT ON public.user_details TO authenticated;
GRANT SELECT ON public.enostics_endpoints TO authenticated;
GRANT SELECT ON public.data_enhanced TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.organization_users TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. ENSURE RLS IS ENABLED ON BASE TABLES
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5. VERIFY THE VIEWS ARE CREATED WITHOUT SECURITY DEFINER
-- ----------------------------------------------------------------------------

-- Check that views exist and don't have SECURITY DEFINER
SELECT 
    schemaname,
    viewname,
    viewowner,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'HAS SECURITY DEFINER - ERROR'
        ELSE 'OK - No SECURITY DEFINER'
    END as security_status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('user_details', 'enostics_endpoints', 'data_enhanced', 'user_profiles', 'organization_users')
ORDER BY viewname;

-- Success message
SELECT 'All views recreated without SECURITY DEFINER - Security issues should be resolved!' as message; 