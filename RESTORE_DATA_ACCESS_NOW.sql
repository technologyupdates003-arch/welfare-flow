-- EMERGENCY: Restore all data access by disabling RLS temporarily

-- Disable RLS on user_roles to see all data
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on members to see all data
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Verify data is still there
SELECT 'Members count:' as check_name, COUNT(*) as count FROM members;
SELECT 'Roles count:' as check_name, COUNT(*) as count FROM user_roles;

-- Now recreate SIMPLE policies that allow admin access
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Drop all old policies
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admin can delete roles" ON user_roles;

-- Create PERMISSIVE policies (allow by default)
-- Everyone can read user_roles
CREATE POLICY "Anyone can read roles"
  ON user_roles FOR SELECT
  USING (true);

-- Admins can write user_roles
CREATE POLICY "Admins can write roles"
  ON user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update user_roles
CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete user_roles
CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Members table - everyone can read
CREATE POLICY "Anyone can read members"
  ON members FOR SELECT
  USING (true);

-- Admins can manage members
CREATE POLICY "Admins can manage members"
  ON members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );
