-- Ensure all required columns exist in meeting_minutes table

-- Add missing columns if they don't exist
ALTER TABLE public.meeting_minutes
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'general' CHECK (meeting_type IN ('general', 'executive')),
ADD COLUMN IF NOT EXISTS attendees TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS agenda TEXT,
ADD COLUMN IF NOT EXISTS discussions TEXT,
ADD COLUMN IF NOT EXISTS decisions TEXT,
ADD COLUMN IF NOT EXISTS action_items TEXT,
ADD COLUMN IF NOT EXISTS next_meeting_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS chairperson_name TEXT,
ADD COLUMN IF NOT EXISTS chairperson_signature_url TEXT,
ADD COLUMN IF NOT EXISTS secretary_name TEXT,
ADD COLUMN IF NOT EXISTS secretary_signature_url TEXT,
ADD COLUMN IF NOT EXISTS absent_with_apology TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS absent_without_apology TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visible_to_members TEXT[] DEFAULT '{}';

-- Verify all columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;

-- Check if we can insert now
-- Try a test insert
INSERT INTO public.meeting_minutes (
  created_by,
  title,
  meeting_date,
  meeting_type,
  status
) VALUES (
  auth.uid(),
  'Test Meeting',
  CURRENT_DATE,
  'general',
  'draft'
)
ON CONFLICT DO NOTHING;

-- If that worked, check the record
SELECT 
  id,
  title,
  meeting_date,
  meeting_type,
  status,
  created_at
FROM public.meeting_minutes
ORDER BY created_at DESC
LIMIT 1;
