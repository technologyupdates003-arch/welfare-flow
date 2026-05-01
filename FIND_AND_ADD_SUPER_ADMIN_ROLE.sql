-- Step 1: Find your admin user ID
-- Run this first and copy the ID from the results

SELECT id, email FROM auth.users WHERE email LIKE '%admin%' OR email LIKE '%@welfare.local';

-- Step 2: Copy the ID from above results (it looks like: 069f60a0-84a4-431e-97a8-297b703226d0)
-- Then run the command below, replacing the ID with your actual ID

-- EXAMPLE (replace with your actual ID):
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('069f60a0-84a4-431e-97a8-297b703226d0', 'super_admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: After you get your ID, uncomment and modify the line above
-- Or create a new query with your actual ID