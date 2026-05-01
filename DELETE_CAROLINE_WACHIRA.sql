-- Delete Caroline Wachira - Complete Removal
-- Name: CAROLINE WACHIRA
-- ID Number: 28652984
-- Phone: +254727360233
-- Email: User254727360233@welfare.local
-- UID: 599f5086-4404-4e65-9744-6d07c868ba01

-- STEP 1: Delete beneficiaries
DELETE FROM beneficiaries 
WHERE member_id IN (SELECT id FROM members WHERE user_id = '599f5086-4404-4e65-9744-6d07c868ba01');

-- STEP 2: Delete user roles
DELETE FROM user_roles WHERE user_id = '599f5086-4404-4e65-9744-6d07c868ba01';

-- STEP 3: Delete meeting minutes
DELETE FROM meeting_minutes WHERE created_by = '599f5086-4404-4e65-9744-6d07c868ba01';

-- STEP 4: Delete member record
DELETE FROM members WHERE user_id = '599f5086-4404-4e65-9744-6d07c868ba01';

-- STEP 5: Delete auth user
DELETE FROM auth.users WHERE id = '599f5086-4404-4e65-9744-6d07c868ba01';

-- VERIFY: Check if deleted
SELECT COUNT(*) as members_remaining FROM members WHERE user_id = '599f5086-4404-4e65-9744-6d07c868ba01';
SELECT COUNT(*) as users_remaining FROM auth.users WHERE id = '599f5086-4404-4e65-9744-6d07c868ba01';
