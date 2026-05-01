-- Fix meeting_minutes table - add missing columns and fix RLS policies

-- Step 1: Add all missing columns
ALTER TABLE meeting_minutes 
ADD COLUMN IF NOT EXISTS discussions TEXT,
ADD COLUMN IF NOT EXISTS chairperson_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS chairperson_signature_url TEXT,
ADD COLUMN IF NOT EXISTS secretary_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS secretary_signature_url TEXT;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Secretaries can view all minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can view all minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Members can view approved minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can create minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can create minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can update minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can update minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can delete minutes" ON meeting_minutes;
DROP POLICY IF EXISTS "Office bearers can delete minutes" ON meeting_minutes;

-- Step 3: Create new comprehensive policies

-- SELECT: Office bearers can view all minutes, members can view approved
CREATE POLICY "View meeting minutes" ON meeting_minutes
  FOR SELECT
  TO authenticated
  USING (
    status = 'approved' OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('secretary', 'vice_secretary', 'admin', 'chairperson', 'vice_chairperson', 'patron')
    )
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

-- UPDATE: Office bearers can update minutes
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
  );

-- DELETE: Office bearers can delete minutes
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
