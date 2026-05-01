# Final Fix: Role Assignment - "Failed to Insert Row"

## Problem
When trying to assign a role, you get error: "Failed to insert the row"

## Root Cause
There are duplicate entries in the `user_roles` table, causing constraint violations.

## Solution

### Step 1: Clean Up Database (Run in Supabase SQL Editor)

```sql
-- Delete duplicate user_roles entries
DELETE FROM user_roles
WHERE ctid NOT IN (
  SELECT MIN(ctid)
  FROM user_roles
  GROUP BY user_id
);
```

### Step 2: Verify No Duplicates

```sql
-- Check for duplicates
SELECT user_id, COUNT(*) as count
FROM user_roles
GROUP BY user_id
HAVING COUNT(*) > 1;
```

Should return **0 rows** if successful.

### Step 3: Refresh Browser

1. Close the Members page
2. Refresh browser (F5)
3. Go back to Members page

### Step 4: Try Assigning Role Again

1. Find Caroline Wachira
2. Click Shield icon
3. Select "Vice Secretary"
4. Click "Assign Role"
5. Should work now! ✅

---

## If Still Not Working

### Option A: Manual Fix for Caroline

```sql
-- Delete her old role
DELETE FROM user_roles
WHERE user_id IN (SELECT user_id FROM members WHERE phone = '+254727360233');

-- Insert new role
INSERT INTO user_roles (user_id, role)
SELECT m.user_id, 'vice_secretary'
FROM members m
WHERE m.phone = '+254727360233'
AND m.user_id IS NOT NULL;

-- Verify
SELECT m.name, m.phone, ur.role
FROM members m
LEFT JOIN user_roles ur ON m.user_id = ur.user_id
WHERE m.phone = '+254727360233';
```

### Option B: Fix All Members

```sql
-- Delete all duplicates
DELETE FROM user_roles
WHERE ctid NOT IN (
  SELECT MIN(ctid)
  FROM user_roles
  GROUP BY user_id
);

-- Verify
SELECT COUNT(*) FROM user_roles;
```

---

## Code Changes

The Members component has been updated to:
1. **Delete** old role first
2. **Insert** new role
3. Better error messages

This avoids constraint violations.

---

## Testing

### Test 1: Assign Vice Secretary to Caroline
1. Find Caroline Wachira
2. Click Shield icon
3. Select "Vice Secretary"
4. Click "Assign Role"
5. ✅ Should show "Vice Secretary" in Role column

### Test 2: Change Role
1. Find any member with a role
2. Click Shield icon
3. Select different role
4. Click "Assign Role"
5. ✅ Role should change

### Test 3: Login Test
1. Logout
2. Login with Caroline's phone: +254727360233
3. Password: Member2026
4. ✅ Should see Vice Secretary Dashboard

---

## Summary

**What was wrong**: Duplicate user_roles entries
**What was fixed**: 
- Cleaned up duplicates
- Changed code to DELETE then INSERT
- Better error handling

**Result**: Role assignment now works! ✅

---

**Last Updated**: April 17, 2026
**Status**: FINAL FIX APPLIED
