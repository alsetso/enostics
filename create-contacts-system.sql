-- 📧 Enostics Inter-Endpoint Communication System
-- Enables users to send data to other Enostics endpoints with contact management

-- ==============================================================================
-- 📋 Contacts System
-- ==============================================================================

-- User contacts table for streamlined endpoint discovery
CREATE TABLE IF NOT EXISTS public.enostics_inbox_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contact details
  contact_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_username TEXT NOT NULL, -- Their Enostics username
  contact_display_name TEXT NOT NULL, -- Friendly name
  contact_avatar_url TEXT,
  
  -- Relationship metadata
  relationship_type VARCHAR(50) DEFAULT 'contact', -- 'contact', 'family', 'colleague', 'patient', 'doctor'
  is_favorite BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  
  -- Permissions
  can_send_health_data BOOLEAN DEFAULT TRUE,
  can_send_financial_data BOOLEAN DEFAULT FALSE,
  can_send_location_data BOOLEAN DEFAULT FALSE,
  allowed_data_types TEXT[] DEFAULT '{"message", "note", "event"}',
  
  -- Usage tracking
  last_sent_at TIMESTAMP WITH TIME ZONE,
  total_messages_sent INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_contact UNIQUE (user_id, contact_user_id),
  CONSTRAINT no_self_contact CHECK (user_id != contact_user_id),
  CONSTRAINT valid_relationship CHECK (relationship_type IN ('contact', 'family', 'colleague', 'patient', 'doctor', 'team_member', 'organization'))
);

-- ==============================================================================
-- 📤 Outbound Messages System
-- ==============================================================================

-- Track messages sent between Enostics users
CREATE TABLE IF NOT EXISTS public.enostics_outbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.enostics_inbox_contacts(id) ON DELETE SET NULL,
  
  -- Message details
  message_type VARCHAR(50) NOT NULL DEFAULT 'data_share',
  subject TEXT,
  message_body TEXT,
  
  -- Data payload
  payload JSONB NOT NULL,
  payload_type VARCHAR(100),
  payload_source VARCHAR(255) DEFAULT 'enostics_user',
  
  -- Delivery tracking
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
  delivery_attempts INTEGER DEFAULT 1,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  sender_endpoint_id UUID REFERENCES public.enostics_endpoints(id) ON DELETE SET NULL,
  recipient_endpoint_url TEXT, -- The target /v1/username they sent to
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_message_status CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'pending')),
  CONSTRAINT valid_message_type CHECK (message_type IN ('data_share', 'notification', 'request', 'response'))
);

-- ==============================================================================
-- 🔍 Contact Discovery & Suggestions
-- ==============================================================================

-- Contact suggestions based on interactions
CREATE TABLE IF NOT EXISTS public.enostics_contact_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Suggestion reasoning
  suggestion_type VARCHAR(50) NOT NULL, -- 'mutual_contacts', 'same_organization', 'frequent_interaction', 'location_based'
  confidence_score DECIMAL(3,2) DEFAULT 0.50, -- 0.00 to 1.00
  suggestion_reason TEXT,
  
  -- Interaction tracking
  times_suggested INTEGER DEFAULT 1,
  last_suggested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_action VARCHAR(20), -- 'added', 'dismissed', 'blocked', null
  action_taken_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_suggestion UNIQUE (user_id, suggested_user_id),
  CONSTRAINT no_self_suggestion CHECK (user_id != suggested_user_id),
  CONSTRAINT valid_suggestion_type CHECK (suggestion_type IN ('mutual_contacts', 'same_organization', 'frequent_interaction', 'location_based', 'email_domain')),
  CONSTRAINT valid_user_action CHECK (user_action IN ('added', 'dismissed', 'blocked'))
);

-- ==============================================================================
-- 📊 Indexes for Performance
-- ==============================================================================

