-- QUICK FIX: Activate all admin roles
-- Run this immediately to regain admin access

-- Step 1: Activate all admin and super_admin roles
UPDATE user_roles 
SET is_active = true, removed_at = NULL
WHERE role IN ('admin', 'super_admin');

-- Step 2: Verify it worked
SELECT 
  'Admin Roles Status' as check_name,
  user_id,
  role,
  is_active,
  removed_at
FROM user_roles 
WHERE role IN ('admin', 'super_admin');

-- If you still can't access, check if your role exists at all:
-- SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';
