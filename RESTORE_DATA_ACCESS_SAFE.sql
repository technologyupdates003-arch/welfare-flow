-- SAFE RESTORE: Only restore RLS policies, do NOT modify tables or data
-- This uses the ORIGINAL working policies from 20260411151135

-- Step 1: Drop ALL broken policies on user_roles (be careful here)
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Super admin full access to user_roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all user roles" ON user_roles;

-- Step 2: Recreate ONLY the original two working policies
-- These are from 20260411151135 and were working before
CREATE POLICY "Admin can manage roles" ON public.user_roles FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Step 3: Verify data exists
SELECT 'Members count: ' || COUNT(*) FROM members;
SELECT 'User roles count: ' || COUNT(*) FROM user_roles;
