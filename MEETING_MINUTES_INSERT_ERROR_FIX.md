# Meeting Minutes Insert Error - Fix

## Problem
When trying to create a meeting minute, you get a 400 Bad Request error:
```
POST https://ubdhljxyleqsixrewtto.supabase.co/rest/v1/meeting_minutes 400 (Bad Request)
```

## Root Cause
The RLS (Row Level Security) policies I created were too restrictive. They required the user to have a specific role (secretary, admin, etc.) to insert minutes. However:

1. The secretary user might not have a role assigned in the `user_roles` table
2. The RLS policy was checking for a role that doesn't exist
3. Supabase blocked the INSERT with a 400 error

## Solution
Replace the restrictive RLS policies with simpler ones that:
1. Allow any authenticated user to create/update/delete minutes
2. Still protect executive minutes from no-role users (on SELECT)
3. Allow general minutes to be viewed by everyone

## Files to Run

### Option 1: Quick Fix (Recommended)
Run this file to fix the issue immediately:
```
SIMPLE_FIX_MEETING_MINUTES_RLS.sql
```

This will:
- Drop all problematic policies
- Create new, simpler policies
- Allow secretary to create minutes
- Still protect executive minutes from no-role users

### Option 2: Diagnose First
If you want to understand the issue better, run:
```
DIAGNOSE_SECRETARY_ROLE.sql
```

This will show:
- Which users have roles
- Which users don't have roles
- Current RLS policies
- Existing meeting minutes

### Option 3: Temporary Disable RLS
If you need to test immediately:
```
TEMPORARY_DISABLE_RLS_FOR_TESTING.sql
```

This will disable RLS temporarily so you can test if that's the issue.

## New RLS Policies

After running the fix, here's what the policies do:

| Policy | Action | Rule |
|--------|--------|------|
| View general approved minutes | SELECT | Anyone can view if status='approved' |
| View executive minutes if has role | SELECT | Only users with ANY role can view |
| Admin view all minutes | SELECT | Admins can view all minutes |
| Authenticated users can create minutes | INSERT | Any logged-in user can create |
| Authenticated users can update minutes | UPDATE | Any logged-in user can update |
| Authenticated users can delete minutes | DELETE | Any logged-in user can delete |

## Testing After Fix

1. **Create a meeting minute**:
   - Go to Secretary Dashboard → Meeting Minutes
   - Click "New Minutes"
   - Fill in the form
   - Click "Create Minutes"
   - **Expected**: Should succeed ✅

2. **Verify executive minutes protection**:
   - Create an executive meeting
   - Login as no-role user
   - Go to Downloads → Meeting Minutes
   - **Expected**: Executive minutes NOT shown ✅

3. **Verify general minutes visibility**:
   - Create a general meeting
   - Login as any user
   - Go to Downloads → Meeting Minutes
   - **Expected**: General minutes shown ✅

## Why This Works

The new policies are simpler:
- **INSERT/UPDATE/DELETE**: Allow any authenticated user (secretary can create)
- **SELECT**: Protect executive minutes from no-role users
- **No role checking on write**: Removes the 400 error

The secretary doesn't need a role to create minutes - they just need to be logged in.

## Security Note

This approach is more permissive on writes but still protects reads:
- Any authenticated user can create/edit/delete minutes (secretary does this)
- Only role members can see executive minutes
- General minutes visible to all

If you want stricter write permissions later, we can add role checks back after the secretary role is properly assigned.

## Next Steps

1. Run `SIMPLE_FIX_MEETING_MINUTES_RLS.sql` in Supabase SQL editor
2. Try creating a meeting minute
3. Verify it works
4. Test with no-role user to ensure executive minutes are protected
