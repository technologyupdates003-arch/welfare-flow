-- Complete Admin Role Fix
-- This script fixes the admin role access issue

-- Step 1: Check current admin roles
SELECT 
  'Current Admin Roles' as step,
  user_id,
  role,
  is_active,
  removed_at
FROM user_roles 
WHERE role IN ('admin', 'super_admin')
ORDER BY created_at DESC;

-- Step 2: Ensure all admin/super_admin roles are active
UPDATE user_roles 
SET is_active = true, removed_at = NULL
WHERE role IN ('admin', 'super_admin');

-- Step 3: Verify the fix
SELECT 
  'After Fix - Admin Roles' as step,
  user_id,
  role,
  is_active,
  removed_at
FROM user_roles 
WHERE role IN ('admin', 'super_admin')
ORDER BY created_at DESC;

-- Step 4: Check if there are any duplicate admin roles (keep only one per user)
SELECT 
  'Duplicate Check' as step,
  user_id,
  role,
  COUNT(*) as count
FROM user_roles 
WHERE role IN ('admin', 'super_admin')
GROUP BY user_id, role
HAVING COUNT(*) > 1;

-- Step 5: If duplicates exist, delete the older ones (keep the newest)
DELETE FROM user_roles 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM user_roles 
  WHERE role IN ('admin', 'super_admin')
  GROUP BY user_id, role
)
AND role IN ('admin', 'super_admin');

-- Step 6: Final verification
SELECT 
  'Final Verification' as step,
  user_id,
  role,
  is_active,
  created_at
FROM user_roles 
WHERE role IN ('admin', 'super_admin')
ORDER BY created_at DESC;
