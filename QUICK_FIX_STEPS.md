# Quick Fix - Meeting Minutes Insert Error

## The Problem
You can't create meeting minutes - getting 400 Bad Request error.

## The Fix (2 Steps)

### Step 1: Run SQL in Supabase
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of: `SIMPLE_FIX_MEETING_MINUTES_RLS.sql`
4. Click "Run"
5. Wait for success message

### Step 2: Test in App
1. Go to Secretary Dashboard
2. Click "Meeting Minutes"
3. Click "New Minutes"
4. Fill in the form:
   - Title: "Test Meeting"
   - Meeting Date: Today
   - Meeting Type: "General"
   - Agenda: "Test"
5. Click "Create Minutes"
6. **Expected**: Success! ✅

## What Changed
- Removed restrictive role checks on INSERT
- Secretary can now create minutes
- Executive minutes still protected from no-role users
- General meetings visible to all

## If Still Not Working
1. Check browser console for error message
2. Run `DIAGNOSE_SECRETARY_ROLE.sql` to see what's happening
3. Share the error message

## Done!
You should now be able to create meeting minutes.
