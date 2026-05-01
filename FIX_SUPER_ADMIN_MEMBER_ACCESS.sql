-- Fix Super Admin Member Access
-- This adds RLS policies to allow super admins to view all members

-- Add policy for super admins to view all members
CREATE POLICY "Super admins can view all members" ON members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Add policy for super admins to view all user_roles
CREATE POLICY "Super admins can view all user roles" ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
    )
  );

-- Add policy for super admins to view all contributions
CREATE POLICY "Super admins can view all contributions" ON contributions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Add policy for super admins to view all payments
CREATE POLICY "Super admins can view all payments" ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Add policy for super admins to view all beneficiaries
CREATE POLICY "Super admins can view all beneficiaries" ON beneficiaries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Verify the policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE policyname LIKE '%super admin%' OR policyname LIKE '%Super admin%';