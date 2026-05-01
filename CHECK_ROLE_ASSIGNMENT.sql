-- Check if roles are being saved correctly

-- 1. Check all roles in user_roles table
SELECT 'All user_roles:' as debug;
SELECT id, user_id, role FROM user_roles LIMIT 20;

-- 2. Check members with their roles
SELECT 'Members with roles:' as debug;
SELECT m.id, m.name, m.phone, m.user_id, ur.role
FROM members m
LEFT JOIN user_roles ur ON m.user_id = ur.user_id
ORDER BY m.name;

-- 3. Check if there are duplicate roles for same user
SELECT 'Duplicate roles check:' as debug;
SELECT user_id, COUNT(*) as role_count
FROM user_roles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 4. Count total roles
SELECT 'Total roles count:' as debug;
SELECT COUNT(*) as total_roles FROM user_roles;
