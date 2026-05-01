-- Quick User Deletion - Replace values with your data

-- STEP 1: Find user by phone number
-- Replace '+254712345678' with the actual phone number
SELECT id, phone, email FROM auth.users WHERE phone = '+254712345678';

-- Copy the ID from the result above and use it in the queries below

-- STEP 2: Delete all related data (replace 'USER_ID_HERE' with actual ID)

-- Delete beneficiaries
DELETE FROM beneficiaries 
WHERE member_id IN (SELECT id FROM members WHERE user_id = 'USER_ID_HERE');

-- Delete user roles
DELETE FROM user_roles WHERE user_id = 'USER_ID_HERE';

-- Delete meeting minutes
DELETE FROM meeting_minutes WHERE created_by = 'USER_ID_HERE';

-- Delete member record
DELETE FROM members WHERE user_id = 'USER_ID_HERE';

-- Delete auth user
DELETE FROM auth.users WHERE id = 'USER_ID_HERE';

-- VERIFY: Check if deleted
SELECT * FROM members WHERE user_id = 'USER_ID_HERE';
SELECT * FROM auth.users WHERE id = 'USER_ID_HERE';
