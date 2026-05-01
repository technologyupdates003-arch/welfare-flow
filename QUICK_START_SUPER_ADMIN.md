# Quick Start - Super Admin Setup

## ⚡ 5-Minute Setup

### Step 1: Run Database Migration (2 minutes)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create new query
3. Copy entire contents of: `supabase/migrations/20260420_add_super_admin_role.sql`
4. Click **Run**
5. Wait for success ✅

### Step 2: Add Super Admin Role to Admin (2 minutes)

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

### Step 3: Test It (1 minute)

1. **Log out** of the app
2. **Log back in** as admin
3. You should see **3 buttons** in header:
   - Admin Dashboard
   - Super Admin
   - Member Dashboard
4. Click **Super Admin** ✅

---

## 🎯 What You Can Do Now

### As Admin:
- Manage members
- View contributions
- Process payments
- Send SMS
- Manage events

### As Super Admin:
- View all member data
- Reset member passwords
- Read member private chats
- Monitor system errors
- Check system health
- View audit logs

### Switch Between Them:
- Click buttons in header
- Stay logged in
- All access is logged

---

## 🚀 You're Done!

The Super Admin dashboard is now ready to use. Start by:

1. Click **Super Admin** button
2. Search for a member
3. Click **View** to see their details
4. Try resetting a password
5. Check system troubleshooting

---

## 📚 Learn More

- `SUPER_ADMIN_GUIDE.md` - Complete guide with all features
- `SETUP_SUPER_ADMIN_FOR_ADMIN.md` - Detailed setup instructions
- `SUPER_ADMIN_IMPLEMENTATION_COMPLETE.md` - Technical details

---

## ❓ Troubleshooting

**Can't see Super Admin button?**
- Log out and log back in
- Verify super_admin role was added to user_roles table

**Can't access Super Admin dashboard?**
- Refresh browser (Ctrl+Shift+R)
- Check browser console for errors (F12)

**Password reset not working?**
- Verify password_resets table exists
- Check that migration was run successfully

---

**Status**: ✅ Ready to use
**Time to setup**: ~5 minutes
