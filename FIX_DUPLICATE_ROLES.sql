-- FIX: Failed to insert row - Duplicate or constraint violation

-- STEP 1: Check for duplicate user_roles entries
SELECT user_id, role, COUNT(*) as count
FROM user_roles
GROUP BY user_id, role
HAVING COUNT(*) > 1;

-- STEP 2: Check if Caroline already has a role entry
SELECT * FROM user_roles 
WHERE user_id IN (SELECT user_id FROM members WHERE phone = '+254727360233');

-- STEP 3: Delete duplicate user_roles entries (keep only one)
DELETE FROM user_roles
WHERE ctid NOT IN (
  SELECT MIN(ctid)
  FROM user_roles
  GROUP BY user_id
);

-- STEP 4: Verify no duplicates remain
SELECT user_id, COUNT(*) as count
FROM user_roles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- STEP 5: Now try to update Caroline's role (DELETE then INSERT)
-- First delete her current role
DELETE FROM user_roles
WHERE user_id IN (SELECT user_id FROM members WHERE phone = '+254727360233');

-- Then insert the new role
INSERT INTO user_roles (user_id, role)
SELECT m.user_id, 'vice_secretary'
FROM members m
WHERE m.phone = '+254727360233'
AND m.user_id IS NOT NULL;

-- STEP 6: Verify
SELECT 
  m.id, m.name, m.phone, m.user_id, ur.role
FROM members m
LEFT JOIN user_roles ur ON m.user_id = ur.user_id
WHERE m.phone = '+254727360233';
