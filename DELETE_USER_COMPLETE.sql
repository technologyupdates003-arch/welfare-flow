-- Complete User Deletion Script
-- This script deletes a user and all their related data from the system
-- Replace 'PHONE_NUMBER' with the actual phone number (e.g., '+254712345678')

-- Step 1: Find the user ID by phone number
-- Run this first to get the user_id
SELECT id, phone FROM auth.users WHERE phone = '+254712345678';

-- Step 2: Delete all related data (replace USER_ID with the actual ID from step 1)
-- This deletes in the correct order to avoid foreign key conflicts

-- Delete beneficiaries
DELETE FROM beneficiaries 
WHERE member_id IN (
  SELECT id FROM members WHERE user_id = 'USER_ID'
);

-- Delete user roles
DELETE FROM user_roles 
WHERE user_id = 'USER_ID';

-- Delete meeting minutes created by this user
DELETE FROM meeting_minutes 
WHERE created_by = 'USER_ID';

-- Delete member record
DELETE FROM members 
WHERE user_id = 'USER_ID';

-- Delete the auth user (this is the final step)
DELETE FROM auth.users 
WHERE id = 'USER_ID';

-- Verify deletion
SELECT COUNT(*) as remaining_members FROM members WHERE user_id = 'USER_ID';
SELECT COUNT(*) as remaining_users FROM auth.users WHERE id = 'USER_ID';
