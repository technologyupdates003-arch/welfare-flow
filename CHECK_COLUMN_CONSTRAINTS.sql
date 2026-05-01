-- Check all columns and their constraints
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;
