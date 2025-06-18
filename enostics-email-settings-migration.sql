-- 📧 Enostics Email Settings Migration
-- This migration creates tables for user email preferences and custom email templates
-- All tables follow the enostics_ naming convention and include RLS policies

-- ==============================================================================
-- 📋 Create Email Preferences Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enostics_email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- 🔔 Notification Types
  endpoint_activity_enabled BOOLEAN DEFAULT true,
  success_notifications BOOLEAN DEFAULT true,
  failure_notifications BOOLEAN DEFAULT true,
  warning_notifications BOOLEAN DEFAULT true,
  info_notifications BOOLEAN DEFAULT false,
  
  -- 📊 Summary Reports
  daily_summaries BOOLEAN DEFAULT false,
  weekly_summaries BOOLEAN DEFAULT true,
  monthly_summaries BOOLEAN DEFAULT false,
  
  -- ⏰ Delivery Settings
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  digest_frequency VARCHAR(20) DEFAULT 'immediate',
  
  -- 📝 Content Settings
  include_payload_data BOOLEAN DEFAULT true,
  include_source_details BOOLEAN DEFAULT true,
  technical_detail_level VARCHAR(20) DEFAULT 'detailed',
  
  -- 🛡️ Rate Limiting
  max_emails_per_hour INTEGER DEFAULT 10,
  max_emails_per_day INTEGER DEFAULT 50,
  
  -- 📅 Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ✅ Constraints
  CONSTRAINT valid_digest_frequency CHECK (digest_frequency IN ('immediate', 'hourly', 'daily')),
  CONSTRAINT valid_technical_level CHECK (technical_detail_level IN ('basic', 'detailed', 'verbose')),
  CONSTRAINT valid_rate_limits CHECK (
    max_emails_per_hour > 0 AND max_emails_per_hour <= 100 AND
    max_emails_per_day > 0 AND max_emails_per_day <= 1000
  )
);

-- ==============================================================================
-- 🎨 Create Custom Email Templates Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enostics_user_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 📧 Template Details
  template_type VARCHAR(50) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_description TEXT,
  
  -- 📝 Customization Content
  custom_subject VARCHAR(255),
  custom_header_text TEXT,
  custom_footer_text TEXT,
  custom_content_html TEXT,
  custom_content_text TEXT,
  
  -- 🎨 Style Customizations
  custom_styles JSONB DEFAULT '{}',
  brand_colors JSONB DEFAULT '{}',
  
  -- ⚙️ Template Settings
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  template_version INTEGER DEFAULT 1,
  
  -- 📊 Usage Statistics
  times_sent INTEGER DEFAULT 0,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- 📅 Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ✅ Constraints
  CONSTRAINT valid_template_type CHECK (template_type IN ('notification', 'welcome', 'summary', 'custom')),
  CONSTRAINT unique_user_template_name UNIQUE (user_id, template_name),
  CONSTRAINT valid_template_version CHECK (template_version > 0)
);

-- ==============================================================================
-- 📊 Create Email Delivery Tracking Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enostics_email_delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 📧 Email Details
  email_type VARCHAR(50) NOT NULL,
  template_id UUID REFERENCES public.enostics_user_email_templates(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  
  -- 📨 Delivery Status
  status VARCHAR(50) DEFAULT 'pending',
  external_email_id VARCHAR(255), -- Resend email ID
  resend_attempts INTEGER DEFAULT 0,
  
  -- 📊 Engagement Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  
  -- 📝 Metadata
  email_data JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- 📅 Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ✅ Constraints
  CONSTRAINT valid_email_status CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- ==============================================================================
-- 🔧 Create Email Settings Audit Log Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enostics_email_settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 📝 Change Details
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  
  -- 📊 Change Data
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',
  changed_fields TEXT[],
  
  -- 🔍 Context
  ip_address INET,
  user_agent TEXT,
  
  -- 📅 Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ✅ Constraints
  CONSTRAINT valid_audit_action CHECK (action IN ('create', 'update', 'delete', 'activate', 'deactivate'))
);

-- ==============================================================================
-- 🔍 Create Indexes for Performance
-- ==============================================================================

-- Email Preferences Indexes
CREATE INDEX IF NOT EXISTS idx_enostics_email_preferences_user_id 
  ON public.enostics_email_preferences(user_id);

