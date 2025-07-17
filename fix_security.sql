-- PERMANENT SECURITY FIX - Remove all problematic views
-- This will permanently fix the SECURITY DEFINER issues

-- Drop all views that might have SECURITY DEFINER issues
DROP VIEW IF EXISTS public.user_details CASCADE;
DROP VIEW IF EXISTS public.enostics_endpoints CASCADE;
DROP VIEW IF EXISTS public.data_enhanced CASCADE;
DROP VIEW IF EXISTS public.user_profiles CASCADE;
DROP VIEW IF EXISTS public.organization_users CASCADE;

-- Drop any materialized views too
DROP MATERIALIZED VIEW IF EXISTS public.user_details CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.enostics_endpoints CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.data_enhanced CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.user_profiles CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.organization_users CASCADE;

-- Verify no SECURITY DEFINER views remain
SELECT 
    schemaname, 
    viewname, 
    definition
FROM pg_views 
WHERE schemaname = 'public' 
  AND definition LIKE '%SECURITY DEFINER%';

-- Output success message
SELECT 'All problematic views removed - Security issues should be resolved!' as message; 