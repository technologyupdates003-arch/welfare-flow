-- AUTO FIX ALL CHAT NAMES
-- This will create member records for ALL users who don't have them
-- Uses phone number from email as the name

DO $$
DECLARE
    missing_user RECORD;
    phone_number TEXT;
    member_counter INT;
BEGIN
    -- Get the highest member number to continue sequence
    SELECT COALESCE(MAX(CAST(SUBSTRING(member_id FROM 4) AS INTEGER)), 0) + 1 
    INTO member_counter
    FROM members 
    WHERE member_id ~ '^MEM[0-9]+$';
    
    -- Loop through all users who sent messages but have no member record
    FOR missing_user IN 
        SELECT DISTINCT m.user_id, au.email
        FROM messages m
        LEFT JOIN members mem ON mem.user_id = m.user_id
        LEFT JOIN auth.users au ON au.id = m.user_id
        WHERE mem.id IS NULL
        ORDER BY au.email
    LOOP
        -- Check if member already exists (double check)
        IF NOT EXISTS (SELECT 1 FROM members WHERE user_id = missing_user.user_id) THEN
            -- Extract phone from email (remove @welfare.local)
            phone_number := REPLACE(missing_user.email, '@welfare.local', '');
            
            -- Insert member record
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
                phone_number,  -- Use phone as name for now
                phone_number,
                'MEM' || LPAD(member_counter::TEXT, 4, '0'),
                true,
                0,
                0
            );
            
            member_counter := member_counter + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Created % member records', member_counter - 1;
END $$;

-- Verify: Check all messages now have member names
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
ORDER BY status, au.email;

-- Optional: Update names to be more readable
-- UPDATE members SET name = 'Actual Name' WHERE phone = '2254727360233';
