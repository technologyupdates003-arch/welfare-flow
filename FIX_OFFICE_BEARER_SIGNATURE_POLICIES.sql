-- Fix RLS policies for office_bearer_signatures table
-- Allow office bearers to update their own signatures

-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can view signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Admins can update signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Admins can insert signatures" ON office_bearer_signatures;
DROP POLICY IF EXISTS "Office bearers can view signatures" ON office_bearer_signatures;

-- Create new comprehensive policies

-- Policy 1: Anyone authenticated can view signatures (for display purposes)
CREATE POLICY "Anyone authenticated can view signatures" ON office_bearer_signatures
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Office bearers can update their own signature
CREATE POLICY "Office bearers can update their own signature" ON office_bearer_signatures
  FOR UPDATE
  TO authenticated
  USING (
    -- User is an admin
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
    OR
    -- User is the chairperson updating chairperson signature
    (role = 'chairperson' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'chairperson'
    ))
    OR
    -- User is the secretary updating secretary signature
    (role = 'secretary' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'secretary'
    ))
  );

-- Policy 3: Allow authenticated users to insert signatures (for upsert operations)
-- This is needed because upsert does INSERT first, then UPDATE on conflict
CREATE POLICY "Authenticated users can insert signatures" ON office_bearer_signatures
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: The table already has default records for chairperson and secretary
-- from the migration, so INSERTs will typically be UPSERTs (ON CONFLICT UPDATE)