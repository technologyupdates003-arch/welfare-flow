-- FIX CURRENT LOGGED IN USER TO BE ADMIN
-- This will make whoever runs this query an admin and super_admin

-- Add admin role to current user
INSERT INTO user_roles (user_id, role) 
VALUES (auth.uid(), 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add super_admin role to current user
INSERT INTO user_roles (user_id, role) 
VALUES (auth.uid(), 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Show confirmation
SELECT 'SUCCESS: You now have admin access!' as message;
SELECT 'Your user ID:' as info, auth.uid() as user_id;
SELECT 'Your roles:' as info;
SELECT user_id, role FROM user_roles WHERE user_id = auth.uid();