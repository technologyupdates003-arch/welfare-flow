-- Check all admin users and their current status

-- Check current roles for all three users
SELECT 'Current roles for all admin users:' as info;
SELECT user_id, role FROM user_roles 
WHERE user_id IN ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'd04abf92-cf98-480e-bb46-c9df417b7940', '51560aaf-743a-4527-9047-49ccddc76295')
ORDER BY user_id, role;

-- Check which users exist in members table
SELECT 'Members table records:' as info;
SELECT id, name, user_id, phone FROM members 
WHERE user_id IN ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'd04abf92-cf98-480e-bb46-c9df417b7940', '51560aaf-743a-4527-9047-49ccddc76295')
ORDER BY user_id;

-- Check auth.users table (if accessible)
SELECT 'Auth users:' as info;
SELECT id, email, created_at FROM auth.users 
WHERE id IN ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'd04abf92-cf98-480e-bb46-c9df417b7940', '51560aaf-743a-4527-9047-49ccddc76295')
ORDER BY id;