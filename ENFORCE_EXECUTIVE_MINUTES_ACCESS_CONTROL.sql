-- Enforce Executive Minutes Access Control
-- This ensures that ONLY members with roles can see executive minutes

-- First, verify the meeting_minutes table has the meeting_type column
ALTER TABLE public.meeting_minutes 
ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'general' CHECK (meeting_type IN ('general', 'executive'));

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Anyone can view approved general minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Only role members can view executive minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Members can view approved general minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Members with roles can view executive minutes" ON public.meeting_minutes;

-- Enable RLS on meeting_minutes if not already enabled
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Policy 1: General meetings - anyone can view if approved
CREATE POLICY "General meetings visible when approved"
  ON public.meeting_minutes FOR SELECT
  USING (
    meeting_type = 'general' AND status = 'approved'
  );

-- Policy 2: Executive meetings - ONLY users with roles can view
CREATE POLICY "Executive meetings only for role members"
  ON public.meeting_minutes FOR SELECT
  USING (
    meeting_type = 'executive' AND 
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'chairperson', 'vice_chairperson', 'secretary', 'vice_secretary', 'patron')
    )
  );

-- Policy 3: Admins and secretaries can view all minutes (for management)
CREATE POLICY "Admins and secretaries can view all minutes"
  ON public.meeting_minutes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'secretary')
    )
  );

-- Policy 4: Only admins and secretaries can create/update/delete minutes
CREATE POLICY "Only admins and secretaries can manage minutes"
  ON public.meeting_minutes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'secretary', 'chairperson')
    )
  );

CREATE POLICY "Only admins and secretaries can update minutes"
  ON public.meeting_minutes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'secretary', 'chairperson')
    )
  );

CREATE POLICY "Only admins and secretaries can delete minutes"
  ON public.meeting_minutes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'secretary', 'chairperson')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_type ON public.meeting_minutes(meeting_type);
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_status ON public.meeting_minutes(status);
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_meeting_type_status ON public.meeting_minutes(meeting_type, status);

-- Verify the policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'meeting_minutes'
ORDER BY policyname;
