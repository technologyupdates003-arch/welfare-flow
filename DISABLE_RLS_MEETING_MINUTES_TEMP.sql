-- TEMPORARY: Disable RLS on meeting_minutes to test if that's the issue

-- Step 1: Disable RLS completely
ALTER TABLE public.meeting_minutes DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'meeting_minutes';

-- Step 3: Now try to create a meeting minute in the app
-- If it works now, the issue is definitely RLS
-- If it still fails, the issue is with the table structure or data

-- Step 4: After testing, re-enable RLS with proper policies:
-- ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
