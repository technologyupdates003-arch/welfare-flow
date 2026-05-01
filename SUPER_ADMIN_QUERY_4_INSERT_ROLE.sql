-- Query 4: Add Super Admin Role to Admin User
-- Run this FOURTH (replace YOUR_ADMIN_ID with the ID from Query 3)

INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_ADMIN_ID', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify it was added
SELECT user_id, role FROM user_roles WHERE user_id = 'YOUR_ADMIN_ID';
