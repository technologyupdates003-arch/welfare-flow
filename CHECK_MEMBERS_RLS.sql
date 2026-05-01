-- Check RLS policies on members table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'members'
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'members';

-- Try to count members
SELECT COUNT(*) as total_members FROM members;

-- Check active members
SELECT COUNT(*) as active_members FROM members WHERE is_active = true;

-- Show first 5 members
SELECT id, name, email, phone, is_active FROM members LIMIT 5;
