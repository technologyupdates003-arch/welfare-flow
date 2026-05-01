# Admin Role Access Fix

## Problem
Admin users cannot see the admin dashboard after the role management updates.

## Root Cause
The new RLS policies and role filtering require that:
1. Admin role must exist in `user_roles` table
2. Admin role must have `is_active = true`
3. Admin role must not have `removed_at` timestamp set

If any of these conditions are not met, the admin cannot access their dashboard.

## Solution

### Step 1: Run the Database Migration
Run this migration to fix the RLS policies:
```sql
-- File: supabase/migrations/20260422_fix_admin_role_access.sql
```

This migration:
- Drops the overly restrictive RLS policies
- Creates new policies that allow admins to access their dashboards
- Ensures admins can view all roles (active and inactive)

### Step 2: Fix Admin Role Status
Run this SQL to ensure your admin role is active:
```sql
-- File: COMPLETE_ADMIN_ROLE_FIX.sql
```

This script:
1. Checks current admin roles
2. Marks all admin/super_admin roles as active
3. Removes any `removed_at` timestamps
4. Removes duplicate admin roles (keeps newest)
5. Verifies the fix

### Step 3: Clear Browser Cache
After running the migrations:
1. Clear your browser cache
2. Log out and log back in
3. You should now see the admin dashboard

## Verification

To verify the fix worked:

1. **Check admin role is active**:
```sql
SELECT user_id, role, is_active 
FROM user_roles 
WHERE role = 'admin' 
AND is_active = true;
```

2. **Check you can access admin routes**:
- Navigate to `/admin`
- You should see the admin dashboard
- You should see the sidebar with admin options

3. **Check role management works**:
- Go to Members page
- Click "Assign Role" on a member
- You should be able to assign/remove roles

## What Changed

### Before (Broken)
- RLS policies were too restrictive
- Admin role had to be active to view other roles
- This created a circular dependency

### After (Fixed)
- Admins can view all roles (active and inactive)
- Admins can manage roles even if they're inactive
- Admin role itself must be active to access dashboard
- Clear separation between viewing and managing roles

## Files to Run

1. **Database Migration** (Required):
   - `supabase/migrations/20260422_fix_admin_role_access.sql`

2. **Admin Role Fix** (Required):
   - `COMPLETE_ADMIN_ROLE_FIX.sql`

3. **Diagnostic Queries** (Optional):
   - `CHECK_ADMIN_ROLE_STATUS.sql` - Check current status
   - `FIX_ADMIN_ROLE_ACTIVE_STATUS.sql` - Simple fix

## Troubleshooting

### Still can't see admin dashboard?

1. **Check your role exists**:
```sql
SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';
```

2. **Check it's marked as active**:
```sql
SELECT * FROM user_roles 
WHERE user_id = 'YOUR_USER_ID' 
AND is_active = true;
```

3. **Check for duplicates**:
```sql
SELECT user_id, role, COUNT(*) 
FROM user_roles 
WHERE user_id = 'YOUR_USER_ID'
GROUP BY user_id, role
HAVING COUNT(*) > 1;
```

4. **Force refresh**:
   - Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear all cookies for the domain
   - Log out and log back in

### Still having issues?

Run the complete fix script:
```sql
-- COMPLETE_ADMIN_ROLE_FIX.sql
```

This will:
- Activate all admin roles
- Remove duplicates
- Verify everything is correct

## Prevention

To prevent this in the future:
- Always ensure admin roles are marked as `is_active = true`
- When removing a role, use soft delete (mark as inactive)
- When re-assigning a role, create a new record with `is_active = true`
- Never hard delete roles - always soft delete for audit trail
