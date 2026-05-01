-- EMERGENCY: Restore all access - disable RLS temporarily to verify data exists

-- Disable RLS on all tables
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_minutes DISABLE ROW LEVEL SECURITY;

-- Verify data is still there
SELECT COUNT(*) as members_count FROM members;
SELECT COUNT(*) as roles_count FROM user_roles;
SELECT COUNT(*) as minutes_count FROM meeting_minutes;

-- Re-enable RLS with PERMISSIVE policies (allow by default)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Drop ALL old policies
DROP POLICY IF EXISTS "Users can view roles for executive minutes" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can read roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can write roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;

-- Create SIMPLE PERMISSIVE policies - ALLOW EVERYTHING by default
-- Everyone can read user_roles
CREATE POLICY "read_user_roles"
  ON user_roles FOR SELECT
  USING (true);

-- Only admins can write user_roles
CREATE POLICY "write_user_roles"
  ON user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can update user_roles
CREATE POLICY "update_user_roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete user_roles
CREATE POLICY "delete_user_roles"
  ON user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Members table - everyone can read
CREATE POLICY "read_members"
  ON members FOR SELECT
  USING (true);

-- Only admins can write members
CREATE POLICY "write_members"
  ON members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can update members
CREATE POLICY "update_members"
  ON members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete members
CREATE POLICY "delete_members"
  ON members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Meeting minutes - everyone can read
CREATE POLICY "read_meeting_minutes"
  ON meeting_minutes FOR SELECT
  USING (true);

-- Only secretaries/admins can write
CREATE POLICY "write_meeting_minutes"
  ON meeting_minutes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'secretary', 'vice_secretary')
    )
  );

-- Only secretaries/admins can update
CREATE POLICY "update_meeting_minutes"
  ON meeting_minutes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'secretary', 'vice_secretary')
    )
  );
