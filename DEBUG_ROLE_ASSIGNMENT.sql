-- Debug: Check if roles are actually being saved

-- 1. Check all user_roles
SELECT 'All user_roles:' as debug;
SELECT id, user_id, role FROM user_roles LIMIT 20;

-- 2. Check members and their roles
SELECT 'Members with roles:' as debug;
SELECT m.id, m.name, m.phone, ur.role 
FROM members m
LEFT JOIN user_roles ur ON m.user_id = ur.user_id
ORDER BY m.name;

-- 3. Check if there are any roles at all
SELECT 'Total roles count:' as debug;
SELECT COUNT(*) as total_roles FROM user_roles;

-- 4. Check if members have user_id
SELECT 'Members with user_id:' as debug;
SELECT id, name, phone, user_id FROM members WHERE user_id IS NOT NULL LIMIT 10;
