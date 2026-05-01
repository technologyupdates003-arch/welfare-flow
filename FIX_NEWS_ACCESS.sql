-- Fix News Access - Allow members to view news

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Members can view published news" ON news;
DROP POLICY IF EXISTS "Public can view published news" ON news;
DROP POLICY IF EXISTS "Anyone can view published news" ON news;
DROP POLICY IF EXISTS "Authenticated users can view news" ON news;

-- Create simple policy: All authenticated users can view all news
CREATE POLICY "Authenticated users can view news" 
ON news 
FOR SELECT 
TO authenticated 
USING (true);

-- Verify: Check if policy was created
SELECT * FROM pg_policies WHERE tablename = 'news';
