-- Fix registration trigger to use correct 'profiles' table
-- Run this in your Supabase SQL Editor

-- Drop existing problematic trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create correct trigger function for 'profiles' table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_value TEXT;
    url_path_value TEXT;
    counter INTEGER := 0;
BEGIN
    -- Extract username from metadata or use email prefix
    username_value := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name', 
        split_part(NEW.email, '@', 1)
    );
    
    -- Create initial URL path (sanitized)
    url_path_value := LOWER(REGEXP_REPLACE(COALESCE(username_value, 'user'), '[^a-zA-Z0-9]', '', 'g'));
    
    -- Ensure url_path is not empty
    IF url_path_value = '' OR url_path_value IS NULL THEN
        url_path_value := 'user' || EXTRACT(EPOCH FROM NOW())::INTEGER;
    END IF;
    
    -- Insert into PROFILES table (not user_profiles!)
    INSERT INTO public.profiles (id, full_name, username)
    VALUES (
        NEW.id,  -- profiles.id = auth.users.id
        COALESCE(NEW.raw_user_meta_data->>'full_name', username_value, ''),
        username_value
    );
    
    -- Create a default endpoint with unique url_path
    LOOP
        BEGIN
            INSERT INTO public.enostics_endpoints (user_id, name, url_path, description)
            VALUES (
                NEW.id,
                'Default Endpoint',
                CASE 
                    WHEN counter = 0 THEN url_path_value
                    ELSE url_path_value || counter::TEXT
                END,
                'Your personal data endpoint'
            );
            EXIT; -- Success, exit loop
        EXCEPTION WHEN unique_violation THEN
            counter := counter + 1;
            IF counter > 100 THEN -- Prevent infinite loop
                -- Use UUID suffix if we can't find a unique path
                INSERT INTO public.enostics_endpoints (user_id, name, url_path, description)
                VALUES (
                    NEW.id,
                    'Default Endpoint',
                    url_path_value || '_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8),
                    'Your personal data endpoint'
                );
                EXIT;
            END IF;
        END;
    END LOOP;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error and continue (don't block user creation)
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add unique constraint to enostics_endpoints url_path if not exists
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