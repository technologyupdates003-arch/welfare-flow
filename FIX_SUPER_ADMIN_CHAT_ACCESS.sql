-- Fix Super Admin Chat Access
-- Ensure super admin can view all messages and conversations

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY tablename, policyname;

-- Drop any conflicting policies and recreate
DROP POLICY IF EXISTS "Super admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Super admins can view all conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Super admin full access to messages" ON messages;
DROP POLICY IF EXISTS "Super admin full access to conversations" ON conversations;

-- Create super admin policies for messages
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

-- Create super admin policies for conversations
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

-- Create super admin policies for conversation_participants
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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('messages', 'conversations', 'conversation_participants')
  AND policyname LIKE '%Super admin%'
ORDER BY tablename, policyname;
