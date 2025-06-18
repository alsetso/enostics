
CREATE OR REPLACE FUNCTION public.handle_new_user_perfect()
RETURNS TRIGGER AS $$
DECLARE
    username_value TEXT;
    selected_plan_value TEXT;
    url_path_value TEXT;
    counter INTEGER := 0;
BEGIN
    -- Extract data from signup metadata
    username_value := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );
    
    selected_plan_value := COALESCE(
        NEW.raw_user_meta_data->>'selected_plan',
        'citizen'
    );
    
    -- Create sanitized URL path
    url_path_value := LOWER(REGEXP_REPLACE(COALESCE(username_value, 'user'), '[^a-zA-Z0-9]', '', 'g'));
    
    -- Ensure url_path is not empty
    IF url_path_value = '' OR url_path_value IS NULL THEN
        url_path_value := 'user' || EXTRACT(EPOCH FROM NOW())::INTEGER;
    END IF;
    
    -- Create user profile (using existing table structure)
    INSERT INTO public.user_profiles (
        user_id, 
        full_name,
        role
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', username_value, ''),
        'consumer'
    ) ON CONFLICT (user_id) DO NOTHING;
    
    -- Create default endpoint with unique url_path
    LOOP
        BEGIN
            INSERT INTO public.enostics_endpoints (
                user_id,
                name,
                url_path,
                description,
                is_active
            )
            VALUES (
                NEW.id,
                'Default Endpoint',
                CASE 
                    WHEN counter = 0 THEN url_path_value
                    ELSE url_path_value || counter::TEXT
                END,
                'Your personal data endpoint - ' || selected_plan_value || ' plan',
                true
            );
            EXIT; -- Success, exit loop
        EXCEPTION WHEN unique_violation THEN
            counter := counter + 1;
            IF counter > 100 THEN -- Prevent infinite loop
                -- Use UUID suffix if we can't find a unique path
                INSERT INTO public.enostics_endpoints (
                    user_id,
                    name,
                    url_path,
                    description,
                    is_active
                )
                VALUES (
                    NEW.id,
                    'Default Endpoint',
                    url_path_value || '_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8),
                    'Your personal data endpoint - ' || selected_plan_value || ' plan',
                    true
                );
                EXIT;
            END IF;
        END;
    END LOOP;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user_perfect trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_perfect();
