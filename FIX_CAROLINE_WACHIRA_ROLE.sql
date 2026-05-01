-- FIX CAROLINE WACHIRA ROLE ASSIGNMENT
-- Phone: +254727360233
-- ID: 28652984

-- STEP 1: Link Caroline to her auth user (if not already linked)
UPDATE members m
SET user_id = au.id
FROM auth.users au
WHERE m.phone = '+254727360233'
AND au.phone = '+254727360233'
AND m.user_id IS NULL;

-- STEP 2: Check if she has a user_id now
SELECT id, name, phone, user_id FROM members WHERE phone = '+254727360233';

-- STEP 3: Get her user_id (copy this value)
SELECT id FROM auth.users WHERE phone = '+254727360233';

-- STEP 4: Create user_roles entry if missing
INSERT INTO user_roles (user_id, role)
SELECT au.id, 'member'
FROM auth.users au
WHERE au.phone = '+254727360233'
AND au.id NOT IN (SELECT user_id FROM user_roles);

-- STEP 5: Assign Vice Secretary role
UPDATE user_roles
SET role = 'vice_secretary'
WHERE user_id IN (SELECT id FROM auth.users WHERE phone = '+254727360233');

-- STEP 6: Verify the fix
SELECT 
  m.id,
  m.name,
  m.phone,
  m.user_id,
  ur.role
FROM members m
LEFT JOIN user_roles ur ON m.user_id = ur.user_id
WHERE m.phone = '+254727360233';

-- STEP 7: Verify in auth.users
SELECT id, phone, email FROM auth.users WHERE phone = '+254727360233';
