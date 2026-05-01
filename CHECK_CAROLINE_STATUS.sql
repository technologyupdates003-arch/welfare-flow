-- Check Caroline Wachira's complete status

-- 1. Check member record
SELECT id, name, phone, user_id 
FROM members 
WHERE phone = '+254727360233';

-- 2. Check if user_id exists in auth.users
SELECT id, phone, email 
FROM auth.users 
WHERE phone = '+254727360233';

-- 3. Check user_roles entry
SELECT * 
FROM user_roles 
WHERE user_id IN (SELECT user_id FROM members WHERE phone = '+254727360233');

-- 4. Complete join to see everything
SELECT 
  m.id as member_id,
  m.name,
  m.phone,
  m.user_id,
  au.email,
  ur.role
FROM members m
LEFT JOIN auth.users au ON m.user_id = au.id
LEFT JOIN user_roles ur ON m.user_id = ur.user_id
WHERE m.phone = '+254727360233';