-- Email Templates Indexes
CREATE INDEX IF NOT EXISTS idx_enostics_user_email_templates_user_id 
  ON public.enostics_user_email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_user_email_templates_type 
  ON public.enostics_user_email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_enostics_user_email_templates_active 
  ON public.enostics_user_email_templates(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_enostics_user_email_templates_created 
  ON public.enostics_user_email_templates(created_at DESC);

-- GIN index for custom styles JSON
CREATE INDEX IF NOT EXISTS idx_enostics_user_email_templates_styles_gin 
  ON public.enostics_user_email_templates USING GIN(custom_styles);

-- Delivery Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_enostics_email_delivery_tracking_user_id 
  ON public.enostics_email_delivery_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_email_delivery_tracking_status 
  ON public.enostics_email_delivery_tracking(status);
CREATE INDEX IF NOT EXISTS idx_enostics_email_delivery_tracking_external_id 
  ON public.enostics_email_delivery_tracking(external_email_id);
CREATE INDEX IF NOT EXISTS idx_enostics_email_delivery_tracking_sent_at 
  ON public.enostics_email_delivery_tracking(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_email_delivery_tracking_user_type_sent 
  ON public.enostics_email_delivery_tracking(user_id, email_type, sent_at DESC);

-- GIN index for email data JSON
CREATE INDEX IF NOT EXISTS idx_enostics_email_delivery_tracking_data_gin 
  ON public.enostics_email_delivery_tracking USING GIN(email_data);

-- Audit Log Indexes
CREATE INDEX IF NOT EXISTS idx_enostics_email_settings_audit_user_id 
  ON public.enostics_email_settings_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_email_settings_audit_action 
  ON public.enostics_email_settings_audit(action);
CREATE INDEX IF NOT EXISTS idx_enostics_email_settings_audit_table 
  ON public.enostics_email_settings_audit(table_name);
CREATE INDEX IF NOT EXISTS idx_enostics_email_settings_audit_created 
  ON public.enostics_email_settings_audit(created_at DESC);

-- ==============================================================================
-- 🔒 Enable Row Level Security
-- ==============================================================================

ALTER TABLE public.enostics_email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_user_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_email_delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_email_settings_audit ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 🛡️ Create RLS Policies
-- ==============================================================================

-- Email Preferences Policies
CREATE POLICY "Users can view their own email preferences" 
  ON public.enostics_email_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences" 
  ON public.enostics_email_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences" 
  ON public.enostics_email_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email preferences" 
  ON public.enostics_email_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Email Templates Policies
CREATE POLICY "Users can view their own email templates" 
  ON public.enostics_user_email_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email templates" 
  ON public.enostics_user_email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates" 
  ON public.enostics_user_email_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates" 
  ON public.enostics_user_email_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Email Delivery Tracking Policies
CREATE POLICY "Users can view their own email delivery tracking" 
  ON public.enostics_email_delivery_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert email delivery tracking" 
  ON public.enostics_email_delivery_tracking
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update email delivery tracking" 
  ON public.enostics_email_delivery_tracking
  FOR UPDATE USING (true);

-- Email Settings Audit Policies
CREATE POLICY "Users can view their own email settings audit" 
  ON public.enostics_email_settings_audit
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert email settings audit" 
  ON public.enostics_email_settings_audit
  FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 🔄 Create Trigger Functions for Audit Logging
-- ==============================================================================

-- Function to log email preferences changes
CREATE OR REPLACE FUNCTION public.log_email_preferences_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.enostics_email_settings_audit (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    changed_fields
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      WHEN TG_OP = 'DELETE' THEN 'delete'
    END,
    'enostics_email_preferences',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) 
         WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) 
         ELSE NULL END,
    CASE WHEN TG_OP = 'UPDATE' THEN
      ARRAY(
        SELECT key FROM jsonb_each(to_jsonb(NEW)) n
        WHERE n.value IS DISTINCT FROM (to_jsonb(OLD) ->> n.key)::jsonb
      )
    ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log email template changes
CREATE OR REPLACE FUNCTION public.log_email_template_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.enostics_email_settings_audit (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    changed_fields
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      WHEN TG_OP = 'DELETE' THEN 'delete'
    END,
    'enostics_user_email_templates',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) 
         WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) 
         ELSE NULL END,
    CASE WHEN TG_OP = 'UPDATE' THEN
      ARRAY(
        SELECT key FROM jsonb_each(to_jsonb(NEW)) n
        WHERE n.value IS DISTINCT FROM (to_jsonb(OLD) ->> n.key)::jsonb
      )
    ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 🎯 Create Triggers
-- ==============================================================================

-- Email Preferences Triggers
CREATE TRIGGER trigger_email_preferences_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.enostics_email_preferences
  FOR EACH ROW EXECUTE FUNCTION public.log_email_preferences_changes();

CREATE TRIGGER trigger_email_preferences_updated_at
  BEFORE UPDATE ON public.enostics_email_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email Templates Triggers
