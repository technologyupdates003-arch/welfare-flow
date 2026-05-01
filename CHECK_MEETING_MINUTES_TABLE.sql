-- Check meeting_minutes table structure and constraints

-- 1. Get full table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;

-- 2. Check for any constraints
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'meeting_minutes';

-- 3. Check for check constraints
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%meeting_minutes%';

-- 4. Check column constraints
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
AND (column_default IS NOT NULL OR is_nullable = 'NO');

-- 5. Try a minimal insert to see exact error
-- This will show us what field is causing the issue
-- Uncomment to test:
/*
INSERT INTO public.meeting_minutes (
  created_by,
  title,
  meeting_date,
  status
) VALUES (
  'test-uuid',
  'Test',
  '2026-04-24',
  'draft'
);
*/

-- 6. Check if there are any triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'meeting_minutes';

-- 7. Check the actual schema
\d public.meeting_minutes
