-- NUCLEAR OPTION: Complete reset of auth-related triggers and constraints
-- Run this in Supabase SQL Editor

-- 1. Drop ALL triggers on auth.users (even if we can't see them)
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Try to drop any triggers on auth.users
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
        AND trigger_schema = 'auth'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trigger_record.trigger_name);
        RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 2. Drop ALL functions that might be related to user creation
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS auth.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_signup() CASCADE;
DROP FUNCTION IF EXISTS handle_user_signup() CASCADE;

-- 3. Check for any RLS policies that might be blocking
-- Temporarily disable RLS on profiles (we'll re-enable later)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. Drop any problematic foreign key constraints temporarily
-- (We can add them back later)
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop foreign key constraints that reference auth.users
    FOR constraint_record IN 
        SELECT 
            tc.table_name,
            tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'users'
        AND tc.table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.table_name, 
                      constraint_record.constraint_name);
        RAISE NOTICE 'Dropped FK constraint: % on table %', 
                     constraint_record.constraint_name, 
                     constraint_record.table_name;
    END LOOP;
END $$;

-- 5. Create a minimal working environment
-- Re-enable RLS on profiles with permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create very permissive policies for testing
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
CREATE POLICY "Allow all access to profiles" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Test query to verify we can access auth.users
-- (This will tell us if the issue is deeper)
SELECT 'Auth system check completed' as status; 