-- EMERGENCY: RESTORE ALL DATA ACCESS
-- This will remove the restrictive policies that are blocking data access

-- Remove the super admin policies that might be blocking access
DROP POLICY IF EXISTS "Super admins can view all members" ON members;
DROP POLICY IF EXISTS "Super admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all contributions" ON contributions;
DROP POLICY IF EXISTS "Super admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Super admins can view all beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Super admins can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Super admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Super admins can view all conversation participants" ON conversation_participants;

-- Check what data still exists
SELECT 'Members count:' as info, COUNT(*) as count FROM members;
SELECT 'Messages count:' as info, COUNT(*) as count FROM messages;
SELECT 'Conversations count:' as info, COUNT(*) as count FROM conversations;
SELECT 'User roles count:' as info, COUNT(*) as count FROM user_roles;

-- Show current user info
SELECT 'Your current user:' as info, auth.uid() as user_id;
SELECT 'Your member record:' as info;
SELECT id, name, user_id FROM members WHERE user_id = auth.uid();

-- Add admin roles to current user
INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'admin') ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'super_admin') ON CONFLICT DO NOTHING;