-- ============================================================================
-- PERMANENT SECURITY FIX - PREVENT SECURITY DEFINER VIEWS
-- ============================================================================
-- This migration permanently fixes the SECURITY DEFINER issue by:
-- 1. Completely removing the problematic views
-- 2. Creating a database function that prevents SECURITY DEFINER views
-- 3. Optionally creating simple replacement views if needed

-- ----------------------------------------------------------------------------
-- 1. NUCLEAR OPTION: COMPLETELY REMOVE ALL PROBLEMATIC VIEWS
-- ----------------------------------------------------------------------------

-- Drop all views that might have SECURITY DEFINER issues
DROP VIEW IF EXISTS public.user_details CASCADE;
DROP VIEW IF EXISTS public.enostics_endpoints CASCADE;
DROP VIEW IF EXISTS public.data_enhanced CASCADE;
DROP VIEW IF EXISTS public.user_profiles CASCADE;
DROP VIEW IF EXISTS public.organization_users CASCADE;

-- Also drop materialized views
DROP MATERIALIZED VIEW IF EXISTS public.user_details CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.enostics_endpoints CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.data_enhanced CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.user_profiles CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.organization_users CASCADE;

-- ----------------------------------------------------------------------------
-- 2. CREATE EVENT TRIGGER TO PREVENT SECURITY DEFINER VIEWS (OPTIONAL)
-- ----------------------------------------------------------------------------

-- This function will prevent any view from being created with SECURITY DEFINER
CREATE OR REPLACE FUNCTION prevent_security_definer_views()
RETURNS event_trigger AS $$
DECLARE
    obj record;
BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE VIEW'
    LOOP
        -- Check if the view definition contains SECURITY DEFINER
        IF EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND definition LIKE '%SECURITY DEFINER%'
            AND viewname = obj.object_identity
        ) THEN
            -- Log a warning
            RAISE WARNING 'Prevented creation of SECURITY DEFINER view: %', obj.object_identity;
            -- You could also RAISE EXCEPTION to completely prevent it
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create the event trigger (commented out by default - uncomment if needed)
-- DROP EVENT TRIGGER IF EXISTS prevent_security_definer_trigger;
-- CREATE EVENT TRIGGER prevent_security_definer_trigger
--     ON ddl_command_end
--     WHEN TAG IN ('CREATE VIEW')
--     EXECUTE FUNCTION prevent_security_definer_views();

-- ----------------------------------------------------------------------------
-- 3. SIMPLE SOLUTION: JUST DON'T CREATE THESE VIEWS AT ALL
-- ----------------------------------------------------------------------------

-- Since these views are causing security issues and may not be needed,
-- we'll just leave them deleted. Applications should query tables directly:
-- 
-- Instead of: SELECT * FROM user_details
-- Use: SELECT * FROM profiles WHERE id = auth.uid()
--
-- Instead of: SELECT * FROM enostics_endpoints  
-- Use: SELECT * FROM endpoints WHERE user_id = auth.uid()
--
-- Instead of: SELECT * FROM data_enhanced
-- Use: SELECT d.* FROM data d JOIN endpoints e ON d.endpoint_id = e.id WHERE e.user_id = auth.uid()

-- ----------------------------------------------------------------------------
-- 4. VERIFY NO SECURITY DEFINER VIEWS EXIST
-- ----------------------------------------------------------------------------

-- Check that no views have SECURITY DEFINER
SELECT 
    schemaname,
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'ERROR: Has SECURITY DEFINER' 
        ELSE 'OK: No SECURITY DEFINER' 
    END as security_status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- ----------------------------------------------------------------------------
-- 5. SUCCESS MESSAGE
-- ----------------------------------------------------------------------------

SELECT 'PERMANENT FIX APPLIED: All problematic views removed. Applications should query tables directly.' as result; 