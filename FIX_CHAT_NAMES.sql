-- Fix Chat Names - FINAL WORKING VERSION
-- Run this in Supabase SQL Editor

-- STEP 1: Check which users are sending messages but have no member record
SELECT DISTINCT 
    m.user_id,
    au.email,
    mem.name as current_name,
    CASE 
        WHEN mem.name IS NULL THEN '❌ MISSING'
        ELSE '✅ EXISTS'
    END as status
FROM messages m
LEFT JOIN auth.users au ON au.id = m.user_id
LEFT JOIN members mem ON mem.user_id = m.user_id
ORDER BY status;

-- STEP 2: Auto-create member records for missing users
DO $$
DECLARE
    missing_user RECORD;
    counter INT := 1;
    existing_member UUID;
BEGIN
    FOR missing_user IN 
        SELECT DISTINCT m.user_id, au.email
        FROM messages m
        LEFT JOIN members mem ON mem.user_id = m.user_id
        LEFT JOIN auth.users au ON au.id = m.user_id
        WHERE mem.id IS NULL
    LOOP
        -- Check if member already exists
        SELECT id INTO existing_member 
        FROM members 
        WHERE user_id = missing_user.user_id;
        
        -- Only insert if doesn't exist
        IF existing_member IS NULL THEN
            INSERT INTO members (
                user_id, 
                name, 
                phone, 
                member_id, 
                is_active,
                total_contributions,
                total_penalties
            )
            VALUES (
                missing_user.user_id,
                COALESCE(SPLIT_PART(missing_user.email, '@', 1), 'User ' || counter),
                '0700000000',
                'MEM' || LPAD(counter::TEXT, 4, '0'),
                true,
                0,
                0
            );
        END IF;
        
        counter := counter + 1;
    END LOOP;
END $$;

-- STEP 3: Verify it worked
SELECT DISTINCT 
    m.user_id,
    au.email,
    mem.name,
    mem.member_id,
    CASE 
        WHEN mem.name IS NOT NULL THEN '✅ FIXED'
        ELSE '❌ STILL MISSING'
    END as status
FROM messages m
LEFT JOIN auth.users au ON au.id = m.user_id
LEFT JOIN members mem ON mem.user_id = m.user_id
ORDER BY status;

-- STEP 4 (OPTIONAL): Update with real names
-- UPDATE members SET name = 'Real Name Here' WHERE user_id = 'user-id-here';
