-- COMPLETE SUPER ADMIN FIX
-- Run this in your Supabase SQL Editor

-- 1. Restore roles for all admin users
INSERT INTO user_roles (user_id, role) VALUES 
('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'admin'),
('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'super_admin'),
('d04abf92-cf98-480e-bb46-c9df417b7940', 'admin'),
('d04abf92-cf98-480e-bb46-c9df417b7940', 'super_admin'),
('51560aaf-743a-4527-9047-49ccddc76295', 'admin'),
('51560aaf-743a-4527-9047-49ccddc76295', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Super admins can view all members" ON members;
  DROP POLICY IF EXISTS "Super admins can view all user roles" ON user_roles;
  DROP POLICY IF EXISTS "Super admins can view all contributions" ON contributions;
  DROP POLICY IF EXISTS "Super admins can view all payments" ON payments;
  DROP POLICY IF EXISTS "Super admins can view all beneficiaries" ON beneficiaries;
  DROP POLICY IF EXISTS "Super admins can view all conversations" ON conversations;
  DROP POLICY IF EXISTS "Super admins can view all messages" ON messages;
  DROP POLICY IF EXISTS "Super admins can view all conversation participants" ON conversation_participants;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create new policies for super admin access
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

CREATE POLICY "Super admins can view all conversations" ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view all messages" ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view all conversation participants" ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 3. Verify everything is working for all users
SELECT 'All admin user roles:' as info;
SELECT user_id, role FROM user_roles 
WHERE user_id IN ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'd04abf92-cf98-480e-bb46-c9df417b7940', '51560aaf-743a-4527-9047-49ccddc76295')
ORDER BY user_id, role;

SELECT 'Member count you can see:' as info;
SELECT COUNT(*) as member_count FROM members;

SELECT 'Policies created:' as info;
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE policyname LIKE '%Super admin%' OR policyname LIKE '%super admin%';