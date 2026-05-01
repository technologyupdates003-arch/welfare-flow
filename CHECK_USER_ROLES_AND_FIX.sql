-- Check and fix user roles for dashboard access
-- Replace YOUR_USER_ID with your actual user ID

-- 1. Check current roles for your user
SELECT user_id, role FROM user_roles WHERE user_id = '811dcfa7-74ca-47a4-a491-82f512d8ff07';

-- 2. Check if you exist in members table
SELECT id, name, user_id FROM members WHERE user_id = '811dcfa7-74ca-47a4-a491-82f512d8ff07';

-- 3. Add back admin role if missing
INSERT INTO user_roles (user_id, role) 
VALUES ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Add back super_admin role if missing
INSERT INTO user_roles (user_id, role) 
VALUES ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Verify roles were added
SELECT user_id, role FROM user_roles WHERE user_id = '811dcfa7-74ca-47a4-a491-82f512d8ff07';