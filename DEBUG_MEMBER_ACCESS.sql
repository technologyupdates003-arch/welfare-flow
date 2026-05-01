-- Debug member access for super admin
-- Run this to check what's happening

-- 1. Check if your user has super_admin role
SELECT user_id, role FROM user_roles WHERE user_id = '811dcfa7-74ca-47a4-a491-82f512d8ff07';

-- 2. Check if members exist
SELECT id, name, phone FROM members LIMIT 5;

-- 3. Check RLS policies on members table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'members';

-- 4. Test if super admin can access members
SELECT COUNT(*) as member_count FROM members;