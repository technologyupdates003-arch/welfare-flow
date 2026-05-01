-- Check all constraints and triggers on meeting_minutes
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'meeting_minutes'
ORDER BY constraint_name;

-- Check for triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'meeting_minutes'
ORDER BY trigger_name;

-- Check column defaults
SELECT 
  column_name,
  column_default,
  data_type
FROM information_schema.columns
WHERE table_name = 'meeting_minutes'
ORDER BY ordinal_position;
