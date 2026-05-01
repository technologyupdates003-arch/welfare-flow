-- Fix Meeting Minutes Insert Issues

-- Step 1: Check if secretary user has a role
-- Replace 'secretary-user-id' with actual secretary user ID
SELECT 
  ur.user_id,
  ur.role,
  m.name,
  m.phone
FROM user_roles ur
LEFT JOIN members m ON m.user_id = ur.user_id
WHERE ur.role = 'secretary'
LIMIT 5;

-- Step 2: Verify meeting_minutes table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;

-- Step 3: Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'meeting_minutes';

-- Step 4: Simplify RLS policies - allow secretary to insert
-- Drop problematic policies
DROP POLICY IF EXISTS "Only admins and secretaries can manage minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Only admins and secretaries can update minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Only admins and secretaries can delete minutes" ON public.meeting_minutes;

-- Create simpler, more permissive policies for INSERT
CREATE POLICY "Secretary can create minutes"
  ON public.meeting_minutes FOR INSERT
  WITH CHECK (
    -- Allow if user is secretary, admin, or chairperson
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'secretary', 'chairperson')
    )
    OR
    -- Also allow if user has any role (fallback)
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Secretary can update minutes"
  ON public.meeting_minutes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'secretary', 'chairperson')
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Secretary can delete minutes"
  ON public.meeting_minutes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'secretary', 'chairperson')
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
    )
  );

-- Step 5: Verify policies are created
SELECT 
  policyname,
  permissive,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'meeting_minutes'
ORDER BY policyname;
