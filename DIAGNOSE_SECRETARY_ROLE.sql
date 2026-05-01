-- Diagnose Secretary Role Issue

-- Step 1: Check if current user (secretary) has a role
-- This will help us understand why the insert is failing

-- Get all secretaries
SELECT 
  ur.user_id,
  ur.role,
  m.name,
  m.phone,
  m.user_id as member_user_id
FROM user_roles ur
LEFT JOIN members m ON m.user_id = ur.user_id
WHERE ur.role = 'secretary'
ORDER BY m.name;

-- Step 2: Check if there are any users without roles
SELECT 
  m.id,
  m.name,
  m.phone,
  m.user_id,
  CASE 
    WHEN ur.user_id IS NULL THEN 'NO ROLE'
    ELSE ur.role
  END as role_status
FROM members m
LEFT JOIN user_roles ur ON ur.user_id = m.user_id
WHERE m.user_id IS NOT NULL
ORDER BY m.name;

-- Step 3: Check meeting_minutes table for any existing records
SELECT 
  id,
  title,
  meeting_date,
  meeting_type,
  status,
  created_by,
  chairperson_name,
  secretary_name
FROM public.meeting_minutes
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Check if RLS is blocking inserts
-- Try a test insert (this will fail if RLS blocks it)
-- Uncomment to test:
/*
INSERT INTO public.meeting_minutes (
  created_by,
  title,
  meeting_date,
  meeting_type,
  status,
  chairperson_name,
  secretary_name
) VALUES (
  auth.uid(),
  'Test Meeting',
  '2026-04-24',
  'general',
  'draft',
  'Test Chairperson',
  'Test Secretary'
);
*/

-- Step 5: Check all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'meeting_minutes'
ORDER BY policyname;
