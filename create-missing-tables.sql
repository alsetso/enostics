-- Create missing user_profiles table and fix database schema
-- Run this in your Supabase SQL Editor

-- Create user_profiles table (MISSING!)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role TEXT DEFAULT 'consumer' CHECK (role IN ('consumer', 'provider', 'org_admin', 'developer')),
    full_name TEXT,
    avatar_url TEXT,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Add unique constraint to enostics_endpoints url_path if not exists
ALTER TABLE public.enostics_endpoints 
ADD CONSTRAINT IF NOT EXISTS unique_url_path UNIQUE (url_path);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function
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
    
    -- Insert user profile first
    INSERT INTO public.user_profiles (user_id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', username_value, ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'consumer')
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 