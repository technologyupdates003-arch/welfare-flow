# CRITICAL SETUP GUIDE - Meeting Minutes & Signatures

## ⚠️ IMPORTANT: Database Migrations Must Be Run First

The application is showing 400 errors because the database is missing required columns. You MUST run the SQL migrations before the app will work.

---

## STEP 1: Run Database Migrations

### In Supabase Dashboard:

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of: **`RUN_THESE_MIGRATIONS_FIRST.sql`**
5. Click **Run** button (or press Ctrl+Enter)
6. Wait for the query to complete (you should see "Success" message)

### What This Does:
- Adds missing columns to `meeting_minutes` table:
  - `discussions` - for meeting discussion summary
  - `absent_with_apology` - array of members absent with apology
  - `absent_without_apology` - array of members absent without apology
  - `chairperson_name` - prefilled chairperson name
  - `chairperson_signature_url` - chairperson signature image
  - `secretary_name` - prefilled secretary name
  - `secretary_signature_url` - secretary signature image
  - `visible_to_members` - array of members who can view executive meetings

- Creates `office_bearer_signatures` table to store chairperson and secretary signatures

---

## STEP 2: Verify Migrations Completed

After running the SQL, you should see output like:
```
column_name              | data_type
------------------------+----------
id                       | uuid
created_by               | uuid
title                    | character varying
meeting_date             | date
meeting_type             | character varying
attendees                | text[]
agenda                   | text
discussions              | text
decisions                | text
action_items             | text
next_meeting_date        | date
status                   | character varying
chairperson_name         | character varying
chairperson_signature_url| text
secretary_name           | character varying
secretary_signature_url  | text
absent_with_apology      | text[]
absent_without_apology   | text[]
visible_to_members       | text[]
created_at               | timestamp with time zone
updated_at               | timestamp with time zone
```

If you see all these columns, the migration was successful! ✅

---

## STEP 3: Upload Chairperson & Secretary Signatures (Admin Only)

### For Chairperson Signature:
1. Go to **Admin Dashboard** → **Office Signatures** (or `/admin/signatures`)
2. Click **Upload Chairperson Signature**
3. Select a PNG or JPG image (max 2MB)
4. Click **Upload**
5. Signature will be stored and automatically prefilled in meeting minutes

### For Secretary Signature:
1. Go to **Admin Dashboard** → **Office Signatures**
2. Click **Upload Secretary Signature**
3. Select a PNG or JPG image (max 2MB)
4. Click **Upload**
5. Signature will be stored and automatically prefilled in meeting minutes

---

## STEP 4: Create Meeting Minutes

### Secretary Workflow:
1. Go to **Secretary Dashboard** → **Meeting Minutes**
2. Click **New Minutes**
3. Fill in the form:
   - **Meeting Title**: e.g., "Monthly General Meeting"
   - **Meeting Date**: Select date
   - **Meeting Type**: Choose from:
     - General Meeting
     - Committee Meeting
     - Executive Meeting (only visible to selected members)
     - Emergency Meeting
     - Annual Meeting
     - Other
   
4. **Attendees**: Search and select members who attended
5. **Absence Tracking**:
   - **Absent with Apology**: Members who sent apologies
   - **Absent (No Apology)**: Members who didn't attend without notice
6. **Agenda**: List agenda items
7. **Discussions**: Summary of what was discussed
8. **Decisions**: Key decisions made
9. **Action Items**: Tasks assigned with responsible persons
10. **Next Meeting Date**: When the next meeting is scheduled
11. **Status**: Draft or Approved
12. **Signatures**: 
    - Chairperson name and signature (auto-prefilled from admin settings)
    - Secretary name and signature (auto-prefilled from admin settings)

### For Executive Meetings:
- After selecting "Executive Meeting" as meeting type
- A new section appears: "Executive Members Who Can View"
- Select which executive members can view this meeting
- Only selected members will see this meeting in their dashboard

---

## STEP 5: Approve Minutes (Chairperson Only)

### Chairperson Workflow:
1. Go to **Chairperson Dashboard** → **Approve Minutes**
2. View draft minutes
3. Review all details
4. Click **Approve**
5. Chairperson signature is automatically added
6. Minutes status changes to "Approved"

---

## STEP 6: View Meeting Minutes (Members)

### Member View:
1. Go to **Member Dashboard** → **Meeting Minutes**
2. View all approved meeting minutes
3. For executive meetings: Only see if you were selected by secretary
4. View attendees, absences, decisions, and action items

---

## TROUBLESHOOTING

### Issue: Still getting 400 errors
**Solution**: 
- Verify you ran the SQL migration in Supabase SQL Editor
- Check that all columns appear in the verification query
- Refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Chairperson/Secretary names not prefilling
**Solution**:
- Ensure chairperson and secretary roles are assigned in admin
- Upload signatures in Admin → Office Signatures
- Refresh the page

### Issue: Executive members not showing
**Solution**:
- Ensure members have roles assigned (chairperson, secretary, patron, etc.)
- Refresh the page
- Check that the query returns data in Supabase

### Issue: Signature upload fails
**Solution**:
- Ensure image is PNG or JPG format
- Ensure image size is less than 2MB
- Check that `signatures` storage bucket exists in Supabase

---

## QUICK REFERENCE

| Feature | Who Uses | Where |
|---------|----------|-------|
| Create Minutes | Secretary | Secretary Dashboard → Meeting Minutes |
| Upload Signatures | Admin | Admin Dashboard → Office Signatures |
| Approve Minutes | Chairperson | Chairperson Dashboard → Approve Minutes |
| View Minutes | Members | Member Dashboard → Meeting Minutes |
| Executive Meetings | Secretary | Meeting Minutes → Meeting Type: Executive |

---

## DATABASE SCHEMA

### meeting_minutes table
```sql
- id (UUID) - Primary key
- created_by (UUID) - User who created
- title (VARCHAR) - Meeting title
- meeting_date (DATE) - When meeting occurred
- meeting_type (VARCHAR) - Type of meeting
- attendees (TEXT[]) - Array of attendee names
- agenda (TEXT) - Agenda items
- discussions (TEXT) - Discussion summary
- decisions (TEXT) - Decisions made
- action_items (TEXT) - Action items
- next_meeting_date (DATE) - Next meeting date
- status (VARCHAR) - draft/approved/archived
- chairperson_name (VARCHAR) - Chairperson name
- chairperson_signature_url (TEXT) - Signature image URL
- secretary_name (VARCHAR) - Secretary name
- secretary_signature_url (TEXT) - Signature image URL
- absent_with_apology (TEXT[]) - Members absent with apology
- absent_without_apology (TEXT[]) - Members absent without apology
- visible_to_members (TEXT[]) - Members who can view (for executive meetings)
- created_at (TIMESTAMP) - Created timestamp
- updated_at (TIMESTAMP) - Updated timestamp
```

### office_bearer_signatures table
```sql
- id (UUID) - Primary key
- role (VARCHAR) - chairperson or secretary
- signature_url (TEXT) - Image URL of signature
- updated_by (UUID) - User who uploaded
- updated_at (TIMESTAMP) - When uploaded
```

---

## NEXT STEPS

1. ✅ Run `RUN_THESE_MIGRATIONS_FIRST.sql` in Supabase SQL Editor
2. ✅ Upload chairperson and secretary signatures in Admin Dashboard
3. ✅ Create meeting minutes as secretary
4. ✅ Approve minutes as chairperson
5. ✅ View minutes as member

**After completing these steps, the application will be fully functional!**
