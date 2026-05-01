-- Nuclear option: Recreate meeting_minutes table with correct schema

-- Step 1: Backup existing data
CREATE TABLE meeting_minutes_backup AS SELECT * FROM public.meeting_minutes;

-- Step 2: Drop the old table
DROP TABLE IF EXISTS public.meeting_minutes CASCADE;

-- Step 3: Recreate with correct schema
CREATE TABLE public.meeting_minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_type VARCHAR(50) DEFAULT 'general',
  attendees TEXT[] DEFAULT ARRAY[]::TEXT[],
  agenda TEXT,
  discussions TEXT,
  decisions TEXT,
  action_items TEXT,
  next_meeting_date DATE,
  status VARCHAR(50) DEFAULT 'draft',
  chairperson_name VARCHAR(255),
  chairperson_signature_url TEXT,
  secretary_name VARCHAR(255),
  secretary_signature_url TEXT,
  absent_with_apology TEXT[] DEFAULT ARRAY[]::TEXT[],
  absent_without_apology TEXT[] DEFAULT ARRAY[]::TEXT[],
  visible_to_members TEXT[] DEFAULT ARRAY[]::TEXT[],
  rejection_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX idx_meeting_minutes_created_by ON public.meeting_minutes(created_by);
CREATE INDEX idx_meeting_minutes_meeting_date ON public.meeting_minutes(meeting_date);
CREATE INDEX idx_meeting_minutes_status ON public.meeting_minutes(status);
CREATE INDEX idx_meeting_minutes_type ON public.meeting_minutes(meeting_type);

-- Step 5: Enable RLS
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "General meetings visible when approved"
  ON public.meeting_minutes FOR SELECT
  USING (meeting_type = 'general' AND status = 'approved');

CREATE POLICY "Executive meetings only for role members"
  ON public.meeting_minutes FOR SELECT
  USING (
    meeting_type = 'executive' AND 
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all minutes"
  ON public.meeting_minutes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Authenticated users can create minutes"
  ON public.meeting_minutes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update minutes"
  ON public.meeting_minutes FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete minutes"
  ON public.meeting_minutes FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Step 7: Verify
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;
