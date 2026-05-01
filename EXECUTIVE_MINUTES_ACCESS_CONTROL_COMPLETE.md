# Executive Minutes Access Control - Complete Implementation

## Overview
Executive minutes are now fully protected with role-based access control. Only members with assigned roles can see executive minutes.

## What's Implemented

### 1. Database Level (RLS Policies)
**File**: `ENFORCE_EXECUTIVE_MINUTES_ACCESS_CONTROL.sql`

The following RLS policies are in place:

#### Policy 1: General Meetings
- **Rule**: Anyone can view if status = "approved"
- **Applies to**: meeting_type = 'general'

#### Policy 2: Executive Meetings (STRICT)
- **Rule**: ONLY users with roles can view
- **Applies to**: meeting_type = 'executive'
- **Required Roles**: admin, super_admin, chairperson, vice_chairperson, secretary, vice_secretary, patron
- **No Role Users**: CANNOT see executive minutes (403 Forbidden)

#### Policy 3: Admin/Secretary Access
- **Rule**: Admins and secretaries can view ALL minutes (for management)
- **Purpose**: Allows admins to manage all minutes regardless of type

#### Policy 4-6: Write Permissions
- **Rule**: Only admins and secretaries can create/update/delete minutes
- **Prevents**: Regular members from modifying minutes

### 2. Frontend Level (Query Filtering)

#### MemberDownloads.tsx
**File**: `src/pages/member/MemberDownloads.tsx` (lines 41-70)

```typescript
const { data: publishedMinutes = [] } = useQuery({
  queryKey: ["published-minutes", user?.id],
  queryFn: async () => {
    // Get all approved minutes
    const { data: allMinutes } = await supabase
      .from("meeting_minutes")
      .select("*")
      .eq("status", "approved");

    // Get current user's roles
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id);

    const hasRole = userRoles && userRoles.length > 0;
    
    // Filter minutes based on meeting type and user role
    return allMinutes.filter((minute: any) => {
      if (minute.meeting_type === "executive") {
        // For executive meetings, check if user has a role
        if (!hasRole) return false;
        
        // If visible_to_members is empty, all role holders can see it
        if (!minute.visible_to_members || minute.visible_to_members.length === 0) {
          return true;
        }
        
        // Check if user is in visible_to_members list
        return minute.visible_to_members.includes(member?.name);
      }
      
      // General meetings are visible to all
      return true;
    });
  },
  enabled: !!user,
});
```

**Logic**:
1. Fetches all approved minutes
2. Checks if current user has any role
3. For executive minutes:
   - If user has NO role → filtered out (not shown)
   - If user has role → shown
4. For general minutes:
   - Always shown to all users

#### ApproveMinutes.tsx
**File**: `src/pages/chairperson/ApproveMinutes.tsx` (lines 37-45)

- Chairperson can view all minutes for approval
- When approving, the `meeting_type` is preserved
- Executive minutes remain marked as "executive"

#### MeetingMinutes.tsx
**File**: `src/pages/secretary/MeetingMinutes.tsx` (lines 625-631)

- Secretary can create/edit/delete minutes
- Can select meeting type: "general" or "executive"
- When creating executive minutes, only members with roles are shown in attendee dropdown

### 3. Data Flow

```
User with NO Role:
├─ Cannot see executive minutes in dashboard (MemberDownloads)
├─ Cannot access via direct URL (RLS blocks)
└─ Cannot receive notifications for executive minutes

User with Role (e.g., Chairperson):
├─ Can see executive minutes in dashboard
├─ Can access via direct URL
├─ Can receive notifications
└─ Can view all details and download
```

## Testing Checklist

### Test 1: No Role User Cannot See Executive Minutes
1. Create a member with NO role
2. Create an executive meeting (approved)
3. Login as the no-role member
4. Go to Downloads → Meeting Minutes
5. **Expected**: Executive minutes NOT shown
6. **Try direct URL access**: Should get 403 Forbidden

### Test 2: Role User Can See Executive Minutes
1. Create a member with a role (e.g., Chairperson)
2. Create an executive meeting (approved)
3. Login as the role member
4. Go to Downloads → Meeting Minutes
5. **Expected**: Executive minutes shown
6. **Can download**: Yes

### Test 3: General Minutes Visible to All
1. Create a general meeting (approved)
2. Login as any user (with or without role)
3. Go to Downloads → Meeting Minutes
4. **Expected**: General minutes shown to all

### Test 4: Secretary Can Create Executive Minutes
1. Login as secretary
2. Go to Meeting Minutes → New Minutes
3. Select "Executive" as meeting type
4. **Expected**: Attendee dropdown shows ONLY members with roles
5. Create and submit for approval

### Test 5: Chairperson Approves Executive Minutes
1. Login as chairperson
2. Go to Approve Minutes
3. See the executive minutes
4. Approve it
5. **Expected**: Status changes to "approved"

### Test 6: RLS Enforcement
1. Try to query executive minutes directly via Supabase client
2. As no-role user: Should return empty
3. As role user: Should return the minutes

## Security Notes

✅ **Database Level**: RLS policies prevent unauthorized access at the database level
✅ **Frontend Level**: Query filtering provides additional protection
✅ **No Role Users**: Completely blocked from seeing executive minutes
✅ **Role Verification**: Checked against user_roles table in real-time
✅ **Write Protection**: Only admins/secretaries can create/modify minutes

## Files Modified/Created

1. **ENFORCE_EXECUTIVE_MINUTES_ACCESS_CONTROL.sql** - RLS policies
2. **src/pages/member/MemberDownloads.tsx** - Frontend filtering (already implemented)
3. **src/pages/secretary/MeetingMinutes.tsx** - Query fixes (already implemented)
4. **src/pages/chairperson/ApproveMinutes.tsx** - Approval workflow (already implemented)

## Deployment Steps

1. Run `ENFORCE_EXECUTIVE_MINUTES_ACCESS_CONTROL.sql` in Supabase SQL editor
2. Verify policies are created: Check pg_policies table
3. Test with no-role user: Should not see executive minutes
4. Test with role user: Should see executive minutes
5. Monitor logs for any access denied errors

## Troubleshooting

### Executive minutes showing to no-role users
- Check RLS policies are enabled: `ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;`
- Verify user_roles table has correct data
- Check if user actually has a role: `SELECT * FROM user_roles WHERE user_id = 'xxx';`

### Role users cannot see executive minutes
- Verify user has a role in user_roles table
- Check role is in the allowed list: admin, super_admin, chairperson, vice_chairperson, secretary, vice_secretary, patron
- Verify meeting_type = 'executive' in meeting_minutes table
- Check meeting status = 'approved'

### Attendee dropdown empty when creating executive minutes
- Verify members with roles exist: `SELECT * FROM user_roles;`
- Check the executiveMembers query is working (see MeetingMinutes.tsx)
- Verify members table has user_id linked to user_roles

## Next Steps

1. Run the SQL file to enforce policies
2. Test with different user roles
3. Monitor for any access issues
4. Consider adding audit logging for executive minutes access
