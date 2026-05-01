-- Check members without user_id
SELECT id, name, phone, user_id FROM members WHERE user_id IS NULL;

-- If you find members without user_id, you need to link them to auth users
-- First, find the auth user by phone
SELECT id, phone FROM auth.users WHERE phone = '+254727360233';

-- Then update the member record with the user_id
UPDATE members 
SET user_id = 'USER_ID_FROM_AUTH_USERS'
WHERE phone = '+254727360233';

-- Verify the update
SELECT id, name, phone, user_id FROM members WHERE phone = '+254727360233';

-- Check if user_roles entry exists
SELECT * FROM user_roles WHERE user_id = 'USER_ID_FROM_AUTH_USERS';

-- If no user_roles entry, create one
INSERT INTO user_roles (user_id, role) 
VALUES ('USER_ID_FROM_AUTH_USERS', 'vice_secretary');

-- Verify
SELECT ur.user_id, ur.role, m.name, m.phone 
FROM user_roles ur
JOIN members m ON m.user_id = ur.user_id
WHERE ur.user_id = 'USER_ID_FROM_AUTH_USERS';
