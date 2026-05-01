-- Fix RLS policies to allow secretaries and other roles to read user_roles for executive minutes

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Create a new policy that allows:
-- 1. Users to see their own role
-- 2. Admins/super_admins to see all roles
-- 3. Secretaries/Chairpersons to see all roles (for executive minutes)
CREATE POLICY "Users can view roles for executive minutes"
  ON user_roles FOR SELECT
  USING (
    -- Users can see their own role
    auth.uid() = user_id
    OR
    -- Admins and super_admins can see all roles
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
    OR
    -- Secretaries and chairpersons can see all roles (for executive minutes)
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('secretary', 'vice_secretary', 'chairperson', 'vice_chairperson')
    )
  );

-- Keep the other policies as they are
-- Verify the policy exists
SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view roles for executive minutes';
