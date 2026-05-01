-- Proper fix for chairperson_name and secretary_name columns

-- Step 1: Check current column types
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
AND column_name IN ('chairperson_name', 'secretary_name', 'chairperson_signature_url', 'secretary_signature_url');

-- Step 2: Drop the problematic columns if they exist
ALTER TABLE public.meeting_minutes
DROP COLUMN IF EXISTS chairperson_name CASCADE;

ALTER TABLE public.meeting_minutes
DROP COLUMN IF EXISTS secretary_name CASCADE;

ALTER TABLE public.meeting_minutes
DROP COLUMN IF EXISTS chairperson_signature_url CASCADE;

ALTER TABLE public.meeting_minutes
DROP COLUMN IF EXISTS secretary_signature_url CASCADE;

-- Step 3: Recreate them with correct types
ALTER TABLE public.meeting_minutes
ADD COLUMN chairperson_name VARCHAR(255);

ALTER TABLE public.meeting_minutes
ADD COLUMN chairperson_signature_url TEXT;

ALTER TABLE public.meeting_minutes
ADD COLUMN secretary_name VARCHAR(255);

ALTER TABLE public.meeting_minutes
ADD COLUMN secretary_signature_url TEXT;

-- Step 4: Verify the fix
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
AND column_name IN ('chairperson_name', 'secretary_name', 'chairperson_signature_url', 'secretary_signature_url')
ORDER BY column_name;
