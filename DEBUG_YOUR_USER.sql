-- DEBUG YOUR CURRENT USER
-- This will help us find your actual user ID and current roles

-- 1. Show your current authenticated user ID
SELECT 'Your current user ID:' as info, auth.uid() as user_id;

-- 2. Check if you have any roles at all
SELECT 'Your current roles:' as info;
SELECT user_id, role FROM user_roles WHERE user_id = auth.uid();

-- 3. Check if you exist in members table
SELECT 'Your member record:' as info;
SELECT id, name, user_id, phone FROM members WHERE user_id = auth.uid();

-- 4. Check all roles in the system (to see if the roles were added)
SELECT 'All user roles in system:' as info;
SELECT user_id, role FROM user_roles ORDER BY user_id LIMIT 20;

-- 5. Check if the three user IDs we tried to fix exist
SELECT 'Status of the three user IDs we tried to fix:' as info;
SELECT user_id, role FROM user_roles 
WHERE user_id IN ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'd04abf92-cf98-480e-bb46-c9df417b7940', '51560aaf-743a-4527-9047-49ccddc76295')
ORDER BY user_id, role;