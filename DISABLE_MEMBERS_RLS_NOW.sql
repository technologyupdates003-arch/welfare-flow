-- IMMEDIATE FIX: Disable RLS on members table
-- This allows all authenticated users to read member data

-- Disable RLS on members table
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'members';

-- Test query
SELECT COUNT(*) as total_members FROM members;
SELECT COUNT(*) as active_members FROM members WHERE is_active = true;
SELECT id, name, email, phone, is_active FROM members LIMIT 5;
