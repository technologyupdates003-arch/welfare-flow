-- Complete Meeting Minutes Fix V2
-- This fixes the 400 Bad Request error when creating minutes

-- Step 1: Ensure all columns exist
ALTER TABLE public.meeting_minutes
ADD COLUMN IF NOT EXISTS chairperson_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS chairperson_signature_url TEXT,
ADD COLUMN IF NOT EXISTS secretary_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS secretary_signature_url TEXT,
ADD COLUMN IF NOT EXISTS absent_with_apology TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS absent_without_apology TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS visible_to_members TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS rejection_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submitted_by UUID,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Drop all existing RLS policies
DROP POLICY IF EXISTS "View general approved minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "View executive minutes if has role" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Admin view all minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Authenticated users can create minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Authenticated users can update minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Authenticated users can delete minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can view all minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can create minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can update minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Secretaries can delete minutes" ON public.meeting_minutes;

-- Step 3: Enable RLS
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new, working RLS policies

-- Policy 1: General meetings - anyone can view if approved
CREATE POLICY "General meetings visible when approved"
  ON public.meeting_minutes FOR SELECT
  USING (
    meeting_type = 'general' AND status = 'approved'
  );

-- Policy 2: Executive meetings - only role members can view
CREATE POLICY "Executive meetings only for role members"
  ON public.meeting_minutes FOR SELECT
  USING (
    meeting_type = 'executive' AND 
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
    )
  );

-- Policy 3: Admins can view all minutes
CREATE POLICY "Admins can view all minutes"
  ON public.meeting_minutes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Policy 4: Secretary can create minutes (no role check - just authenticated)
CREATE POLICY "Secretary can create minutes"
  ON public.meeting_minutes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Policy 5: Secretary can update minutes they created
CREATE POLICY "Secretary can update minutes"
  ON public.meeting_minutes FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Policy 6: Secretary can delete minutes they created
CREATE POLICY "Secretary can delete minutes"
  ON public.meeting_minutes FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
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

-- Step 6: Verify table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;
