-- EMERGENCY FIX: Temporarily disable trigger to allow user registration
-- Run this in your Supabase SQL Editor to fix registration immediately

-- Step 1: Drop the broken trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create a simple, working trigger function for 'profiles' table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Just create the profile - no endpoint creation for now
    INSERT INTO public.profiles (id, full_name, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the simplified trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add unique constraint to endpoints if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_url_path' 
        AND table_name = 'enostics_endpoints'
    ) THEN
        ALTER TABLE public.enostics_endpoints 
        ADD CONSTRAINT unique_url_path UNIQUE (url_path);
    END IF;
END $$;

-- Note: This creates profiles but not endpoints automatically
-- Endpoints can be created manually by users in the dashboard 