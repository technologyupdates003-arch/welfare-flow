-- Simple fix for office_bearer_signatures RLS policies
-- This allows upsert operations to work for chairperson and secretary

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Admins can update signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Admins can insert signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Office bearers can view signatures" ON office_bearer_signatures;

-- Create new policies that work with upsert operations

-- 1. Allow anyone authenticated to view signatures (for display)
CREATE POLICY "Anyone authenticated can view signatures" ON office_bearer_signatures
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Allow office bearers and admins to manage signatures
-- This policy allows UPDATE operations for authenticated users
-- The application logic will control who can update what
CREATE POLICY "Office bearers and admins can manage signatures" ON office_bearer_signatures
  FOR ALL
  TO authenticated
  USING (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
    OR
    -- Allow if user is chairperson AND updating chairperson record
    (role = 'chairperson' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'chairperson'
    ))
    OR
    -- Allow if user is secretary AND updating secretary record
    (role = 'secretary' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'secretary'
    ))
  )
  WITH CHECK (
    -- Same conditions for INSERT/UPDATE
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
    OR
    (role = 'chairperson' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'chairperson'
    ))
    OR
    (role = 'secretary' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'secretary'
    ))
  );

-- Note: The application should still validate that users only update
-- their own signature records, but this policy makes upsert work