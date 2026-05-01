-- FORCE FIX: Check and fix column types
-- First check what type they are
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
AND column_name IN ('chairperson_name', 'secretary_name')
ORDER BY column_name;

-- If they show as 'uuid', run this fix:
-- Drop them completely (CASCADE removes dependencies)
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS chairperson_name CASCADE;
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS secretary_name CASCADE;

-- Add them back as VARCHAR
ALTER TABLE public.meeting_minutes ADD COLUMN chairperson_name VARCHAR(255);
ALTER TABLE public.meeting_minutes ADD COLUMN secretary_name VARCHAR(255);

-- Verify
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
AND column_name IN ('chairperson_name', 'secretary_name')
ORDER BY column_name;
