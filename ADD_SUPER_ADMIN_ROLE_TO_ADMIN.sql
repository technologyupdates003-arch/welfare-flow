-- ============================================================================
-- Add super_admin role to existing admin user
-- This allows admin to access both admin and super admin dashboards
-- ============================================================================

-- Step 1: Find the admin user ID (replace with actual admin email if needed)
-- Run this query first to get the user_id:
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Step 2: Add super_admin role to admin user
-- Replace 'ADMIN_USER_ID_HERE' with the actual user ID from Step 1
INSERT INTO user_roles (user_id, role)
VALUES ('ADMIN_USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify the role was added
SELECT user_id, role FROM user_roles WHERE user_id = 'ADMIN_USER_ID_HERE';

-- ============================================================================
-- DONE! Admin user now has both admin and super_admin roles
-- ============================================================================
-- After running this:
-- 1. Log out and log back in
-- 2. You should see both "Admin Dashboard" and "Super Admin" buttons
-- 3. Click "Super Admin" to access super admin dashboard
-- 4. Click "Admin Dashboard" to go back to admin dashboard
-- ============================================================================
