# Executive Minutes Implementation Guide

## What Was Done

### 1. Database Migration (20260425_executive_minutes_rbac.sql)
- ✅ Created `meeting_attendance` table with columns:
  - `meeting_id` (FK to meeting_minutes)
  - `user_id` (FK to auth.users)
  - `status` (present/absent/apology)
- ✅ Added `meeting_type` column to `meeting_minutes` (general/executive)
- ✅ Created RLS policies:
  - Executive minutes: ONLY users with roles can view
  - General minutes: Anyone can view if approved
- ✅ Added indexes for performance

### 2. Frontend Component (ExecutiveMinutesForm.tsx)
- ✅ Filters attendees to ONLY show members with assigned roles
- ✅ Allows selecting multiple attendees
- ✅ Provides 3 status options per attendee:
  - ✅ Present
  - ❌ Absent
  - ⚠️ Absent with Apology
- ✅ Saves attendance records to database

## Next Steps to Complete

### Step 1: Update MeetingMinutes.tsx
Add this import at the top:
```typescript
import { ExecutiveMinutesForm } from "@/components/minutes/ExecutiveMinutesForm";
```

### Step 2: Add Meeting Type Selection
In the form, add:
```typescript
<div>
  <Label>Meeting Type</Label>
  <Select value={form.meeting_type} onValueChange={value => setForm(f => ({ ...f, meeting_type: value }))}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="general">General Meeting</SelectItem>
      <SelectItem value="executive">Executive Meeting (Role Members Only)</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Step 3: Show ExecutiveMinutesForm When Type is Executive
```typescript
{form.meeting_type === "executive" && (
  <ExecutiveMinutesForm meetingId={selectedMinutes?.id} />
)}
```

### Step 4: Update Minutes Display
When displaying minutes, show:
- Meeting type badge
- Attendance list (if executive)
- Only show to users with roles (enforced by RLS)

## Security Enforced

✅ **Database Level (RLS)**
- Executive minutes only readable by users with roles
- Attendance records only writable by admins

✅ **Frontend Level**
- Attendee dropdown filters to role members only
- Meeting type selection shows warning for executive

✅ **Business Logic**
- At least 1 attendee required for executive minutes
- Attendance status must be one of 3 options

## Testing Checklist

- [ ] Run migration: `20260425_executive_minutes_rbac.sql`
- [ ] Create a general meeting minute
- [ ] Create an executive meeting minute
- [ ] Verify only role members appear in attendee list
- [ ] Mark attendance for each member
- [ ] Verify non-role users cannot see executive minutes
- [ ] Verify role users can see executive minutes
- [ ] Test role removal → user loses access to executive minutes

## Files Modified/Created

- ✅ `supabase/migrations/20260425_executive_minutes_rbac.sql` (NEW)
- ✅ `src/components/minutes/ExecutiveMinutesForm.tsx` (NEW)
- ⏳ `src/pages/secretary/MeetingMinutes.tsx` (NEEDS UPDATE)
