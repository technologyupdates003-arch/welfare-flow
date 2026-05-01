-- COMPLETE FIX FOR ALL MEMBERS
-- This script will:
-- 1. Link all members to their auth users
-- 2. Create user_roles entries for all members
-- 3. Verify everything is set up correctly

-- STEP 1: Link all members to auth users by phone
UPDATE members m
SET user_id = au.id
FROM auth.users au
WHERE m.phone = au.phone
AND m.user_id IS NULL;

-- Verify all members now have user_id
SELECT COUNT(*) as members_without_user_id FROM members WHERE user_id IS NULL;

-- STEP 2: Create user_roles entries for members who don't have one
INSERT INTO user_roles (user_id, role)
SELECT m.user_id, 'member'
FROM members m
WHERE m.user_id NOT IN (SELECT user_id FROM user_roles)
AND m.user_id IS NOT NULL;

-- Verify all members have user_roles entries
SELECT COUNT(*) as members_without_roles 
FROM members m
WHERE m.user_id NOT IN (SELECT user_id FROM user_roles);

-- STEP 3: Verify complete setup
SELECT 
  m.id,
  m.name,
  m.phone,
  m.user_id,
  ur.role,
  CASE WHEN m.user_id IS NULL THEN 'MISSING USER_ID' 
       WHEN ur.role IS NULL THEN 'MISSING ROLE'
       ELSE 'OK' END as status
FROM members m
LEFT JOIN user_roles ur ON m.user_id = ur.user_id
ORDER BY m.name;

-- STEP 4: Show summary
SELECT 
  COUNT(*) as total_members,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as members_with_user_id,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as members_without_user_id
FROM members;

-- STEP 5: Show user_roles summary
SELECT 
  COUNT(*) as total_roles,
  COUNT(DISTINCT user_id) as users_with_roles
FROM user_roles;
