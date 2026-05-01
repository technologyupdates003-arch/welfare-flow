-- Simple Admin Access Fix - No new columns needed
-- This works with the current schema

-- Step 1: Check if you have an admin role
SELECT user_id, role FROM user_roles WHERE role IN ('admin', 'super_admin');

-- Step 2: If no admin role exists, you need to create one
-- Replace 'YOUR_USER_ID' with your actual user ID from the query above
-- INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');

-- Step 3: Check all your roles
SELECT user_id, role FROM user_roles WHERE user_id = (SELECT user_id FROM members LIMIT 1);

-- Step 4: Verify admin role exists and is correct
SELECT * FROM user_roles WHERE role = 'admin';
