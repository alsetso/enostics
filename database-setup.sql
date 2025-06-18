-- Enostics Database Setup
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('consumer', 'provider', 'org_admin', 'developer')) DEFAULT 'consumer',
  full_name TEXT,
  avatar_url TEXT,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enostics_endpoints table
CREATE TABLE IF NOT EXISTS enostics_endpoints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  url_path TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  auth_type TEXT DEFAULT 'none',
  settings JSONB DEFAULT '{}',
  webhook_url TEXT,
  webhook_secret TEXT,
  webhook_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, url_path)
);

-- Create enostics_data table
CREATE TABLE IF NOT EXISTS enostics_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  endpoint_id UUID REFERENCES enostics_endpoints(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL,
  source_ip INET,
  headers JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'received'
);

-- Create enostics_api_keys table
CREATE TABLE IF NOT EXISTS enostics_api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint_id UUID REFERENCES enostics_endpoints(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year')
);

-- Create enostics_request_logs table for analytics and monitoring
CREATE TABLE IF NOT EXISTS enostics_request_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  endpoint_id UUID REFERENCES enostics_endpoints(id) ON DELETE CASCADE NOT NULL,
  api_key_id UUID REFERENCES enostics_api_keys(id) ON DELETE SET NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  source_ip INET,
  user_agent TEXT,
  content_length INTEGER,
  error_message TEXT,
  webhook_sent BOOLEAN DEFAULT false,
  webhook_status INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enostics_webhook_logs table for webhook delivery tracking
CREATE TABLE IF NOT EXISTS enostics_webhook_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  endpoint_id UUID REFERENCES enostics_endpoints(id) ON DELETE CASCADE NOT NULL,
  request_log_id UUID REFERENCES enostics_request_logs(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  status_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_fullname ON user_profiles(lower(full_name));
CREATE INDEX IF NOT EXISTS idx_enostics_endpoints_user_id ON enostics_endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_endpoints_url_path ON enostics_endpoints(url_path);
CREATE INDEX IF NOT EXISTS idx_enostics_endpoints_active ON enostics_endpoints(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_enostics_data_endpoint_id ON enostics_data(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_enostics_data_processed_at ON enostics_data(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_api_keys_hash ON enostics_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_enostics_api_keys_user_id ON enostics_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_api_keys_active ON enostics_api_keys(key_hash, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_enostics_request_logs_endpoint_id ON enostics_request_logs(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_enostics_request_logs_created_at ON enostics_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_request_logs_status ON enostics_request_logs(endpoint_id, status_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_webhook_logs_endpoint_id ON enostics_webhook_logs(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_enostics_webhook_logs_request_id ON enostics_webhook_logs(request_log_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enostics_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE enostics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE enostics_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE enostics_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enostics_webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for enostics_endpoints
CREATE POLICY "Users can view own endpoints" ON enostics_endpoints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own endpoints" ON enostics_endpoints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own endpoints" ON enostics_endpoints
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own endpoints" ON enostics_endpoints
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for enostics_data
CREATE POLICY "Users can view data for their endpoints" ON enostics_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enostics_endpoints 
      WHERE enostics_endpoints.id = enostics_data.endpoint_id 
      AND enostics_endpoints.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert data to active endpoints" ON enostics_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM enostics_endpoints 
      WHERE enostics_endpoints.id = enostics_data.endpoint_id 
      AND enostics_endpoints.is_active = true
    )
  );

-- RLS Policies for enostics_api_keys
CREATE POLICY "Users can view own API keys" ON enostics_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON enostics_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON enostics_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON enostics_api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for enostics_request_logs
CREATE POLICY "Users can view logs for their endpoints" ON enostics_request_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enostics_endpoints 
      WHERE enostics_endpoints.id = enostics_request_logs.endpoint_id 
      AND enostics_endpoints.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert request logs" ON enostics_request_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for enostics_webhook_logs
CREATE POLICY "Users can view webhook logs for their endpoints" ON enostics_webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enostics_endpoints 
      WHERE enostics_endpoints.id = enostics_webhook_logs.endpoint_id 
      AND enostics_endpoints.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert webhook logs" ON enostics_webhook_logs
  FOR INSERT WITH CHECK (true);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enostics_endpoints_updated_at
  BEFORE UPDATE ON enostics_endpoints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- Uncomment if you want sample data

/*
-- Sample endpoint for testing (replace with actual user ID)
INSERT INTO enostics_endpoints (user_id, name, description, url_path, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'Health Data Endpoint',
  'Receives health data from devices and providers',
  'health',
  true
) ON CONFLICT DO NOTHING;
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database setup completed successfully!' as message; 