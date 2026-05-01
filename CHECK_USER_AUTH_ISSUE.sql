-- Check User Authentication Issue
-- The error "Invalid input syntax for type uuid: 'NANCY MBURU'" suggests
-- that user.id is returning a name instead of a UUID

-- 1. Check all users in auth.users table
SELECT 
  id,
  email,
  phone,
  created_at
FROM auth.users
LIMIT 10;

-- 2. Check members table and their user_id
SELECT 
  id,
  name,
  phone,
  user_id
FROM public.members
WHERE name LIKE '%NANCY%' OR name LIKE '%nancy%'
LIMIT 5;

-- 3. Check if there's a mismatch between auth.users and members
SELECT 
  m.name,
  m.user_id,
  CASE 
    WHEN au.id IS NULL THEN 'NO AUTH USER'
    ELSE 'OK'
  END as auth_status
FROM public.members m
LEFT JOIN auth.users au ON au.id = m.user_id
WHERE m.name LIKE '%NANCY%' OR m.name LIKE '%nancy%';

-- 4. Check user_roles for Nancy
SELECT 
  ur.user_id,
  ur.role,
  m.name
FROM public.user_roles ur
LEFT JOIN public.members m ON m.user_id = ur.user_id
WHERE m.name LIKE '%NANCY%' OR m.name LIKE '%nancy%';

-- 5. Verify the UUID format of user IDs
SELECT 
  id,
  LENGTH(id::text) as id_length,
  CASE 
    WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'VALID UUID'
    ELSE 'INVALID UUID'
  END as id_format
FROM auth.users
LIMIT 10;
