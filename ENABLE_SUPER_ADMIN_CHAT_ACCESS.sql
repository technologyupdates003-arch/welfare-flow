-- Enable Super Admin Chat Access
-- This adds policies to allow super admins to view all member chats

-- Add policy for super admins to view all conversations
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

-- Add policy for super admins to view all messages
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

-- Add policy for super admins to view all conversation participants
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

-- Verify policies were created
SELECT 'Chat access policies created:' as info;
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
AND policyname LIKE '%Super admin%';

-- Test chat data access
SELECT 'Conversations count:' as info, COUNT(*) as count FROM conversations;
SELECT 'Messages count:' as info, COUNT(*) as count FROM messages;
SELECT 'Conversation participants count:' as info, COUNT(*) as count FROM conversation_participants;