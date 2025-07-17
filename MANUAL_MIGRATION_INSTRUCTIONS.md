# Manual Database Migration Instructions

## Problem
The `data` table is missing columns that the inbox functionality requires:
- `is_read` (boolean)
- `is_starred` (boolean) 
- `subject` (text)
- `preview` (text)
- `source` (text)
- `type` (text)

## Solution
Run the following SQL statements in your Supabase SQL Editor:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query

### Step 2: Run this SQL
Copy and paste the following SQL and execute it:

```sql
-- Add missing columns to the data table
ALTER TABLE data 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS preview TEXT,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'data';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_is_read ON data(is_read);
CREATE INDEX IF NOT EXISTS idx_data_is_starred ON data(is_starred);
CREATE INDEX IF NOT EXISTS idx_data_endpoint_id ON data(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_data_type ON data(type);

-- Update existing rows to have default values
UPDATE data SET 
    is_read = false,
    is_starred = false,
    type = COALESCE(type, 'data'),
    source = COALESCE(source, 'api_endpoint')
WHERE is_read IS NULL OR is_starred IS NULL OR type IS NULL OR source IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'data' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Step 3: Verify
After running the SQL, you should see output showing all the columns in the `data` table, including the new ones:
- `is_read`
- `is_starred`
- `subject`
- `preview`
- `source`
- `type`

### Step 4: Test the Application
Once the migration is complete, the inbox functionality should work properly:
- Reading/unread status should work
- Starring items should work
- No more 500 errors about missing columns

## Alternative: Individual Commands
If you prefer to run one command at a time:

```sql
-- Add columns one by one
ALTER TABLE data ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE data ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;
ALTER TABLE data ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE data ADD COLUMN IF NOT EXISTS preview TEXT;
ALTER TABLE data ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE data ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'data';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_data_is_read ON data(is_read);
CREATE INDEX IF NOT EXISTS idx_data_is_starred ON data(is_starred);
CREATE INDEX IF NOT EXISTS idx_data_endpoint_id ON data(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_data_type ON data(type);

-- Update existing data
UPDATE data SET 
    is_read = false,
    is_starred = false,
    type = COALESCE(type, 'data'),
    source = COALESCE(source, 'api_endpoint')
WHERE is_read IS NULL OR is_starred IS NULL OR type IS NULL OR source IS NULL;
```

## Expected Result
After running this migration:
- The dashboard should load without 500 errors
- You should be able to mark items as read/unread
- You should be able to star/unstar items
- The inbox functionality should work completely 