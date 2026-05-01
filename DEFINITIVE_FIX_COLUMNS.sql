-- DEFINITIVE FIX: Properly fix the column types
-- This will work even if columns are UUID type

-- Step 1: Disable RLS temporarily to avoid policy issues
ALTER TABLE public.meeting_minutes DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop the problematic columns completely
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS chairperson_name CASCADE;
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS secretary_name CASCADE;
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS chairperson_signature_url CASCADE;
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS secretary_signature_url CASCADE;

-- Step 3: Add them back with CORRECT types (VARCHAR and TEXT, not UUID)
ALTER TABLE public.meeting_minutes 
ADD COLUMN chairperson_name VARCHAR(255),
ADD COLUMN chairperson_signature_url TEXT,
ADD COLUMN secretary_name VARCHAR(255),
ADD COLUMN secretary_signature_url TEXT;

-- Step 4: Re-enable RLS
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify the fix
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
AND column_name IN ('chairperson_name', 'secretary_name', 'chairperson_signature_url', 'secretary_signature_url')
ORDER BY column_name;