CREATE TRIGGER trigger_email_templates_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.enostics_user_email_templates
  FOR EACH ROW EXECUTE FUNCTION public.log_email_template_changes();

CREATE TRIGGER trigger_email_templates_updated_at
  BEFORE UPDATE ON public.enostics_user_email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email Delivery Tracking Triggers
CREATE TRIGGER trigger_email_delivery_tracking_updated_at
  BEFORE UPDATE ON public.enostics_email_delivery_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- 🔧 Create Utility Functions
-- ==============================================================================

-- Function to get user email preferences with defaults
CREATE OR REPLACE FUNCTION public.get_user_email_preferences(target_user_id UUID)
RETURNS TABLE (
  endpoint_activity_enabled BOOLEAN,
  success_notifications BOOLEAN,
  failure_notifications BOOLEAN,
  warning_notifications BOOLEAN,
  info_notifications BOOLEAN,
  daily_summaries BOOLEAN,
  weekly_summaries BOOLEAN,
  monthly_summaries BOOLEAN,
  timezone VARCHAR(100),
  quiet_hours_enabled BOOLEAN,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  digest_frequency VARCHAR(20),
  include_payload_data BOOLEAN,
  include_source_details BOOLEAN,
  technical_detail_level VARCHAR(20),
  max_emails_per_hour INTEGER,
  max_emails_per_day INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ep.endpoint_activity_enabled, true),
    COALESCE(ep.success_notifications, true),
    COALESCE(ep.failure_notifications, true),
    COALESCE(ep.warning_notifications, true),
    COALESCE(ep.info_notifications, false),
    COALESCE(ep.daily_summaries, false),
    COALESCE(ep.weekly_summaries, true),
    COALESCE(ep.monthly_summaries, false),
    COALESCE(ep.timezone, 'America/New_York'),
    COALESCE(ep.quiet_hours_enabled, false),
    COALESCE(ep.quiet_hours_start, '22:00'::TIME),
    COALESCE(ep.quiet_hours_end, '08:00'::TIME),
    COALESCE(ep.digest_frequency, 'immediate'),
    COALESCE(ep.include_payload_data, true),
    COALESCE(ep.include_source_details, true),
    COALESCE(ep.technical_detail_level, 'detailed'),
    COALESCE(ep.max_emails_per_hour, 10),
    COALESCE(ep.max_emails_per_day, 50)
  FROM auth.users u
  LEFT JOIN public.enostics_email_preferences ep ON u.id = ep.user_id
  WHERE u.id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is within email rate limits
CREATE OR REPLACE FUNCTION public.check_email_rate_limit(
  target_user_id UUID,
  check_type VARCHAR(10) -- 'hourly' or 'daily'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
  time_window INTERVAL;
BEGIN
  -- Set time window and get max allowed
  IF check_type = 'hourly' THEN
    time_window := '1 hour'::INTERVAL;
    SELECT max_emails_per_hour INTO max_allowed 
    FROM public.enostics_email_preferences 
    WHERE user_id = target_user_id;
    max_allowed := COALESCE(max_allowed, 10);
  ELSIF check_type = 'daily' THEN
    time_window := '1 day'::INTERVAL;
    SELECT max_emails_per_day INTO max_allowed 
    FROM public.enostics_email_preferences 
    WHERE user_id = target_user_id;
    max_allowed := COALESCE(max_allowed, 50);
  ELSE
    RETURN false;
  END IF;
  
  -- Count emails sent in the time window
  SELECT COUNT(*) INTO current_count
  FROM public.enostics_email_delivery_tracking
  WHERE user_id = target_user_id
    AND sent_at >= NOW() - time_window
    AND status IN ('sent', 'delivered', 'opened', 'clicked');
  
  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 🎉 Migration Complete!
-- ==============================================================================

-- Insert initial comment
INSERT INTO public.enostics_email_settings_audit (
  user_id,
  action,
  table_name,
  record_id,
  new_values
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'create',
  'migration',
  gen_random_uuid(),
  '{"message": "Email settings tables created successfully", "version": "1.0.0", "timestamp": "' || NOW() || '"}'
);

-- 📧 Email Settings Migration Complete!
-- 
-- Created Tables:
-- ✅ enostics_email_preferences - User notification preferences
-- ✅ enostics_user_email_templates - Custom email templates
-- ✅ enostics_email_delivery_tracking - Email delivery status
-- ✅ enostics_email_settings_audit - Change audit log
-- 
-- Created Features:
-- 🔍 Comprehensive indexes for performance
-- 🛡️ Row Level Security policies
-- 🔄 Audit logging triggers
-- 🎯 Utility functions for preferences and rate limiting
-- ⚡ Automatic timestamp updates
-- 
-- Ready for email settings integration! 