-- Complete fix for meeting_minutes table - add all missing columns

-- Step 1: Add all missing columns
ALTER TABLE meeting_minutes 
ADD COLUMN IF NOT EXISTS discussions TEXT,
ADD COLUMN IF NOT EXISTS absent_with_apology TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS absent_without_apology TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS chairperson_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS chairperson_signature_url TEXT,
ADD COLUMN IF NOT EXISTS secretary_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS secretary_signature_url TEXT,
ADD COLUMN IF NOT EXISTS visible_to_members TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Verify all columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'meeting_minutes' 
ORDER BY ordinal_position;
