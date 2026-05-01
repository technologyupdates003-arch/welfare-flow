-- Drop all existing policies on meeting_minutes
DROP POLICY IF EXISTS "Secretaries can view all minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can create minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can create minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can delete minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can delete minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can update minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can update minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "View meeting minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Create meeting minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Update meeting minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Delete meeting minutes" ON meeting_minutes;

-- Disable RLS temporarily
ALTER TABLE public.meeting_minutes DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Create simple permissive policies

-- SELECT: Allow authenticated users
CREATE POLICY "Allow select" ON meeting_minutes
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Allow authenticated users with secretary role
CREATE POLICY "Allow insert" ON meeting_minutes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('secretary', 'vice_secretary', 'admin', 'chairperson', 'vice_chairperson', 'patron')
    )
  );

-- UPDATE: Allow creator or admin
CREATE POLICY "Allow update" ON meeting_minutes
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'secretary', 'vice_secretary')
    )
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'secretary', 'vice_secretary')
    )
  );

-- DELETE: Allow creator or admin
CREATE POLICY "Allow delete" ON meeting_minutes
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'secretary', 'vice_secretary')
    )
  );

-- Verify
SELECT policyname FROM pg_policies WHERE tablename = 'meeting_minutes' ORDER BY policyname;
