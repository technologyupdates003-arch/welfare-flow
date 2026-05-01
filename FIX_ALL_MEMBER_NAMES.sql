-- Fix all member names - remove special characters and normalize
UPDATE members
SET name = TRIM(REGEXP_REPLACE(name, '[^\w\s\-\.]', '', 'g'))
WHERE name ~ '[^\w\s\-\.]';

-- Check members with roles to see their names
SELECT 
  m.id,
  m.name,
  m.phone,
  ur.role,
  LENGTH(m.name) as name_length,
  m.name::bytea as name_bytes
FROM members m
INNER JOIN user_roles ur ON m.user_id = ur.user_id
WHERE ur.role IN ('chairperson', 'secretary', 'vice_chairperson', 'vice_secretary')
ORDER BY ur.role, m.name;
