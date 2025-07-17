# Testing Inbox API Endpoints

After running the database migration, test the following endpoints to ensure they work correctly:

## Prerequisites
1. Database migration has been run (all required columns exist)
2. User is authenticated in the browser
3. At least one data item exists in the database

## Test Cases

### 1. Test Mark as Read
Open browser dev tools and run:
```javascript
// Get the first item ID from the dashboard
const firstItemId = document.querySelector('[data-item-id]')?.getAttribute('data-item-id');

// Or use a known item ID
const itemId = 'your-item-id-here';

fetch('/api/inbox/read', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ id: itemId }),
})
.then(response => response.json())
.then(data => console.log('Mark as read result:', data));
```

### 2. Test Toggle Star
```javascript
const itemId = 'your-item-id-here';

fetch('/api/inbox/star', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ id: itemId }),
})
.then(response => response.json())
.then(data => console.log('Toggle star result:', data));
```

### 3. Test Mark Multiple as Read
```javascript
const itemIds = ['item-id-1', 'item-id-2']; // Replace with actual IDs

fetch('/api/inbox/read-multiple', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ ids: itemIds }),
})
.then(response => response.json())
.then(data => console.log('Mark multiple as read result:', data));
```

## Expected Behavior

### Success Cases
- Status 200 responses
- `{ success: true }` for read operations
- `{ success: true, starred: boolean }` for star operations
- Console logs showing the operation progress

### Error Cases
- Status 400 for missing/invalid parameters
- Status 403 for unauthorized access to items
- Status 404 for non-existent items
- Status 500 for database errors

## Debugging Output
Check the Next.js console for detailed logs:
- `🔍 Marking item ... as read for user ...`
- `🔍 Current item status: { ... }`
- `✅ Successfully marked item ... as read`
- Similar logs for star operations

## Common Issues

### 1. Database Columns Missing
Error: `Could not find the 'is_read' column of 'data' in the schema cache`
Solution: Run the database migration

### 2. Permission Errors
Error: `User does not own this item`
Solution: Verify the item belongs to the authenticated user

### 3. Item Not Found
Error: `Item not found`
Solution: Check if the item ID exists in the database

## Verification
After successful operations, check:
1. Database directly: `SELECT id, is_read, is_starred FROM data WHERE id = 'your-item-id';`
2. Dashboard UI: Items should show updated read/star status
3. Real-time updates: Changes should reflect immediately in the UI 