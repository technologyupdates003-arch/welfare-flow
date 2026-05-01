-- Add all missing absence tracking columns to meeting_minutes table
ALTER TABLE meeting_minutes 
ADD COLUMN IF NOT EXISTS absent_with_apology TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Verify all required columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'meeting_minutes' 
ORDER BY ordinal_position;
