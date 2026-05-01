# Setup Super Admin Access for Admin User

## Overview

This guide explains how to give your admin user access to both the Admin Dashboard and Super Admin Dashboard, allowing them to switch between the two without logging out.

---

## Step 1: Find Your Admin User ID

### In Supabase Dashboard:

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Run this query to find your admin user:

```sql
SELECT id, email FROM auth.users WHERE email LIKE '%admin%' OR email LIKE '%@welfare.local';
```

5. Look for your admin user and copy the `id` (UUID format)

**Example output:**
```
id                                   | email
-------------------------------------|------------------
069f60a0-84a4-431e-97a8-297b703226d0 | 0712345678@welfare.local
```

Copy the ID: `069f60a0-84a4-431e-97a8-297b703226d0`

---

## Step 2: Add Super Admin Role

### In Supabase SQL Editor:

1. Create a new query
2. Copy and paste this SQL (replace `ADMIN_USER_ID_HERE` with your actual ID):

```sql
-- Add super_admin role to admin user
INSERT INTO user_roles (user_id, role)
VALUES ('ADMIN_USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the role was added
SELECT user_id, role FROM user_roles WHERE user_id = 'ADMIN_USER_ID_HERE';
```

**Example with actual ID:**
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('069f60a0-84a4-431e-97a8-297b703226d0', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

SELECT user_id, role FROM user_roles WHERE user_id = '069f60a0-84a4-431e-97a8-297b703226d0';
```

3. Click **Run**
4. You should see output showing both `admin` and `super_admin` roles

---

## Step 3: Verify Setup

### In the Application:

1. **Log out** completely
2. **Log back in** with your admin credentials
3. You should now see **three dashboard buttons** in the header:
   - **Admin Dashboard** - Regular admin functions
   - **Super Admin** - Enhanced admin functions
   - **Member Dashboard** - Member view

### Test the Switcher:

1. Click **Admin Dashboard** - You should see admin dashboard
2. Click **Super Admin** - You should see super admin dashboard
3. Click **Admin Dashboard** again - You should go back to admin dashboard
4. All without logging out!

---

## What You Can Now Do

### As Admin:
- Manage members
- View contributions
- Process payments
- Send bulk SMS
- Manage events and documents
- View office signatures

### As Super Admin:
- View all member data
- Reset member passwords
- Read all member private chats
- Monitor system errors
- Check system health
- View audit logs
- Troubleshoot system issues

### Switch Between Them:
- Click buttons in header to switch
- Stay logged in the whole time
- All access is logged

---

## Troubleshooting

### Issue: Still only see Admin Dashboard button
**Solution:**
- Verify you ran the SQL query correctly
- Check that the user_id is correct
- Log out and log back in
- Refresh browser (Ctrl+Shift+R)

### Issue: Can't access Super Admin Dashboard
**Solution:**
- Verify both roles are in user_roles table:
```sql
SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';
```
- Should show both `admin` and `super_admin` rows
- If not, run the INSERT query again

### Issue: Buttons not showing
**Solution:**
- Make sure you're logged in as admin
- Check browser console for errors (F12)
- Try clearing browser cache
- Refresh page

---

## Database Verification

To verify everything is set up correctly, run this query:

```sql
-- Check admin user has both roles
SELECT ur.user_id, ur.role, u.email
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.user_id = 'YOUR_USER_ID'
ORDER BY ur.role;
```

You should see:
```
user_id                              | role       | email
-------------------------------------|------------|------------------
069f60a0-84a4-431e-97a8-297b703226d0 | admin      | 0712345678@welfare.local
069f60a0-84a4-431e-97a8-297b703226d0 | super_admin| 0712345678@welfare.local
```

---

## Next Steps

1. ✅ Add super_admin role to admin user
2. ✅ Log out and log back in
3. ✅ Test dashboard switcher
4. ✅ Run database migrations for super admin features:
   - `supabase/migrations/20260420_add_super_admin_role.sql`
5. ✅ Start using super admin features

---

## Important Notes

- **All access is logged**: Every action in super admin is recorded
- **Password resets**: Members should change temporary passwords immediately
- **Chat access**: Reading member chats is logged for compliance
- **System monitoring**: Check system health regularly
- **Audit trail**: Review audit logs weekly

---

## Support

If you encounter issues:

1. Check the SQL query syntax
2. Verify user_id is correct (UUID format)
3. Ensure migrations have been run
4. Check browser console for errors
5. Try logging out and back in

---

**Last Updated**: April 20, 2026
**Status**: Ready to use
