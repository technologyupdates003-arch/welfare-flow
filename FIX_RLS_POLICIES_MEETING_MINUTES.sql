-- Fix RLS policies for meeting_minutes to allow inserts with all fields

-- Drop all existing policies
DROP POLICY IF EXISTS "Secretaries can view all minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can create minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can create minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can delete minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can delete minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can update minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can update minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "View meeting minutes" ON meeting_minutes;

-- Create new simplified policies

-- SELECT: Office bearers see all, members see approved or visible to them
CREATE POLICY "View meeting minutes" ON meeting_minutes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('secretary', 'vice_secretary', 'admin', 'chairperson', 'vice_chairperson', 'patron')
    )
    OR status = 'approved'
  );

-- INSERT: Office bearers can create minutes
CREATE POLICY "Create meeting minutes" ON meeting_minutes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('secretary', 'vice_secretary', 'admin', 'chairperson', 'vice_chairperson', 'patron')
    )
  );

-- UPDATE: Creator or admin can update
CREATE POLICY "Update meeting minutes" ON meeting_minutes
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'secretary', 'vice_secretary', 'chairperson', 'vice_chairperson', 'patron')
    )
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'secretary', 'vice_secretary', 'chairperson', 'vice_chairperson', 'patron')
    )
  );

-- DELETE: Creator or admin can delete
CREATE POLICY "Delete meeting minutes" ON meeting_minutes
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'secretary', 'vice_secretary', 'chairperson', 'vice_chairperson', 'patron')
    )
  );

-- Verify policies
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'meeting_minutes'
ORDER BY policyname;
