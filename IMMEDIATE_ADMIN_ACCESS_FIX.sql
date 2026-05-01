-- IMMEDIATE FIX: Restore Admin Access
-- Run this NOW to regain admin access

-- Step 1: Check if you have an admin role
SELECT 'Step 1: Check Admin Role' as step;
SELECT user_id, role FROM user_roles WHERE role IN ('admin', 'super_admin');

-- Step 2: If the query above returns nothing, you need to add your admin role
-- First, find your user ID
SELECT 'Step 2: Find Your User ID' as step;
SELECT id as user_id, name, phone FROM members LIMIT 5;

-- Step 3: Add admin role (replace YOUR_USER_ID with your actual user ID from Step 2)
-- Uncomment and run this if you don't have an admin role:
-- INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');

-- Step 4: Verify admin role now exists
SELECT 'Step 4: Verify Admin Role' as step;
SELECT user_id, role FROM user_roles WHERE role IN ('admin', 'super_admin');

-- Step 5: Check all your roles
SELECT 'Step 5: Your Roles' as step;
SELECT user_id, role FROM user_roles WHERE user_id IN (
  SELECT user_id FROM members WHERE name LIKE '%' LIMIT 1
);
