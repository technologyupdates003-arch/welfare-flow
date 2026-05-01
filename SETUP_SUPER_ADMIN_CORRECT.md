# Super Admin Setup - CORRECT ORDER

## ⚠️ IMPORTANT: Run Migrations in This Order

The migrations must be run in the correct order because `super_admin` needs to be added to the enum FIRST.

---

## Step 1: Add super_admin to Enum (FIRST)

**File:** `supabase/migrations/20260420_add_super_admin_enum.sql`

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create new query
3. Copy entire contents of: `supabase/migrations/20260420_add_super_admin_enum.sql`
4. Click **Run**
5. Wait for success ✅

**This query:**
```sql
ALTER TYPE app_role ADD VALUE 'super_admin' BEFORE 'admin';
```

---

## Step 2: Create Super Admin Tables (SECOND)

**File:** `supabase/migrations/20260420_add_super_admin_role.sql`

1. In SQL Editor, create new query
2. Copy entire contents of: `supabase/migrations/20260420_add_super_admin_role.sql`
3. Click **Run**
4. Wait for success ✅

**This creates:**
- audit_logs table
- password_resets table
- system_logs table
- member_access_logs table
- system_health table
- All RLS policies
- All indexes

---

## Step 3: Add Super Admin Role to Admin User (THIRD)

**File:** `ADD_SUPER_ADMIN_ROLE_TO_ADMIN.sql`

1. In SQL Editor, create new query
2. Run this to find your admin user ID:
```sql
SELECT id, email FROM auth.users WHERE email LIKE '%admin%';
```
3. Copy the `id` (UUID)
4. Run this (replace `YOUR_ID` with the ID you copied):
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_ID', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;
```
5. Click **Run** ✅

---

## Step 4: Test It

1. **Log out** of the app
2. **Log back in** as admin
3. You should see **3 buttons** in header:
   - Admin Dashboard
   - Super Admin
   - Member Dashboard
4. Click **Super Admin** ✅

---

## ✅ Checklist

- [ ] Run `supabase/migrations/20260420_add_super_admin_enum.sql`
- [ ] Run `supabase/migrations/20260420_add_super_admin_role.sql`
- [ ] Run `ADD_SUPER_ADMIN_ROLE_TO_ADMIN.sql`
- [ ] Log out and log back in
- [ ] See 3 dashboard buttons
- [ ] Click Super Admin button
- [ ] Access super admin dashboard

---

## 🆘 If You Get an Error

### Error: "invalid input value for enum app_role: super_admin"
**Solution:** You skipped Step 1. Run the enum migration first.

### Error: "relation audit_logs does not exist"
**Solution:** You skipped Step 2. Run the tables migration.

### Error: "Can't see Super Admin button"
**Solution:** You skipped Step 3. Add the role to your user.

---

## 📚 Documentation

- `QUICK_START_SUPER_ADMIN.md` - Quick start guide
- `SUPER_ADMIN_GUIDE.md` - Complete user guide
- `SUPER_ADMIN_IMPLEMENTATION_COMPLETE.md` - Technical details

---

**Status**: ✅ Ready to setup
**Time**: ~5 minutes
