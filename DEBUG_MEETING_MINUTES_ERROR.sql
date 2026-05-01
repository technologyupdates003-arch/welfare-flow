-- Debug Meeting Minutes Insert Error

-- First, let's check the meeting_minutes table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'meeting_minutes';

-- Check all policies on meeting_minutes
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

-- Temporarily disable RLS to test if that's the issue
-- ALTER TABLE public.meeting_minutes DISABLE ROW LEVEL SECURITY;

-- Test insert with minimal data
-- INSERT INTO public.meeting_minutes (
--   created_by,
--   title,
--   meeting_date,
--   meeting_type,
--   status
-- ) VALUES (
--   'test-user-id',
--   'Test Meeting',
--   '2026-04-24',
--   'general',
--   'draft'
-- );

-- Check if chairperson_name field has any constraints
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'meeting_minutes';

-- Check for any triggers on meeting_minutes
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'meeting_minutes';
