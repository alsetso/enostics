-- STEP 1: Completely disable all triggers to allow registration
-- Run this in Supabase SQL Editor

-- Remove any existing triggers completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Verify no triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- This should return no rows, meaning triggers are disabled 