# Executive Minutes - Quick Reference

## The Rule
**Executive minutes are ONLY visible to members with assigned roles.**

## User Scenarios

### Scenario 1: Member with NO Role
```
Action: Tries to view executive minutes
Result: ❌ CANNOT SEE
- Not shown in dashboard
- Cannot access via URL
- RLS blocks at database level
```

### Scenario 2: Member with Role (e.g., Chairperson)
```
Action: Tries to view executive minutes
Result: ✅ CAN SEE
- Shown in dashboard
- Can access via URL
- Can download
```

### Scenario 3: General Meeting (Any Type)
```
Action: Any user tries to view approved general meeting
Result: ✅ CAN SEE (all users)
- Shown to everyone
- No role required
```

## How It Works

### 1. Database Level (RLS)
```sql
-- Executive minutes: ONLY role members can view
WHERE meeting_type = 'executive' 
AND user has a role in user_roles table
```

### 2. Frontend Level (Query)
```typescript
// Filter out executive minutes for no-role users
if (minute.meeting_type === "executive" && !hasRole) {
  return false; // Don't show
}
```

### 3. Both Levels Combined
- Database blocks unauthorized queries
- Frontend filters for better UX
- Double protection

## Implementation Files

| File | Purpose |
|------|---------|
| `ENFORCE_EXECUTIVE_MINUTES_ACCESS_CONTROL.sql` | RLS policies |
| `src/pages/member/MemberDownloads.tsx` | Dashboard filtering |
| `src/pages/secretary/MeetingMinutes.tsx` | Create executive minutes |
| `src/pages/chairperson/ApproveMinutes.tsx` | Approve minutes |

## Testing

### Quick Test 1: No Role User
```
1. Create member with NO role
2. Create executive meeting (approved)
3. Login as no-role member
4. Go to Downloads
5. Expected: Executive minutes NOT shown ✅
```

### Quick Test 2: Role User
```
1. Create member with role
2. Create executive meeting (approved)
3. Login as role member
4. Go to Downloads
5. Expected: Executive minutes shown ✅
```

## Deployment

```bash
# 1. Run the SQL file
# Open Supabase SQL editor
# Copy and run: ENFORCE_EXECUTIVE_MINUTES_ACCESS_CONTROL.sql

# 2. Verify
SELECT * FROM pg_policies WHERE tablename = 'meeting_minutes';

# 3. Test
# Login as no-role user → should not see executive minutes
# Login as role user → should see executive minutes
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No-role user sees executive minutes | Check RLS is enabled: `ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;` |
| Role user cannot see executive minutes | Verify user has role: `SELECT * FROM user_roles WHERE user_id = 'xxx';` |
| Attendee dropdown empty | Check members with roles exist: `SELECT * FROM user_roles;` |
| Cannot create executive minutes | Verify you're logged in as secretary/admin |

## Key Points

✅ Executive minutes are protected at database level (RLS)
✅ No-role users cannot see executive minutes
✅ Role users can see all executive minutes
✅ General meetings visible to everyone
✅ Only admins/secretaries can create/modify minutes
✅ Chairperson can approve minutes
✅ Double protection: Database + Frontend

## Roles That Can See Executive Minutes

- ✅ admin
- ✅ super_admin
- ✅ chairperson
- ✅ vice_chairperson
- ✅ secretary
- ✅ vice_secretary
- ✅ patron

## Roles That CANNOT See Executive Minutes

- ❌ member (no role assigned)
- ❌ Any user without a role in user_roles table
