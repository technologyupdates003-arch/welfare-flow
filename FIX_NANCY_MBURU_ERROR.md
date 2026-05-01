# Fix Nancy Mburu Error - Invalid UUID

## The Error
```
Invalid input syntax for type uuid: 'NANCY MBURU'
```

## Root Cause
The `user.id` from Supabase auth is returning "NANCY MBURU" (a name) instead of a UUID. This means:
1. The user object is corrupted, OR
2. The auth session is not properly initialized, OR
3. There's a mismatch between auth.users and members table

## Solution

### Step 1: Check the Issue
Run this SQL to diagnose:
```sql
-- File: CHECK_USER_AUTH_ISSUE.sql
```

This will show:
- All users in auth.users table
- Nancy's user_id in members table
- If there's a mismatch between auth and members
- If user IDs are valid UUIDs

### Step 2: Fix in Code
I've already updated `src/pages/secretary/MeetingMinutes.tsx` to:
1. Validate that `user.id` is a valid UUID
2. Throw a clear error if it's not
3. Log the invalid ID for debugging

### Step 3: Test
1. Go to Secretary Dashboard
2. Try creating a meeting minute
3. If you see "Invalid user ID" error, the auth is broken
4. If it works, the fix is complete

## What Changed in Code

**File**: `src/pages/secretary/MeetingMinutes.tsx`

Added validation:
```typescript
// Ensure we have a valid user ID (UUID format)
if (!user?.id) {
  throw new Error("User not authenticated");
}

// Validate that user.id is a UUID (not a name or other string)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(user.id)) {
  console.error("Invalid user ID format:", user.id);
  throw new Error(`Invalid user ID: ${user.id}. Expected UUID format.`);
}
```

## If Still Not Working

1. **Check browser console** for the exact error message
2. **Run diagnostic SQL** to see what's in the database
3. **Check auth session** - try logging out and back in
4. **Verify user exists** in auth.users table with a valid UUID

## Next Steps

1. The code fix is already applied
2. Try creating a meeting minute again
3. If you get "Invalid user ID" error, run the diagnostic SQL
4. Share the results for further debugging
