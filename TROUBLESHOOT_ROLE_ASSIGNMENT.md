# Troubleshooting: Role Assignment Not Working

## Problem
When assigning a role to an existing member, it shows "No Role" or the role doesn't take effect.

## Root Cause
The member might not have a `user_id` linked to their record, or the role assignment is failing silently.

## How to Debug

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try assigning a role
4. Look for error messages like:
   - "Member must have a user account to assign roles"
   - "Failed to assign role"
   - Other error details

### Step 2: Check Database
Run this SQL in Supabase SQL Editor:

```sql
-- Check if member has user_id
SELECT id, name, phone, user_id FROM members WHERE name = 'MEMBER_NAME';
```

If `user_id` is NULL, that's the problem!

### Step 3: Fix Missing user_id

If the member doesn't have a user_id:

```sql
-- Find the auth user by phone
SELECT id, phone FROM auth.users WHERE phone = '+254727360233';

-- Copy the ID and update the member record
UPDATE members 
SET user_id = 'PASTE_USER_ID_HERE'
WHERE phone = '+254727360233';

-- Verify
SELECT id, name, phone, user_id FROM members WHERE phone = '+254727360233';
```

### Step 4: Check user_roles Table

```sql
-- Check if user_roles entry exists
SELECT * FROM user_roles WHERE user_id = 'USER_ID';

-- If empty, create one
INSERT INTO user_roles (user_id, role) 
VALUES ('USER_ID', 'vice_secretary');
```

### Step 5: Verify Role Assignment

```sql
-- Check the complete setup
SELECT 
  m.id,
  m.name,
  m.phone,
  m.user_id,
  ur.role
FROM members m
LEFT JOIN user_roles ur ON m.user_id = ur.user_id
WHERE m.phone = '+254727360233';
```

## Common Issues & Solutions

### Issue 1: "Member must have a user account"
**Cause**: Member record has no user_id
**Solution**: Link user_id using SQL above

### Issue 2: Role shows in table but user sees wrong dashboard
**Cause**: User is still logged in with old session
**Solution**: User needs to logout and login again

### Issue 3: Role assignment succeeds but doesn't show in table
**Cause**: Page not refreshed or query cache not invalidated
**Solution**: Refresh the page (F5)

### Issue 4: Error in console about RLS policies
**Cause**: RLS policies might be blocking the insert
**Solution**: Check RLS policies in Supabase dashboard

## Complete Fix Process

If role assignment is completely broken:

1. **Check member has user_id**
   ```sql
   SELECT id, name, user_id FROM members WHERE user_id IS NULL;
   ```

2. **Link missing user_ids**
   ```sql
   UPDATE members m
   SET user_id = au.id
   FROM auth.users au
   WHERE m.phone = au.phone
   AND m.user_id IS NULL;
   ```

3. **Check user_roles entries**
   ```sql
   SELECT COUNT(*) FROM user_roles;
   ```

4. **Create missing user_roles**
   ```sql
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'member' FROM auth.users
   WHERE id NOT IN (SELECT user_id FROM user_roles);
   ```

5. **Test role assignment**
   - Go to Members page
   - Try assigning a role
   - Check console for errors
   - Verify in database

## Testing After Fix

1. **Assign a role**
   - Find member
   - Click Shield icon
   - Select role
   - Click "Assign Role"

2. **Check Members table**
   - Role column should show the role

3. **Test login**
   - Logout
   - Login with member's phone
   - Should see role-specific dashboard

## Still Not Working?

1. Check browser console for exact error
2. Run the SQL queries above to verify database state
3. Check Supabase RLS policies
4. Check Supabase function logs
5. Try refreshing the page

---

**Last Updated**: April 17, 2026
**Status**: Troubleshooting Guide
