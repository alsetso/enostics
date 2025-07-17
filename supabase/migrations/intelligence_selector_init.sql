-- ============================================================================
-- ENOSTICS INTELLIGENCE SELECTOR SYSTEM MIGRATION
-- ============================================================================
-- This migration adds the required tables and columns for the intelligence
-- selector workflow that allows batch processing of data records.

-- ----------------------------------------------------------------------------
-- 1. Add queue_status and batch_id columns to data table
-- ----------------------------------------------------------------------------
ALTER TABLE data 
ADD COLUMN IF NOT EXISTS queue_status text DEFAULT 'none' CHECK (queue_status IN ('none', 'selected', 'queued', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS batch_id uuid NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_queue_status ON data(queue_status);
CREATE INDEX IF NOT EXISTS idx_data_batch_id ON data(batch_id);
CREATE INDEX IF NOT EXISTS idx_data_queue_status_batch_id ON data(queue_status, batch_id);

-- ----------------------------------------------------------------------------
-- 2. Create processing_batch table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS processing_batch (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text,
    description text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_records integer DEFAULT 0,
    processed_records integer DEFAULT 0,
    failed_records integer DEFAULT 0,
    estimated_cost_cents integer DEFAULT 0,
    actual_cost_cents integer DEFAULT 0,
    processing_plan text DEFAULT 'auto_basic' CHECK (processing_plan IN ('auto_basic', 'auto_advanced', 'enterprise', 'custom')),
    ai_models_enabled text[] DEFAULT ARRAY[]::text[],
    business_domain text,
    priority integer DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    created_at timestamptz DEFAULT now(),
    started_at timestamptz,
    completed_at timestamptz,
    updated_at timestamptz DEFAULT now(),
    processing_metadata jsonb DEFAULT '{}'::jsonb,
    error_details jsonb DEFAULT '{}'::jsonb,
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for processing_batch
CREATE INDEX IF NOT EXISTS idx_processing_batch_user_id ON processing_batch(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_batch_status ON processing_batch(status);
CREATE INDEX IF NOT EXISTS idx_processing_batch_created_at ON processing_batch(created_at);
CREATE INDEX IF NOT EXISTS idx_processing_batch_priority ON processing_batch(priority);
CREATE INDEX IF NOT EXISTS idx_processing_batch_business_domain ON processing_batch(business_domain);

-- ----------------------------------------------------------------------------
-- 3. Add batch_id column to data_processor table (if not exists)
-- ----------------------------------------------------------------------------
ALTER TABLE data_processor 
ADD COLUMN IF NOT EXISTS batch_id uuid NULL;

-- Create foreign key constraint
ALTER TABLE data_processor 
ADD CONSTRAINT fk_data_processor_batch_id 
FOREIGN KEY (batch_id) REFERENCES processing_batch(id) ON DELETE SET NULL;

-- Create index for batch_id
CREATE INDEX IF NOT EXISTS idx_data_processor_batch_id ON data_processor(batch_id);

-- ----------------------------------------------------------------------------
-- 4. Create foreign key constraint for data.batch_id
-- ----------------------------------------------------------------------------
ALTER TABLE data 
ADD CONSTRAINT fk_data_batch_id 
FOREIGN KEY (batch_id) REFERENCES processing_batch(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 5. Create trigger to update processing_batch.updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_processing_batch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_processing_batch_updated_at ON processing_batch;
CREATE TRIGGER update_processing_batch_updated_at
    BEFORE UPDATE ON processing_batch
    FOR EACH ROW
    EXECUTE FUNCTION update_processing_batch_updated_at();

-- ----------------------------------------------------------------------------
-- 6. Create function to update batch progress
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_batch_progress(batch_uuid uuid)
RETURNS void AS $$
DECLARE
    total_count integer;
    processed_count integer;
    failed_count integer;
    batch_status text;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO total_count 
    FROM data 
    WHERE batch_id = batch_uuid;
    
    SELECT COUNT(*) INTO processed_count 
    FROM data 
    WHERE batch_id = batch_uuid AND queue_status = 'completed';
    
    SELECT COUNT(*) INTO failed_count 
    FROM data 
    WHERE batch_id = batch_uuid AND queue_status = 'failed';
    
    -- Determine batch status
    IF processed_count + failed_count = total_count THEN
        batch_status = 'completed';
    ELSIF processed_count + failed_count > 0 THEN
        batch_status = 'processing';
    ELSE
        batch_status = 'pending';
    END IF;
    
    -- Update batch
    UPDATE processing_batch 
    SET 
        total_records = total_count,
        processed_records = processed_count,
        failed_records = failed_count,
        status = batch_status,
        completed_at = CASE 
            WHEN batch_status = 'completed' AND completed_at IS NULL THEN now()
            ELSE completed_at
        END,
        started_at = CASE 
            WHEN batch_status = 'processing' AND started_at IS NULL THEN now()
            ELSE started_at
        END
    WHERE id = batch_uuid;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 7. Create trigger to automatically update batch progress
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_update_batch_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update batch progress when data record status changes
    IF NEW.batch_id IS NOT NULL THEN
        PERFORM update_batch_progress(NEW.batch_id);
    END IF;
    
    -- Also update for old batch if batch_id changed
    IF OLD.batch_id IS NOT NULL AND OLD.batch_id != NEW.batch_id THEN
        PERFORM update_batch_progress(OLD.batch_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_batch_progress ON data;
CREATE TRIGGER trigger_update_batch_progress
    AFTER UPDATE OF queue_status, batch_id ON data
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_batch_progress();

-- ----------------------------------------------------------------------------
-- 8. Create RLS policies for processing_batch
-- ----------------------------------------------------------------------------
ALTER TABLE processing_batch ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own batches
CREATE POLICY "Users can view their own processing batches"
    ON processing_batch FOR SELECT
    USING (user_id = auth.uid());

-- Policy for users to create their own batches
CREATE POLICY "Users can create their own processing batches"
    ON processing_batch FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Policy for users to update their own batches
CREATE POLICY "Users can update their own processing batches"
    ON processing_batch FOR UPDATE
    USING (user_id = auth.uid());

-- Policy for users to delete their own batches
CREATE POLICY "Users can delete their own processing batches"
    ON processing_batch FOR DELETE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 9. Create utility function for batch cost estimation
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION estimate_batch_cost(
    record_count integer,
    processing_plan text DEFAULT 'auto_basic'
)
RETURNS integer AS $$
DECLARE
    base_cost_cents integer;
    cost_per_record integer;
BEGIN
    -- Base cost structure (in cents)
    CASE processing_plan
        WHEN 'auto_basic' THEN 
            base_cost_cents = 50; -- $0.50 base
            cost_per_record = 2;   -- $0.02 per record
        WHEN 'auto_advanced' THEN 
            base_cost_cents = 100; -- $1.00 base
            cost_per_record = 5;   -- $0.05 per record
        WHEN 'enterprise' THEN 
            base_cost_cents = 200; -- $2.00 base
            cost_per_record = 10;  -- $0.10 per record
        WHEN 'custom' THEN 
            base_cost_cents = 150; -- $1.50 base
            cost_per_record = 8;   -- $0.08 per record
        ELSE 
            base_cost_cents = 50;  -- Default to basic
            cost_per_record = 2;
    END CASE;
    
    RETURN base_cost_cents + (record_count * cost_per_record);
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 10. Update existing data to have default queue_status
-- ----------------------------------------------------------------------------
UPDATE data 
SET queue_status = 'none' 
WHERE queue_status IS NULL;

-- ----------------------------------------------------------------------------
-- 11. Verify the migration
-- ----------------------------------------------------------------------------
-- Check that new columns exist
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND ((table_name = 'data' AND column_name IN ('queue_status', 'batch_id'))
     OR (table_name = 'processing_batch')
     OR (table_name = 'data_processor' AND column_name = 'batch_id'))
ORDER BY table_name, ordinal_position;

-- Check foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('data', 'processing_batch', 'data_processor')
AND tc.table_schema = 'public'
ORDER BY tc.table_name; 