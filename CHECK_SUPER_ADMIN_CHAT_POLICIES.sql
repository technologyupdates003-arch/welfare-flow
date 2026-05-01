-- Check Super Admin Chat Access Policies
-- Verify that super admin has access to view messages and conversations

-- Check existing policies for messages, conversations, and conversation_participants
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as has_qual
FROM pg_policies
WHERE tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY tablename, policyname;

-- Check if super_admin role exists in user_roles
SELECT DISTINCT role 
FROM user_roles 
WHERE role = 'super_admin';

-- Test: Check if current user has super_admin role
SELECT 
  ur.user_id,
  ur.role,
  m.name as member_name
FROM user_roles ur
LEFT JOIN members m ON m.user_id = ur.user_id
WHERE ur.role = 'super_admin';

-- If policies don't exist, this will show what needs to be created
-- Otherwise, the policies are already in place and should work