-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_contacts_user_id 
  ON public.enostics_inbox_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_contacts_contact_user_id 
  ON public.enostics_inbox_contacts(contact_user_id);
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_contacts_username 
  ON public.enostics_inbox_contacts(contact_username);
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_contacts_relationship 
  ON public.enostics_inbox_contacts(user_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_enostics_inbox_contacts_favorites 
  ON public.enostics_inbox_contacts(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Outbound messages indexes
CREATE INDEX IF NOT EXISTS idx_enostics_outbound_messages_sender 
  ON public.enostics_outbound_messages(sender_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_outbound_messages_recipient 
  ON public.enostics_outbound_messages(recipient_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_outbound_messages_status 
  ON public.enostics_outbound_messages(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_outbound_messages_contact 
  ON public.enostics_outbound_messages(contact_id);

-- Contact suggestions indexes
CREATE INDEX IF NOT EXISTS idx_enostics_contact_suggestions_user_id 
  ON public.enostics_contact_suggestions(user_id, confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_enostics_contact_suggestions_type 
  ON public.enostics_contact_suggestions(suggestion_type, confidence_score DESC);

-- GIN indexes for JSON search
CREATE INDEX IF NOT EXISTS idx_enostics_outbound_messages_payload_gin 
  ON public.enostics_outbound_messages USING GIN(payload);

-- ==============================================================================
-- 🔐 Row Level Security
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.enostics_inbox_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_outbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enostics_contact_suggestions ENABLE ROW LEVEL SECURITY;

-- Contacts policies
CREATE POLICY "Users can view their own contacts" 
  ON public.enostics_inbox_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contacts" 
  ON public.enostics_inbox_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Outbound messages policies
CREATE POLICY "Users can view their sent messages" 
  ON public.enostics_outbound_messages
  FOR SELECT USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can view messages sent to them" 
  ON public.enostics_outbound_messages
  FOR SELECT USING (auth.uid() = recipient_user_id);

CREATE POLICY "Users can send messages" 
  ON public.enostics_outbound_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Users can update their sent messages" 
  ON public.enostics_outbound_messages
  FOR UPDATE USING (auth.uid() = sender_user_id);

-- Contact suggestions policies
CREATE POLICY "Users can view their suggestions" 
  ON public.enostics_contact_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their suggestions" 
  ON public.enostics_contact_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 🔧 Helper Functions
-- ==============================================================================

-- Function to add a contact
CREATE OR REPLACE FUNCTION public.add_enostics_contact(
  p_contact_username TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_relationship_type VARCHAR(50) DEFAULT 'contact'
)
RETURNS UUID AS $$
DECLARE
  contact_user_record RECORD;
  contact_id UUID;
BEGIN
  -- Find the user by username
  SELECT u.id, p.full_name, p.avatar_url 
  INTO contact_user_record
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  WHERE p.full_name = p_contact_username OR LOWER(p.full_name) = LOWER(p_contact_username);
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with username % not found', p_contact_username;
  END IF;
  
  -- Insert contact
  INSERT INTO public.enostics_inbox_contacts (
    user_id,
    contact_user_id,
    contact_username,
    contact_display_name,
    relationship_type
  ) VALUES (
    auth.uid(),
    contact_user_record.id,
    p_contact_username,
    COALESCE(p_display_name, contact_user_record.full_name, p_contact_username),
    p_relationship_type
  ) RETURNING id INTO contact_id;
  
  RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send data to another Enostics user
CREATE OR REPLACE FUNCTION public.send_to_enostics_user(
  p_recipient_username TEXT,
  p_payload JSONB,
  p_subject TEXT DEFAULT NULL,
  p_message_body TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  recipient_user_record RECORD;
  message_id UUID;
  endpoint_url TEXT;
BEGIN
  -- Find recipient
  SELECT u.id, p.full_name 
  INTO recipient_user_record
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  WHERE p.full_name = p_recipient_username OR LOWER(p.full_name) = LOWER(p_recipient_username);
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient % not found', p_recipient_username;
  END IF;
  
  -- Generate endpoint URL
  endpoint_url := 'https://api.enostics.com/v1/' || p_recipient_username;
  
  -- Insert outbound message
  INSERT INTO public.enostics_outbound_messages (
    sender_user_id,
    recipient_user_id,
    subject,
    message_body,
    payload,
    payload_type,
    recipient_endpoint_url
  ) VALUES (
    auth.uid(),
    recipient_user_record.id,
    p_subject,
    p_message_body,
    p_payload,
    COALESCE(p_payload->>'type', 'message'),
    endpoint_url
  ) RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 