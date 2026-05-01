-- IMMEDIATE FIX: Change column types from UUID to VARCHAR/TEXT
-- Run this directly in Supabase SQL Editor

-- First, check what we're dealing with
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'meeting_minutes' 
AND column_name IN ('chairperson_name', 'secretary_name', 'chairperson_signature_url', 'secretary_signature_url');

-- Drop the UUID columns
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS chairperson_name CASCADE;
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS secretary_name CASCADE;
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS chairperson_signature_url CASCADE;
ALTER TABLE public.meeting_minutes DROP COLUMN IF EXISTS secretary_signature_url CASCADE;

-- Recreate with correct types
ALTER TABLE public.meeting_minutes ADD COLUMN chairperson_name VARCHAR(255);
ALTER TABLE public.meeting_minutes ADD COLUMN chairperson_signature_url TEXT;
ALTER TABLE public.meeting_minutes ADD COLUMN secretary_name VARCHAR(255);
ALTER TABLE public.meeting_minutes ADD COLUMN secretary_signature_url TEXT;

-- Verify the fix
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'meeting_minutes' 
AND column_name IN ('chairperson_name', 'secretary_name', 'chairperson_signature_url', 'secretary_signature_url')
ORDER BY column_name;
