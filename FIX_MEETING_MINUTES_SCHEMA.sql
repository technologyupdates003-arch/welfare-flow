-- Check and fix meeting_minutes table schema

-- 1. Check current schema
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;

-- 2. If chairperson_name or secretary_name are UUID type, convert them to TEXT
-- First, check if they exist and their type
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
AND column_name IN ('chairperson_name', 'secretary_name', 'created_by');

-- 3. If needed, alter the columns to be TEXT instead of UUID
-- This is a safe operation if the columns are empty or have text data
ALTER TABLE public.meeting_minutes
ALTER COLUMN chairperson_name TYPE VARCHAR(255) USING chairperson_name::VARCHAR(255);

ALTER TABLE public.meeting_minutes
ALTER COLUMN secretary_name TYPE VARCHAR(255) USING secretary_name::VARCHAR(255);

-- 4. Verify the fix
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
AND column_name IN ('chairperson_name', 'secretary_name', 'created_by')
ORDER BY column_name;
