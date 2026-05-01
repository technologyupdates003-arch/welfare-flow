-- Simple Fix for Meeting Minutes RLS
-- The issue: RLS policies are blocking secretary from inserting minutes

-- Step 1: Drop all problematic policies
DROP POLICY IF EXISTS "General meetings visible when approved" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Executive meetings only for role members" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Admins and secretaries can view all minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Only admins and secretaries can manage minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Only admins and secretaries can update minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Only admins and secretaries can delete minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Secretary can create minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Secretary can update minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Secretary can delete minutes" ON public.meeting_minutes;

-- Step 2: Enable RLS
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple, working policies

-- Policy 1: Anyone can view general approved minutes
CREATE POLICY "View general approved minutes"
  ON public.meeting_minutes FOR SELECT
  USING (
    meeting_type = 'general' AND status = 'approved'
  );

-- Policy 2: Only role members can view executive minutes
CREATE POLICY "View executive minutes if has role"
  ON public.meeting_minutes FOR SELECT
  USING (
    meeting_type = 'executive' AND 
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
    )
  );

-- Policy 3: Admins can view all minutes
CREATE POLICY "Admin view all minutes"
  ON public.meeting_minutes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Policy 4: Anyone authenticated can INSERT (secretary creates minutes)
CREATE POLICY "Authenticated users can create minutes"
  ON public.meeting_minutes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 5: Anyone authenticated can UPDATE their own minutes
CREATE POLICY "Authenticated users can update minutes"
  ON public.meeting_minutes FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Policy 6: Anyone authenticated can DELETE their own minutes
CREATE POLICY "Authenticated users can delete minutes"
  ON public.meeting_minutes FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Verify policies
SELECT 
  policyname,
  permissive,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'meeting_minutes'
ORDER BY policyname;
