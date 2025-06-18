-- Enostics Email Settings Tables for Supabase
-- Execute this in your Supabase SQL Editor

-- Create Email Preferences Table
CREATE TABLE IF NOT EXISTS public.enostics_email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Types
  endpoint_activity_enabled BOOLEAN DEFAULT true,
  success_notifications BOOLEAN DEFAULT true,
  failure_notifications BOOLEAN DEFAULT true,
  warning_notifications BOOLEAN DEFAULT true,
  info_notifications BOOLEAN DEFAULT false,
  
  -- Summary Reports
  daily_summaries BOOLEAN DEFAULT false,
  weekly_summaries BOOLEAN DEFAULT true,
  monthly_summaries BOOLEAN DEFAULT false,
  
  -- Delivery Settings
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  digest_frequency VARCHAR(20) DEFAULT 'immediate',
  
  -- Content Settings
  include_payload_data BOOLEAN DEFAULT true,
  include_source_details BOOLEAN DEFAULT true,
  technical_detail_level VARCHAR(20) DEFAULT 'detailed',
  
  -- Rate Limiting
  max_emails_per_hour INTEGER DEFAULT 10,
  max_emails_per_day INTEGER DEFAULT 50,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_digest_frequency CHECK (digest_frequency IN ('immediate', 'hourly', 'daily')),
  CONSTRAINT valid_technical_level CHECK (technical_detail_level IN ('basic', 'detailed', 'verbose')),
  CONSTRAINT valid_rate_limits CHECK (
    max_emails_per_hour > 0 AND max_emails_per_hour <= 100 AND
    max_emails_per_day > 0 AND max_emails_per_day <= 1000
  ),
  CONSTRAINT unique_user_email_prefs UNIQUE (user_id)
);

-- Create Custom Email Templates Table
CREATE TABLE IF NOT EXISTS public.enostics_user_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template Details
  template_type VARCHAR(50) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_description TEXT,
  
  -- Customization Content
  custom_subject VARCHAR(255),
  custom_header_text TEXT,
  custom_footer_text TEXT,
  custom_content_html TEXT,
  custom_content_text TEXT,
  
  -- Style Customizations
  custom_styles JSONB DEFAULT '{}',
  brand_colors JSONB DEFAULT '{}',
  
  -- Template Settings
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  template_version INTEGER DEFAULT 1,
  
  -- Usage Statistics
  times_sent INTEGER DEFAULT 0,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_template_type CHECK (template_type IN ('notification', 'welcome', 'summary', 'custom')),
  CONSTRAINT unique_user_template_name UNIQUE (user_id, template_name),
  CONSTRAINT valid_template_version CHECK (template_version > 0)
);

-- Create Email Delivery Tracking Table
CREATE TABLE IF NOT EXISTS public.enostics_email_delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email Details
  email_type VARCHAR(50) NOT NULL,
  template_id UUID REFERENCES public.enostics_user_email_templates(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  
  -- Delivery Status
  status VARCHAR(50) DEFAULT 'pending',
  external_email_id VARCHAR(255), -- Resend email ID
  resend_attempts INTEGER DEFAULT 0,
  
  -- Engagement Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  email_data JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email_status CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_enostics_email_preferences_user_id 
  ON public.enostics_email_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_enostics_user_email_templates_user_id 
  ON public.enostics_user_email_templates(user_id);

CREATE INDEX IF NOT EXISTS idx_enostics_user_email_templates_type 
  ON public.enostics_user_email_templates(template_type);

CREATE INDEX IF NOT EXISTS idx_enostics_email_delivery_tracking_user_id 
  ON public.enostics_email_delivery_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_enostics_email_delivery_tracking_status 
  ON public.enostics_email_delivery_tracking(status);

-- Enable Row Level Security
ALTER TABLE public.enostics_email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_user_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_email_delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
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

CREATE POLICY "Users can view their own email delivery tracking" 
  ON public.enostics_email_delivery_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert email delivery tracking" 
  ON public.enostics_email_delivery_tracking
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update email delivery tracking" 
  ON public.enostics_email_delivery_tracking
  FOR UPDATE USING (true); 