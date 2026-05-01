-- Apply all meeting minutes workflow changes
-- Run this in Supabase SQL Editor

-- 1. First apply the workflow fields
\i ADD_MINUTES_WORKFLOW_FIELDS.sql

-- 2. Then fix the signature policies (choose one)
-- Option A: Simple permissive policies (recommended for testing)
\i SIMPLE_FIX_SIGNATURE_POLICIES.sql

-- OR Option B: More restrictive policies (for production)
-- \i FIX_OFFICE_BEARER_SIGNATURE_POLICIES.sql

-- 3. Verify the changes
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('meeting_minutes', 'office_bearer_signatures')
ORDER BY tablename, policyname;