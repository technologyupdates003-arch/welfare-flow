-- RESTORE ADMIN ACCESS
-- Run this in your Supabase SQL Editor

-- Check current roles
SELECT 'Current roles:' as info;
SELECT user_id, role FROM user_roles WHERE user_id = '811dcfa7-74ca-47a4-a491-82f512d8ff07';

-- Add admin role if missing
INSERT INTO user_roles (user_id, role) 
VALUES ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add super_admin role if missing  
INSERT INTO user_roles (user_id, role) 
VALUES ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify roles were added
SELECT 'Roles after fix:' as info;
SELECT user_id, role FROM user_roles WHERE user_id = '811dcfa7-74ca-47a4-a491-82f512d8ff07';

-- Also check if you exist in members table
SELECT 'Member record:' as info;
SELECT id, name, user_id FROM members WHERE user_id = '811dcfa7-74ca-47a4-a491-82f512d8ff07';