-- Check what's actually in office_bearers
SELECT 
  id,
  user_id,
  role,
  created_at
FROM office_bearers
WHERE role = 'chairperson'
LIMIT 5;

-- Check the members table for the chairperson
SELECT 
  id,
  user_id,
  name,
  phone
FROM members
WHERE name LIKE '%GITHINJI%'
LIMIT 5;
