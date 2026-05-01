-- Query 1: Add super_admin to Enum
-- Run this FIRST and wait for success

ALTER TYPE app_role ADD VALUE 'super_admin' BEFORE 'admin';
