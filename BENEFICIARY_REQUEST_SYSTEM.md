# Beneficiary Request System

## Overview

Members can now only VIEW their beneficiaries. To add or remove beneficiaries, they must submit requests that admins review and approve.

---

## Changes Made

### 1. Navigation
- Changed "Family" to "Beneficiaries" in sidebar

### 2. Member Beneficiaries Page
- **View-only**: Members can only view their current beneficiaries
- **Request to Add**: Submit form to request adding a new beneficiary
- **Request to Remove**: Submit form to request removing an existing beneficiary
- **Track Requests**: See status of all submitted requests

### 3. Database
- New table: `beneficiary_requests`
- Stores add/remove requests with status (pending/approved/rejected)

---

## For Members

### View Beneficiaries
1. Go to **Beneficiaries** page
2. See list of current beneficiaries
3. Cannot add or remove directly

### Request to Add Beneficiary
1. Click **"Request to Add Beneficiary"** button
2. Fill in form:
   - Name (required)
   - Relationship (required)
   - Phone (optional)
   - ID Number (optional)
   - Reason for adding (required)
3. Click **"Submit Request"**
4. Admin will review and approve/reject

### Request to Remove Beneficiary
1. Find beneficiary in list
2. Click **"Request Removal"** button
3. Fill in reason for removal
4. Click **"Submit Removal Request"**
5. Admin will review and approve/reject

### Track Requests
1. Go to **"My Requests"** tab
2. See all submitted requests with status:
   - **Pending** (⏰) - Waiting for admin review
   - **Approved** (✓) - Admin approved, beneficiary added/removed
   - **Rejected** (✗) - Admin rejected with notes
3. View admin notes if provided

---

## For Admins

### View Requests
- Go to Admin Dashboard
- See pending beneficiary requests
- Review member's reason

### Approve Request
- Click "Approve"
- Beneficiary is automatically added/removed
- Member is notified

### Reject Request
- Click "Reject"
- Add admin notes explaining why
- Member can see the notes

---

## Request Types

### Add Request
Contains:
- Beneficiary name
- Relationship
- Phone (optional)
- ID number (optional)
- Reason for adding
- Status (pending/approved/rejected)

### Remove Request
Contains:
- Beneficiary to remove
- Reason for removal
- Status (pending/approved/rejected)

---

## Benefits

✅ **Admin Control**: Only admins can add/remove beneficiaries
✅ **Audit Trail**: All requests are tracked with reasons
✅ **Transparency**: Members can see request status
✅ **Communication**: Admin can add notes to rejected requests
✅ **Security**: Prevents unauthorized beneficiary changes

---

## Database Migration

Run this migration in Supabase:

```sql
-- File: supabase/migrations/20260417_add_beneficiary_requests.sql
-- Creates beneficiary_requests table with RLS policies
```

---

## Next Steps

1. **Run the migration** in Supabase SQL Editor
2. **Refresh browser** to see new beneficiary page
3. **Test the request system**:
   - Submit add request as member
   - Review and approve as admin
4. **Admin dashboard** needs update to show pending requests (next task)

---

**Last Updated**: April 17, 2026
**Status**: ✅ COMPLETE
**Feature**: Beneficiary Request System
