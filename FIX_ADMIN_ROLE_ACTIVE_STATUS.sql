-- Fix admin role active status
-- This script ensures all admin and super_admin roles are marked as active

-- First, check what we have
SELECT user_id, role, is_active FROM user_roles WHERE role IN ('admin', 'super_admin');

-- Update any inactive admin/super_admin roles to be active
UPDATE user_roles 
SET is_active = true, removed_at = NULL
WHERE role IN ('admin', 'super_admin') 
AND is_active = false;

-- Verify the fix
SELECT user_id, role, is_active FROM user_roles WHERE role IN ('admin', 'super_admin');
