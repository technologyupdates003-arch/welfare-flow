# URGENT FIXES - READ THIS

## Issue 1: 404 on Page Refresh

**Problem:** You're getting 404 when refreshing pages  
**Cause:** Your hosting platform isn't configured for SPA routing

### Fix for Vercel:
The `vercel.json` is in your zip. After uploading:
1. Go to Vercel Dashboard > Your Project > Settings
2. Check "Build & Development Settings"
3. Make sure it's set as a "Single Page Application"

### Fix for Netlify:
The `_redirects` file is in your zip. It should work automatically.

### Fix for Other Hosts:
You need to configure your server to redirect all routes to `index.html`

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Issue 2: Chat Shows "Unknown User"

**Problem:** All chat messages show "Unknown User" instead of actual names  
**Cause:** Your database doesn't have member records linked to user accounts

### Fix:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the file `FIX_CHAT_NAMES.sql`
4. This will:
   - Show you which users have no member records
   - Automatically create member records from profiles
   - Verify the fix worked

### Manual Fix (if SQL doesn't work):
1. Go to Supabase > Table Editor > `members` table
2. For each user sending messages, check if they have a row
3. If missing, add a row with:
   - `user_id` = their auth user ID
   - `name` = their actual name
   - `phone` = their phone number
   - `member_id` = unique ID like "MEM0001"
   - `status` = "active"

---

## Quick Test

After deploying:

1. **Test 404 Fix:**
   - Go to any page like `/member/profile`
   - Press F5 to refresh
   - Should NOT show 404

2. **Test Chat Names:**
   - Open chat
   - Send a message
   - Should show your actual name, not "Unknown User"

---

## Files in Your Zip

✅ `index.html` - Main app  
✅ `vercel.json` - Vercel SPA config  
✅ `_redirects` - Netlify SPA config  
✅ `assets/` - JS, CSS, images  

All files are ready. The issues are:
1. **404** = Hosting configuration
2. **Names** = Database data missing

Run `FIX_CHAT_NAMES.sql` to fix the names!
