# Executive Minutes Query Fix - Summary

## Problem
Executive minutes were showing "No members found" in the attendee dropdown even though members with roles existed in the database. The issue was in the `executiveMembers` and `officeBearers` queries in `src/pages/secretary/MeetingMinutes.tsx`.

## Root Cause
The queries were using Supabase relationship syntax that wasn't loading member data properly:
```typescript
// BROKEN - relationship syntax not working
const { data } = await supabase
  .from("user_roles")
  .select("user_id, role, members(name, phone)")  // ❌ members data not loading
  .in("role", [...])
```

## Solution
Rewrote both queries to use the same pattern that works in `Members.tsx`:
1. Fetch user_roles separately
2. Extract user IDs
3. Fetch members data separately using those IDs
4. Manually join the data using a Map

```typescript
// FIXED - separate queries + manual join
const { data: rolesData } = await supabase
  .from("user_roles")
  .select("user_id, role")
  .in("role", [...]);

const { data: membersData } = await supabase
  .from("members")
  .select("id, user_id, name, phone")
  .in("user_id", userIds);

const memberMap = new Map(membersData?.map(m => [m.user_id, m]) || []);
return rolesData.map(role => ({
  user_id: role.user_id,
  role: role.role,
  members: memberMap.get(role.user_id) || { name: "Unknown", phone: "" }
}));
```

## Files Modified
- `src/pages/secretary/MeetingMinutes.tsx`
  - Fixed `officeBearers` query (line ~648)
  - Fixed `executiveMembers` query (line ~695)

## What This Fixes
✅ Executive members now load correctly in the attendee dropdown
✅ Members with roles (chairperson, vice_chairperson, secretary, vice_secretary, patron) will display
✅ Attendance marking for executive meetings will work
✅ Role-based access control for executive minutes will function properly

## Testing
1. Go to Secretary Dashboard → Meeting Minutes
2. Create a new meeting
3. Select "Executive" as meeting type
4. Check the attendee dropdown - should now show members with roles
5. Select attendees and mark attendance (present/absent/apology)
6. Save the minutes

## Related Files
- `src/pages/admin/Members.tsx` - Reference implementation of working query pattern
- `src/lib/rbac.ts` - Role configuration
- `supabase/migrations/20260425_executive_minutes_rbac.sql` - Database structure
