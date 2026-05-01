-- Query 3: Find Admin User ID
-- Run this THIRD to find your admin user

SELECT id, email FROM auth.users WHERE email LIKE '%admin%';

-- Copy the id (UUID) and use it in Query 4
