# Super Admin Setup - SIMPLE

## 4 Easy Steps

### Step 1: Run Query 1
- File: `SUPER_ADMIN_QUERY_1_ENUM.sql`
- Copy entire contents
- Paste in Supabase SQL Editor
- Click Run
- ✅ Wait for success

### Step 2: Run Query 2
- File: `SUPER_ADMIN_QUERY_2_TABLES.sql`
- Copy entire contents
- Paste in Supabase SQL Editor
- Click Run
- ✅ Wait for success

### Step 3: Run Query 3
- File: `SUPER_ADMIN_QUERY_3_ADD_ROLE.sql`
- Copy entire contents
- Paste in Supabase SQL Editor
- Click Run
- ✅ Copy the `id` from results

### Step 4: Run Query 4
- File: `SUPER_ADMIN_QUERY_4_INSERT_ROLE.sql`
- Copy entire contents
- Replace `YOUR_ADMIN_ID` with the ID from Step 3
- Paste in Supabase SQL Editor
- Click Run
- ✅ Wait for success

### Step 5: Test
- Log out of app
- Log back in
- Click "Super Admin" button
- ✅ Done!

---

## Files to Use

1. `SUPER_ADMIN_QUERY_1_ENUM.sql` - Add enum
2. `SUPER_ADMIN_QUERY_2_TABLES.sql` - Create tables
3. `SUPER_ADMIN_QUERY_3_ADD_ROLE.sql` - Find admin ID
4. `SUPER_ADMIN_QUERY_4_INSERT_ROLE.sql` - Add role

---

## That's It!

You now have Super Admin dashboard with:
- Member management
- Password reset
- Chat access
- System monitoring
- Dashboard switcher

Enjoy!
