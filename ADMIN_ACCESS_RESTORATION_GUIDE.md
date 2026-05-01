# Admin Access Restoration Guide

## Problem
You cannot see the admin dashboard. The error shows that the `is_active` column doesn't exist in the `user_roles` table.

## Root Cause
The migration that adds the `is_active` column hasn't been run yet. The code was updated to use this column, but the database schema wasn't updated.

## Solution

### Step 1: Revert Code Changes (Already Done ✅)
The code has been reverted to work without the `is_active` column:
- `src/lib/auth.tsx` - Removed `is_active` filter
- `src/pages/admin/Members.tsx` - Removed `is_active` update
- Build successful ✅

### Step 2: Check Your Admin Role
Run this SQL query to check if you have an admin role:

```sql
SELECT user_id, role FROM user_roles WHERE role IN ('admin', 'super_admin');
```

**If this returns results**: Your admin role exists, just refresh the page
**If this returns nothing**: You need to add your admin role (see Step 3)

### Step 3: Add Admin Role (If Needed)
If Step 2 returned nothing, run these queries:

**First, find your user ID:**
```sql
SELECT id as user_id, name, phone FROM members LIMIT 5;
```

**Then add your admin role (replace YOUR_USER_ID):**
```sql
INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');
```

### Step 4: Verify and Refresh
1. Run this to verify:
```sql
SELECT user_id, role FROM user_roles WHERE role = 'admin';
```

2. Then:
   - Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
   - Log out and log back in
   - You should now see the admin dashboard

## Quick Steps Summary

1. **Run diagnostic query:**
   ```sql
   SELECT user_id, role FROM user_roles WHERE role IN ('admin', 'super_admin');
   ```

2. **If no results, find your user ID:**
   ```sql
   SELECT id as user_id, name, phone FROM members LIMIT 5;
   ```

3. **Add admin role:**
   ```sql
   INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');
   ```

4. **Refresh browser and log back in**

## What Was Changed

### Code Changes (Reverted)
- Removed `is_active` column requirement from auth context
- Removed `is_active` column requirement from role management
- Code now works with existing schema

### Database Changes (Not Yet Applied)
- The migration `20260421_fix_role_access_and_executive_minutes.sql` adds `is_active` column
- This migration is optional and can be applied later
- For now, the system works without it

## Future: Apply the Full Migration

When you're ready, you can apply the full migration to add soft delete capability:

```sql
-- File: supabase/migrations/20260421_fix_role_access_and_executive_minutes.sql
```

This will add:
- `is_active` boolean column to track active roles
- `removed_at` timestamp to track when roles were removed
- Better audit trail for role changes

## Troubleshooting

### Still can't see admin dashboard?

1. **Check browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear cookies for the domain
   - Try incognito/private window

2. **Check your role:**
   ```sql
   SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';
   ```

3. **Check if you're a member:**
   ```sql
   SELECT * FROM members WHERE user_id = 'YOUR_USER_ID';
   ```

4. **Check auth logs:**
   - Go to Supabase dashboard
   - Check Authentication logs for your user

### Role exists but still can't access?

1. Log out completely
2. Clear all cookies
3. Close browser completely
4. Reopen and log back in

## Files to Use

- **Immediate Fix**: `IMMEDIATE_ADMIN_ACCESS_FIX.sql`
- **Simple Fix**: `SIMPLE_ADMIN_ACCESS_FIX.sql`
- **Full Migration** (optional): `supabase/migrations/20260421_fix_role_access_and_executive_minutes.sql`

## Support

If you're still having issues:
1. Run `IMMEDIATE_ADMIN_ACCESS_FIX.sql` and share the results
2. Check that your user ID matches between `members` and `user_roles` tables
3. Verify you have exactly one admin role (not duplicates)
