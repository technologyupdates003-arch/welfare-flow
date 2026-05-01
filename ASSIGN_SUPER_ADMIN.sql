-- Assign Super Admin Role to a User
-- Replace 'user_email@example.com' with the actual email of the user you want to make super admin

-- First, find the user ID by email
-- SELECT id, email FROM auth.users WHERE email = 'user_email@example.com';

-- Then assign super admin role (replace the UUID with the actual user ID)
-- INSERT INTO user_roles (user_id, role, assigned_at, assigned_by)
-- VALUES (
--   'USER_UUID_HERE',  -- Replace with actual user UUID
--   'super_admin',
--   NOW(),
--   'USER_UUID_HERE'   -- Replace with actual user UUID (self-assigned initially)
-- );

-- Example usage:
-- 1. Find user: SELECT id, email FROM auth.users WHERE email = 'admin@example.com';
-- 2. Copy the user ID
-- 3. Run: INSERT INTO user_roles (user_id, role, assigned_at, assigned_by) VALUES ('copied-uuid', 'super_admin', NOW(), 'copied-uuid');

-- Verify the assignment:
-- SELECT ur.role, au.email, ur.assigned_at 
-- FROM user_roles ur 
-- JOIN auth.users au ON ur.user_id = au.id 
-- WHERE ur.role = 'super_admin';

-- Quick assign template (uncomment and modify):
/*
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get user ID by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'REPLACE_WITH_EMAIL@example.com';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found with that email';
    END IF;
    
    -- Remove any existing role
    DELETE FROM user_roles WHERE user_id = target_user_id;
    
    -- Assign super admin role
    INSERT INTO user_roles (user_id, role, assigned_at, assigned_by)
    VALUES (target_user_id, 'super_admin', NOW(), target_user_id);
    
    RAISE NOTICE 'Super admin role assigned to user: %', target_user_id;
END $$;
*/