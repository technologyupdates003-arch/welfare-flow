-- Simple check for Nancy Mburu's user ID

-- 1. Find Nancy in members table
SELECT 
  id,
  name,
  phone,
  user_id
FROM public.members
WHERE name ILIKE '%nancy%' OR name ILIKE '%mburu%'
LIMIT 5;

-- 2. Check if Nancy's user_id exists in auth.users
SELECT 
  m.name,
  m.user_id,
  au.id as auth_user_id,
  au.email,
  CASE 
    WHEN au.id IS NULL THEN 'NO AUTH USER - PROBLEM!'
    ELSE 'OK'
  END as status
FROM public.members m
LEFT JOIN auth.users au ON au.id = m.user_id
WHERE m.name ILIKE '%nancy%' OR m.name ILIKE '%mburu%';

-- 3. Check Nancy's role
SELECT 
  ur.user_id,
  ur.role,
  m.name
FROM public.user_roles ur
LEFT JOIN public.members m ON m.user_id = ur.user_id
WHERE m.name ILIKE '%nancy%' OR m.name ILIKE '%mburu%';

-- 4. Show all auth users (to see what's there)
SELECT 
  id,
  email,
  phone,
  created_at
FROM auth.users
LIMIT 20;
