-- Final fix for signature storage - allow secretary and chairperson to store signatures
-- This policy is more permissive to ensure signatures can be saved

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Admins can view signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Admins can update signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Admins can insert signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Office bearers can view signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Anyone authenticated can view signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Office bearers and admins can manage signatures" ON office_bearer_signatures;

-- Create simple, permissive policies for signature storage

-- 1. Anyone authenticated can view signatures (for display in minutes)
CREATE POLICY "View signatures policy" ON office_bearer_signatures
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Allow secretary to update secretary signature
CREATE POLICY "Secretary can manage secretary signature" ON office_bearer_signatures
  FOR ALL
  TO authenticated
  USING (
    -- Check if user is secretary AND this is the secretary record
    (role = 'secretary' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'secretary'
    ))
  )
  WITH CHECK (
    -- Same condition for INSERT/UPDATE
    (role = 'secretary' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'secretary'
    ))
  );

-- 3. Allow chairperson to update chairperson signature  
CREATE POLICY "Chairperson can manage chairperson signature" ON office_bearer_signatures
  FOR ALL
  TO authenticated
  USING (
    -- Check if user is chairperson AND this is the chairperson record
    (role = 'chairperson' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'chairperson'
    ))
  )
  WITH CHECK (
    -- Same condition for INSERT/UPDATE
    (role = 'chairperson' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'chairperson'
    ))
  );

-- 4. Allow admins to manage all signatures
CREATE POLICY "Admins can manage all signatures" ON office_bearer_signatures
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Make sure default records exist
INSERT INTO office_bearer_signatures (role, signature_url) 
VALUES 
  ('chairperson', NULL),
  ('secretary', NULL)
ON CONFLICT (role) DO NOTHING;