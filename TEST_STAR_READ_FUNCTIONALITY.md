# Testing Star and Read Functionality

## Prerequisites
1. **Database Migration**: Run the migration script to ensure all columns exist:
   ```sql
   -- Run in Supabase SQL Editor
   -- Copy and paste the contents of supabase/migrations/20250115_fix_inbox_columns.sql
   ```

2. **User Authentication**: Make sure you're logged in to the dashboard

3. **Test Data**: Ensure you have some inbox items to test with

## Test Cases

### 1. Visual Test - Star Icon Visibility
**Expected Behavior**: Star icons should always be visible (not just on hover)

**Test Steps**:
1. Go to dashboard inbox
2. Look at the star column (second column from left)
3. ✅ **Pass**: Star outline should be visible for all items
4. ❌ **Fail**: Star only appears on hover

### 2. Star Functionality Test
**Expected Behavior**: Clicking star should toggle starred state with visual feedback

**Test Steps**:
1. Find an unstarred item (gray star outline)
2. Click the star icon
3. ✅ **Pass**: Star turns yellow and filled
4. Click the star again
5. ✅ **Pass**: Star returns to gray outline
6. ❌ **Fail**: Star doesn't change color or state

### 3. Read Functionality Test
**Expected Behavior**: Clicking an item should mark it as read

**Test Steps**:
1. Find an unread item (has blue dot indicator)
2. Click on the item row to open details
3. ✅ **Pass**: Blue dot disappears, item background changes
4. ❌ **Fail**: Item stays marked as unread

### 4. Persistence Test
**Expected Behavior**: Star and read states should persist after page refresh

**Test Steps**:
1. Star an item and mark another as read
2. Refresh the page (F5)
3. ✅ **Pass**: Starred item remains starred, read item remains read
4. ❌ **Fail**: Changes are lost after refresh

### 5. API Test (Browser Console)
**Expected Behavior**: API endpoints should return success responses

**Test Steps**:
1. Open browser dev tools (F12)
2. Go to Console tab
3. Run the following test commands:

```javascript
// Test star functionality
fetch('/api/inbox/star', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ id: 'REPLACE_WITH_ACTUAL_ITEM_ID' }),
})
.then(response => response.json())
.then(data => console.log('Star test:', data))
.catch(error => console.error('Star error:', error));

// Test read functionality
fetch('/api/inbox/read', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ id: 'REPLACE_WITH_ACTUAL_ITEM_ID' }),
})
.then(response => response.json())
.then(data => console.log('Read test:', data))
.catch(error => console.error('Read error:', error));
```

### 6. Database Verification
**Expected Behavior**: Changes should be reflected in the database

**Test Steps**:
1. In Supabase SQL Editor, run:
```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'data' 
AND column_name IN ('is_read', 'is_starred');

-- Check actual data
SELECT id, is_read, is_starred, subject 
FROM data 
WHERE is_starred = true OR is_read = true
LIMIT 10;
```

## Common Issues and Solutions

### Issue 1: "Database migration required" error
**Solution**: Run the migration script in Supabase SQL Editor

### Issue 2: Star icon not visible
**Solution**: Check that the CSS classes are applied correctly (removed opacity-0)

### Issue 3: Changes not persisting
**Solution**: Check browser console for API errors, verify database permissions

### Issue 4: "Item not found" errors
**Solution**: Verify the item belongs to the authenticated user

## Success Criteria
- ✅ All star icons are visible (not just on hover)
- ✅ Starred items show filled yellow stars
- ✅ Unstarred items show gray star outlines
- ✅ Read items lose their blue dot indicator
- ✅ Changes persist after page refresh
- ✅ API endpoints return success responses
- ✅ Database correctly stores star/read states

## Technical Details

### Database Schema
The following columns should exist in the `data` table:
- `is_read`: BOOLEAN DEFAULT false
- `is_starred`: BOOLEAN DEFAULT false
- `subject`: TEXT
- `preview`: TEXT
- `source`: TEXT
- `type`: TEXT DEFAULT 'data'

### API Endpoints
- `POST /api/inbox/star` - Toggle star state
- `POST /api/inbox/read` - Mark as read
- `POST /api/inbox/read-multiple` - Mark multiple as read
- `GET /api/inbox/recent` - Get inbox items with read/star states

### Frontend Components
- Star icon in `src/app/dashboard/page.tsx`
- `useInboxData` hook handles state management
- Real-time updates via Supabase subscriptions 