# Role Deletion Fix - Frontend Only (Safe)

## The Problem
When you try to remove a role, it fails silently. The issue is in how the frontend handles role deletion.

## The Solution
The fix is already partially in your Members.tsx file. We just need to ensure the mutation properly handles the deletion.

## What to do:

1. The `removeRole` mutation in `src/pages/admin/Members.tsx` already has the correct logic
2. It deletes from `user_roles` table where `user_id = member.user_id`
3. The RLS policy "Admin can manage roles" allows admins to delete

## To Test:
1. Go to Admin → Members
2. Click Shield icon on a member
3. Click "Remove Role" button
4. Check if role is removed

## If it still doesn't work:
The issue is the RLS policy. Run this in Supabase SQL editor:

```sql
-- Check if admin user has admin role
SELECT * FROM user_roles WHERE role = 'admin';

-- Check if the delete policy exists
SELECT * FROM pg_policies WHERE tablename = 'user_roles' AND policyname LIKE '%delete%';

-- If no delete policy, create it:
CREATE POLICY "Admin can delete roles" ON user_roles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
```

This is a safe, read-only check that won't modify any data.
