-- MINIMAL FIX: Only add the missing DELETE policy for user_roles
-- This does NOT modify any data or existing policies

-- Drop the policy if it exists (safe to do)
DROP POLICY IF EXISTS "Admin can delete roles" ON user_roles;

-- Create the DELETE policy
CREATE POLICY "Admin can delete roles" ON user_roles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Verify the policy was created
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'user_roles' 
AND policyname = 'Admin can delete roles';
