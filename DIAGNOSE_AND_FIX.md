# Diagnose and Fix Meeting Minutes Error

## Quick Diagnosis

The 400 Bad Request error when Nancy tries to create minutes is likely caused by:

1. **RLS Policies Blocking INSERT** (Most Likely)
   - Policies checking for roles that don't exist
   - Policies conflicting with each other
   - Solution: Run `COMPLETE_MEETING_MINUTES_FIX_V2.sql`

2. **Missing Columns** (Less Likely)
   - Table missing chairperson_name, secretary_name, etc.
   - Solution: Run `COMPLETE_MEETING_MINUTES_FIX_V2.sql` (adds all columns)

3. **Data Validation Error** (Unlikely)
   - Invalid data being sent
   - Solution: Check browser console for exact error message

## How to Fix

### Option 1: Full Fix (Recommended)
Run: `COMPLETE_MEETING_MINUTES_FIX_V2.sql`
- Adds all missing columns
- Fixes all RLS policies
- Should work immediately

### Option 2: Temporary Workaround
Run: `DISABLE_RLS_MEETING_MINUTES_TEMP.sql`
- Disables RLS temporarily
- Allows testing if RLS is the issue
- Re-enable RLS after testing

### Option 3: Debug First
Run: `CHECK_MEETING_MINUTES_TABLE.sql`
- Shows table structure
- Shows all RLS policies
- Shows any constraints
- Helps identify the exact issue

## Testing After Fix

```
1. Login as Nancy Mburu
2. Go to Secretary Dashboard → Meeting Minutes
3. Click "New Minutes"
4. Fill in:
   - Title: "Test Meeting"
   - Meeting Date: Today
   - Meeting Type: "General"
   - Agenda: "Test"
5. Click "Create Minutes"
6. Expected: Success ✅
```

## If Still Not Working

1. **Check browser console** for exact error message
2. **Run diagnostic SQL** to see table structure
3. **Disable RLS temporarily** to test
4. **Share error message** for further debugging

## Files to Use

| File | Purpose |
|------|---------|
| `COMPLETE_MEETING_MINUTES_FIX_V2.sql` | Full fix (recommended) |
| `DISABLE_RLS_MEETING_MINUTES_TEMP.sql` | Temporary workaround |
| `CHECK_MEETING_MINUTES_TABLE.sql` | Diagnose issue |
| `ENSURE_MEETING_MINUTES_COLUMNS.sql` | Add missing columns |

## Next Steps

1. Run `COMPLETE_MEETING_MINUTES_FIX_V2.sql`
2. Test creating a meeting minute
3. If it works, you're done!
4. If not, run `DISABLE_RLS_MEETING_MINUTES_TEMP.sql` and test again
