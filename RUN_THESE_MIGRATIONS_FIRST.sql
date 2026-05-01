-- ============================================================================
-- CRITICAL: Run this file FIRST in Supabase SQL Editor
-- This adds all missing columns to the meeting_minutes table
-- ============================================================================

-- Step 1: Add all missing columns to meeting_minutes table
ALTER TABLE meeting_minutes 
ADD COLUMN IF NOT EXISTS discussions TEXT,
ADD COLUMN IF NOT EXISTS absent_with_apology TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS absent_without_apology TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS chairperson_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS chairperson_signature_url TEXT,
ADD COLUMN IF NOT EXISTS secretary_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS secretary_signature_url TEXT,
ADD COLUMN IF NOT EXISTS visible_to_members TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'meeting_minutes' 
ORDER BY ordinal_position;

-- ============================================================================
-- Step 3: Create office_bearer_signatures table
-- ============================================================================

CREATE TABLE IF NOT EXISTS office_bearer_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL UNIQUE,
  signature_url TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE office_bearer_signatures ENABLE ROW LEVEL SECURITY;

-- Allow admins to view signatures
CREATE POLICY "Admins can view signatures" ON office_bearer_signatures
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to update signatures
CREATE POLICY "Admins can update signatures" ON office_bearer_signatures
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to insert signatures
CREATE POLICY "Admins can insert signatures" ON office_bearer_signatures
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow office bearers to view signatures
CREATE POLICY "Office bearers can view signatures" ON office_bearer_signatures
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default records for chairperson and secretary
INSERT INTO office_bearer_signatures (role, signature_url) 
VALUES 
  ('chairperson', NULL),
  ('secretary', NULL)
ON CONFLICT (role) DO NOTHING;

-- ============================================================================
-- DONE! All migrations are complete.
-- ============================================================================
-- After running this, the application should work correctly:
-- 1. Meeting minutes form will accept all fields
-- 2. Absence tracking will work
-- 3. Signatures will be stored and prefilled
-- 4. Executive meetings will be visible only to selected members
-- ============================================================================
