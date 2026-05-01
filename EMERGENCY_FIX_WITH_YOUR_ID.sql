-- EMERGENCY FIX WITH YOUR ACTUAL USER ID
-- I can see your user ID from the error: 761880a4-6485-4231-9c5d-c1fe8ef8af9e

-- Remove the restrictive policies first
DROP POLICY IF EXISTS "Super admins can view all members" ON members;
DROP POLICY IF EXISTS "Super admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all contributions" ON contributions;
DROP POLICY IF EXISTS "Super admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Super admins can view all beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Super admins can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Super admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Super admins can view all conversation participants" ON conversation_participants;

-- Check what data exists
SELECT 'Members count:' as info, COUNT(*) as count FROM members;
SELECT 'Messages count:' as info, COUNT(*) as count FROM messages;
SELECT 'Conversations count:' as info, COUNT(*) as count FROM conversations;

-- Add admin roles to your specific user ID
INSERT INTO user_roles (user_id, role) VALUES ('761880a4-6485-4231-9c5d-c1fe8ef8af9e', 'admin') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('761880a4-6485-4231-9c5d-c1fe8ef8af9e', 'super_admin') ON CONFLICT (user_id, role) DO NOTHING;

-- Verify your roles
SELECT 'Your roles:' as info;
SELECT user_id, role FROM user_roles WHERE user_id = '761880a4-6485-4231-9c5d-c1fe8ef8af9e';

-- Check your member record
SELECT 'Your member record:' as info;
SELECT id, name, user_id FROM members WHERE user_id = '761880a4-6485-4231-9c5d-c1fe8ef8af9e';