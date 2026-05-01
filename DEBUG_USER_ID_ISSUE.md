# Debug User ID Issue

## The Problem
`user.id` is returning "NANCY MBURU" (a name) instead of a UUID.

## What I Did
Added debugging to both:
1. **src/lib/auth.tsx** - Logs the user object when session is created
2. **src/pages/secretary/MeetingMinutes.tsx** - Logs the user object when creating minutes

## How to Debug

### Step 1: Open Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Keep it open

### Step 2: Try Creating a Meeting Minute
1. Go to Secretary Dashboard
2. Click "Meeting Minutes"
3. Click "New Minutes"
4. Fill in the form
5. Click "Create Minutes"

### Step 3: Check Console Logs
Look for logs like:
```
Auth session user: {
  id: "...",
  email: "...",
  phone: "...",
  user_metadata: {...}
}
```

And:
```
Creating minutes with user: {
  id: "...",
  email: "...",
  phone: "..."
}
```

### Step 4: Share the Logs
If `id` shows "NANCY MBURU" instead of a UUID, that's the problem.

## Possible Causes

1. **Auth session not properly initialized**
   - Solution: Log out and log back in

2. **User object is corrupted**
   - Solution: Clear browser cache and refresh

3. **Supabase auth is returning wrong data**
   - Solution: Check Supabase auth settings

4. **Members table has wrong user_id**
   - Solution: Run `CHECK_NANCY_SIMPLE.sql` to verify

## Next Steps

1. Refresh the app (Ctrl+Shift+R)
2. Open browser console (F12)
3. Try creating a meeting minute
4. Check the console logs
5. Share what you see in the logs

The debugging code will help us identify exactly what's wrong with the user object.
