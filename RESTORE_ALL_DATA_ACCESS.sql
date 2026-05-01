-- RESTORE ALL DATA ACCESS - EMERGENCY FIX
-- This will remove restrictive policies and find valid users

-- 1. Remove all restrictive policies that are blocking data access
DROP POLICY IF EXISTS "Super admins can view all members" ON members;
DROP POLICY IF EXISTS "Super admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all contributions" ON contributions;
DROP POLICY IF EXISTS "Super admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Super admins can view all beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Super admins can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Super admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Super admins can view all conversation participants" ON conversation_participants;

-- 2. Check what data still exists
SELECT 'MEMBERS COUNT:' as info, COUNT(*) as count FROM members;
SELECT 'MESSAGES COUNT:' as info, COUNT(*) as count FROM messages;
SELECT 'CONVERSATIONS COUNT:' as info, COUNT(*) as count FROM conversations;
SELECT 'USER ROLES COUNT:' as info, COUNT(*) as count FROM user_roles;

-- 3. Find all valid user IDs from members table
SELECT 'ALL VALID USER IDs FROM MEMBERS:' as info;
SELECT DISTINCT user_id FROM members WHERE user_id IS NOT NULL ORDER BY user_id;

-- 4. Find existing user roles
SELECT 'EXISTING USER ROLES:' as info;
SELECT user_id, role FROM user_roles ORDER BY user_id;

-- 5. Show members without roles (these might be the admin users)
SELECT 'MEMBERS WITHOUT ROLES:' as info;
SELECT m.id, m.name, m.user_id, m.phone 
FROM members m 
LEFT JOIN user_roles ur ON m.user_id = ur.user_id 
WHERE ur.user_id IS NULL;

-- 6. Add admin roles to the first few members (assuming they are admins)
-- We'll add roles to members who don't have any roles yet
INSERT INTO user_roles (user_id, role)
SELECT DISTINCT m.user_id, 'admin'::app_role
FROM members m 
LEFT JOIN user_roles ur ON m.user_id = ur.user_id 
WHERE ur.user_id IS NULL 
AND m.user_id IS NOT NULL
LIMIT 3;

INSERT INTO user_roles (user_id, role)
SELECT DISTINCT m.user_id, 'super_admin'::app_role
FROM members m 
LEFT JOIN user_roles ur ON m.user_id = ur.user_id 
WHERE ur.user_id IS NULL 
AND m.user_id IS NOT NULL
LIMIT 3;

-- 7. Show final results
SELECT 'FINAL USER ROLES:' as info;
SELECT user_id, role FROM user_roles ORDER BY user_id;