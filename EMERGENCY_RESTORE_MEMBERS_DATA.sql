-- EMERGENCY RESTORE: Fix RLS policies to restore member data access
-- This restores the original working policies from the initial migration

-- Drop all broken policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;

-- Restore ORIGINAL working policies from 20260411151135_02adb8a3-b184-4e45-915d-b6f3edeb1348.sql
-- These are the policies that were working before
CREATE POLICY "Admin can manage roles" ON public.user_roles FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Restore members table policies
DROP POLICY IF EXISTS "Admin can manage members" ON members;
DROP POLICY IF EXISTS "Members can view own profile" ON members;

CREATE POLICY "Admin can manage members" ON public.members FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view own profile" ON public.members FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Verify data is still there
SELECT COUNT(*) as total_members FROM members;
SELECT COUNT(*) as total_roles FROM user_roles;
