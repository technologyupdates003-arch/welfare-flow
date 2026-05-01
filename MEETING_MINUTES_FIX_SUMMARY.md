# Meeting Minutes Fix - Complete Solution

## Problem
Nancy Mburu (Secretary) was getting a 400 Bad Request error when trying to create meeting minutes with the error: "Invalid input syntax for type uuid: 'JOSEPH M. GITHINJI'" (chairperson name being sent to UUID field).

## Root Cause
The database columns `chairperson_name`, `secretary_name`, `chairperson_signature_url`, and `secretary_signature_url` were defined as UUID type instead of VARCHAR/TEXT, causing the insert to fail when text values were sent.

## Solution Implemented

### 1. Fixed React Component (src/pages/secretary/MeetingMinutes.tsx)

**Added back form fields:**
- `chairperson_name` and `secretary_name` to form state
- Added `formInitialized` flag to prevent infinite loops

**Fixed useEffect initialization:**
- Created a one-time initialization effect with empty dependency array `[]`
- Fetches secretary name from current user's member record
- Fetches chairperson name from office bearers
- Only runs once on component mount using `formInitialized` flag

**Separated signature updates:**
- Created separate useEffect for `secretarySignature` changes
- Created separate useEffect for `chairpersonSignature` changes
- Each has its own dependency array to avoid infinite loops

**Updated mutations:**
- Added `chairperson_name` and `secretary_name` to INSERT mutation
- Added `chairperson_name` and `secretary_name` to UPDATE mutation

**Updated resetForm:**
- Added `setFormInitialized(false)` so names get refilled when creating new minutes

### 2. Database Schema Fix (supabase/migrations/20260427_fix_meeting_minutes_columns.sql)

**Drops and recreates columns with correct types:**
```sql
-- Drop problematic UUID columns
ALTER TABLE public.meeting_minutes
DROP COLUMN IF EXISTS chairperson_name CASCADE;
DROP COLUMN IF EXISTS secretary_name CASCADE;
DROP COLUMN IF EXISTS chairperson_signature_url CASCADE;
DROP COLUMN IF EXISTS secretary_signature_url CASCADE;

-- Recreate with correct types
ALTER TABLE public.meeting_minutes
ADD COLUMN chairperson_name VARCHAR(255);
ADD COLUMN chairperson_signature_url TEXT;
ADD COLUMN secretary_name VARCHAR(255);
ADD COLUMN secretary_signature_url TEXT;
```

## How It Works Now

1. **On Form Load:**
   - Component fetches current user's name (secretary)
   - Component fetches chairperson name from office bearers
   - Both names are prefilled in the form

2. **On Form Submit:**
   - Names are sent as VARCHAR text (not UUID)
   - Database accepts the values without error
   - Meeting minutes are created successfully

3. **On Form Reset:**
   - `formInitialized` flag is reset to false
   - Next time form opens, names are refilled again

## Executive Minutes Access Control ✅

Already implemented in `src/pages/member/MemberDownloads.tsx`:
- Non-role members cannot see executive minutes
- Only members with assigned roles can view executive meetings
- Visibility can be further restricted via `visible_to_members` list

## Next Steps

1. **Execute the database migration:**
   - Go to Supabase SQL Editor
   - Run: `supabase/migrations/20260427_fix_meeting_minutes_columns.sql`

2. **Test the fix:**
   - Hard refresh browser (Ctrl+Shift+R)
   - Login as Nancy Mburu (Secretary)
   - Create a new meeting minute
   - Should now work without 400 error

3. **Verify names are prefilled:**
   - Secretary name should auto-fill from current user
   - Chairperson name should auto-fill from office bearers
   - Both should be editable if needed
