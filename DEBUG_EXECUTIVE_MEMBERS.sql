-- Debug: Check if executive members query returns data

-- 1. Check all user_roles with their members
SELECT 'All user_roles with members:' as debug;
SELECT ur.user_id, ur.role, m.name, m.phone
FROM user_roles ur
LEFT JOIN members m ON ur.user_id = m.user_id
ORDER BY ur.role, m.name;

-- 2. Check specific roles (what executiveMembers query looks for)
SELECT 'Executive roles (chairperson, vice_chairperson, secretary, vice_secretary, patron):' as debug;
SELECT ur.user_id, ur.role, m.name, m.phone
FROM user_roles ur
LEFT JOIN members m ON ur.user_id = m.user_id
WHERE ur.role IN ('chairperson', 'vice_chairperson', 'secretary', 'vice_secretary', 'patron')
ORDER BY ur.role, m.name;

-- 3. Count by role
SELECT 'Count by role:' as debug;
SELECT role, COUNT(*) as count
FROM user_roles
WHERE role IN ('chairperson', 'vice_chairperson', 'secretary', 'vice_secretary', 'patron')
GROUP BY role;

-- 4. Check if members have user_id
SELECT 'Members with user_id:' as debug;
SELECT id, name, phone, user_id
FROM members
WHERE user_id IS NOT NULL
LIMIT 10;
