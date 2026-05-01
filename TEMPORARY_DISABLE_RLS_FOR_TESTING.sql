-- TEMPORARY: Disable RLS on meeting_minutes to test if that's the issue
-- This is for debugging only - we'll re-enable it after testing

ALTER TABLE public.meeting_minutes DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'meeting_minutes';

-- Now try to create a test minute
-- Go to the app and try creating a meeting minute
-- If it works now, the issue is with RLS policies
-- If it still fails, the issue is with the data or table structure

-- After testing, re-enable RLS with:
-- ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
