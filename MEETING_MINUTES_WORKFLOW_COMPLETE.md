# Complete Meeting Minutes Workflow Implementation

## Workflow Overview

### 1. **Secretary Creates/Edits Minutes**
- **Status**: `draft`
- **Actions Available**:
  - Edit minutes
  - Delete minutes
  - **Submit for Approval** (new button)

### 2. **Secretary Submits for Approval**
- **Status changes**: `draft` → `submitted`
- **Tracking**: `submitted_by` and `submitted_at` fields populated
- **Secretary can no longer edit** (must wait for chairperson review)

### 3. **Chairperson Reviews Submitted Minutes**
- **Chairperson sees**: All minutes with status `submitted` or `draft`
- **Actions Available**:
  - **Approve**: Adds signature, changes status to `approved`
  - **Reject with Notes**: Provides feedback, changes status to `rejected`
- **Tracking**: `reviewed_by` and `reviewed_at` fields populated

### 4. **Secretary Reviews Rejection**
- **Status**: `rejected`
- **Secretary sees**: Rejection notes from chairperson
- **Actions Available**:
  - Edit minutes (with rejection notes displayed)
  - Make corrections based on feedback
  - Resubmit for approval

### 5. **Resubmission Cycle**
- Secretary edits rejected minutes
- Status resets to `draft`
- Rejection notes cleared
- Secretary can resubmit for approval
- Cycle repeats until approved

## Database Changes

### New Columns Added to `meeting_minutes`:
1. `rejection_notes` TEXT - Chairperson feedback
2. `submitted_by` UUID - Who submitted for approval
3. `submitted_at` TIMESTAMP - When submitted
4. `reviewed_by` UUID - Who reviewed (chairperson)
5. `reviewed_at` TIMESTAMP - When reviewed

### Status Workflow:
- `draft` → `submitted` → `approved` (or `rejected` → `draft` → `submitted` → `approved`)

## Files Modified

### 1. **Secretary Side** (`src/pages/secretary/MeetingMinutes.tsx`)
- Added "Submit for Approval" button for draft minutes
- Shows rejection notes when editing rejected minutes
- Updated status badges to show `submitted` and `rejected` states
- Added mutation to submit minutes for approval
- Updated edit dialog to display chairperson feedback

### 2. **Chairperson Side** (`src/pages/chairperson/ApproveMinutes.tsx`)
- Updated query to fetch `submitted` minutes (not just `draft`)
- Added "Reject with Notes" dialog with feedback textarea
- Updated status badges to show different states
- Added tracking of who reviewed and when
- Updated "How Review Works" instructions

### 3. **Database Schema** (`ADD_MINUTES_WORKFLOW_FIELDS.sql`)
- Added new columns for workflow tracking
- Updated RLS policies for chairperson review

## Key Features Implemented

1. **Complete approval workflow** with tracking
2. **Rejection with detailed feedback** from chairperson
3. **Secretary can see feedback** and make corrections
4. **Resubmission capability** after corrections
5. **Audit trail** of who submitted/reviewed and when
6. **Status visibility** with color-coded badges

## Testing Notes
- Build successful with no TypeScript errors
- All components compile correctly
- Workflow logic tested in code review
- Database migrations ready to apply

## Next Steps
1. Apply database migrations (`ADD_MINUTES_WORKFLOW_FIELDS.sql`)
2. Test the complete workflow end-to-end
3. Verify RLS policies work correctly
4. Test signature upload fixes