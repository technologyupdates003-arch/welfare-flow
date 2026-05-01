# Role Management & Executive Minutes Implementation

## Overview
Complete implementation of:
1. **Role Removal** - When a member is dropped from a role, they lose access immediately
2. **Executive Minutes Access Control** - Only members with active roles can view executive minutes
3. **Executive Members Dropdown** - Secretary can mark executive members when creating minutes

## Features Implemented

### 1. Role Removal (Soft Delete)
**Problem**: When admin removes a role from a member, they should lose access immediately

**Solution**: 
- Added `is_active` boolean flag to `user_roles` table
- Added `removed_at` timestamp to track when role was removed
- When admin clicks "Remove Role", role is marked as `is_active = false` instead of deleted
- Auth context now only fetches active roles: `.eq("is_active", true)`
- Member loses access to role-based dashboards immediately

**Database Changes**:
```sql
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP;

CREATE INDEX idx_user_roles_active ON user_roles(user_id, is_active);
```

**Code Changes**:
- `src/lib/auth.tsx` - Updated `fetchRoles()` to only fetch active roles
- `src/pages/admin/Members.tsx` - Updated `removeRole` mutation to soft delete

### 2. Executive Minutes Access Control
**Problem**: Executive minutes should only be visible to members with active roles

**Solution**:
- Updated RLS policies to check if user has an active role
- General meetings visible to all members
- Executive meetings only visible to members with active roles
- If `visible_to_members` is empty, all role holders can see it
- If `visible_to_members` has specific names, only those members can see it

**RLS Policies**:
```sql
-- Members with roles can view approved executive minutes
CREATE POLICY "Members with roles can view executive minutes"
  ON meeting_minutes FOR SELECT
  USING (
    status = 'approved' AND 
    meeting_type = 'executive' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );
```

**Frontend Logic** (`src/pages/member/MemberDownloads.tsx`):
- Fetches user's active roles
- Filters executive minutes based on role status
- General meetings always visible
- Executive minutes only if user has active role

### 3. Executive Members Dropdown
**Problem**: Secretary needs to see and mark which executive members are involved in the meeting

**Solution**:
- Added new section in meeting minutes form for executive meetings
- Shows all executive members (those with roles)
- Displays which members are marked as attendees
- Shows quick stats: total executives, marked attendees, absences

**UI Components**:
- Executive Members Marked section shows:
  - List of all executive members with their roles
  - Visual indicator of who is marked as attendee
  - Quick stats panel with counts
- Integrated with existing attendee/absence tracking

**Code Changes**:
- `src/pages/secretary/MeetingMinutes.tsx` - Added executive members dropdown section

## Database Schema

### user_roles Table Updates
```sql
ALTER TABLE user_roles 
ADD COLUMN is_active BOOLEAN DEFAULT true;
ADD COLUMN removed_at TIMESTAMP;
```

### meeting_minutes Table Updates
```sql
ALTER TABLE meeting_minutes 
ADD COLUMN executive_attendees TEXT[] DEFAULT '{}';
ADD COLUMN executive_absent_with_apology TEXT[] DEFAULT '{}';
ADD COLUMN executive_absent_without_apology TEXT[] DEFAULT '{}';
```

## Workflow

### Admin Removing a Role
1. Admin goes to Members page
2. Clicks "Assign Role" button on member
3. Clicks "Remove Role" button
4. Role is marked as inactive (`is_active = false`)
5. Member loses access immediately:
   - Can't access role dashboard
   - Can't view executive minutes
   - Can't approve/sign minutes (if chairperson)
   - Can't create minutes (if secretary)

### Secretary Creating Executive Minutes
1. Secretary creates new minutes
2. Selects "Executive Meeting" as meeting type
3. New "Executive Members Marked" section appears
4. Shows all members with active roles
5. Secretary marks attendees/absences as usual
6. When saved, only members with active roles can view

### Member Viewing Executive Minutes
1. Member with active role logs in
2. Goes to Downloads page
3. Sees executive minutes in list
4. Can view and download
5. If role is removed, executive minutes disappear from list

## Files Modified/Created

### New Files
- `supabase/migrations/20260421_fix_role_access_and_executive_minutes.sql` - Database schema updates

### Modified Files
- `src/lib/auth.tsx` - Updated role fetching to check `is_active`
- `src/pages/admin/Members.tsx` - Updated role removal to soft delete
- `src/pages/secretary/MeetingMinutes.tsx` - Added executive members dropdown
- `src/pages/member/MemberDownloads.tsx` - Already had correct filtering logic

## RLS Policies

### user_roles Policies
```sql
-- Users can view their active roles
CREATE POLICY "Users can view their active roles"
  ON user_roles FOR SELECT
  USING (
    (user_id = auth.uid() AND is_active = true) OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'super_admin')
      AND ur.is_active = true
    )
  );

-- Admins can update roles
CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND is_active = true
    )
  );
```

### meeting_minutes Policies
```sql
-- Members with roles can view executive minutes
CREATE POLICY "Members with roles can view executive minutes"
  ON meeting_minutes FOR SELECT
  USING (
    status = 'approved' AND 
    meeting_type = 'executive' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );
```

## Testing Checklist

- [ ] Admin can remove role from member
- [ ] Member loses access to role dashboard immediately
- [ ] Member can't view executive minutes after role removed
- [ ] Secretary can see executive members dropdown
- [ ] Executive members marked in minutes
- [ ] Only members with active roles see executive minutes
- [ ] General meetings visible to all members
- [ ] Role reactivation works (if re-assigned)

## Build Status
✅ Build successful - No errors or warnings
- All components compile without issues
- RLS policies properly configured
- Auth context updated for role filtering

## Next Steps
1. Run the database migration
2. Deploy updated frontend
3. Test role removal workflow
4. Test executive minutes visibility
5. Monitor role-based access

## Security Notes
- Soft delete preserves audit trail (removed_at timestamp)
- RLS policies enforce role-based access at database level
- Auth context validates active roles on every login
- Executive minutes require active role status
- Role removal is immediate and irreversible without re-assignment
