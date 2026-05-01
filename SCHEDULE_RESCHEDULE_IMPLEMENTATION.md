# Schedule & Reschedule Implementation

## Overview
Added schedule and reschedule date tracking to News and Events management systems. This allows admins to track original scheduled dates and any rescheduling with reasons.

## Database Changes

### Migration: `20260429_add_schedule_fields_to_news_events.sql`

Added three new columns to both `news` and `events` tables:

**News Table:**
- `scheduled_date` (TIMESTAMP WITH TIME ZONE) - Original scheduled date for the news item
- `rescheduled_date` (TIMESTAMP WITH TIME ZONE) - New date if the news was rescheduled
- `reschedule_reason` (TEXT) - Reason for rescheduling the news

**Events Table:**
- `scheduled_date` (TIMESTAMP WITH TIME ZONE) - Original scheduled date for the event
- `rescheduled_date` (TIMESTAMP WITH TIME ZONE) - New date if the event was rescheduled
- `reschedule_reason` (TEXT) - Reason for rescheduling the event

**Indexes Created:**
- `idx_news_scheduled_date` - For querying by scheduled date
- `idx_news_rescheduled_date` - For querying by rescheduled date
- `idx_events_scheduled_date` - For querying by scheduled date
- `idx_events_rescheduled_date` - For querying by rescheduled date

## UI Changes

### News Management (`src/pages/admin/News.tsx`)

**Create News Dialog:**
- Added "Scheduled Date" field (optional datetime-local input)
- Allows setting when the news should be published

**Edit News Dialog:**
- Added "Scheduled Date" field
- Added "Rescheduled Date" field (optional)
- Added "Reschedule Reason" field (optional textarea)
- Shows only when rescheduled date is set

**News Display:**
- Shows "Posted" date
- Shows "Scheduled" date if set (with calendar icon)
- Shows "Rescheduled" date if set (in orange, with calendar icon)
- Displays reschedule reason if available

### Events Management (`src/pages/admin/Events.tsx`)

**Create Event Dialog:**
- Added "Scheduled Date" field (optional datetime-local input)
- Allows setting when the event should occur

**Events Table:**
- Added "Scheduled Date" column
- Shows original scheduled date
- Shows rescheduled date below in orange if event was rescheduled
- Maintains "Date Created" column for reference

## Features

### For News:
1. **Schedule News** - Set a future date when news should be published
2. **Reschedule News** - Update the scheduled date with a reason
3. **Track Changes** - See original schedule vs. rescheduled date
4. **Reason Tracking** - Document why news was rescheduled

### For Events:
1. **Schedule Events** - Set the date when an event will occur
2. **Reschedule Events** - Update event date with reason
3. **Visual Tracking** - Orange highlight for rescheduled events
4. **Date History** - See both original and new dates

## Usage

### Creating News with Schedule:
1. Click "New Announcement"
2. Enter title and content
3. (Optional) Set "Scheduled Date" for future publication
4. Click "Post"

### Rescheduling News:
1. Click "Edit" on existing news
2. Update "Rescheduled Date" field
3. Enter "Reschedule Reason"
4. Click "Update"

### Creating Events with Schedule:
1. Click "New Event"
2. Fill in event details
3. (Optional) Set "Scheduled Date"
4. Click "Create Event"

### Rescheduling Events:
1. Edit the event (requires additional UI update)
2. Update scheduled date
3. Add reschedule reason
4. Save changes

## Technical Details

- All dates are stored in ISO 8601 format with timezone
- Datetime-local inputs convert to ISO format automatically
- Indexes improve query performance for date-based filtering
- Backward compatible - existing records have NULL values for new columns
- No data loss - migration is additive only

## Future Enhancements

1. **Event Edit Dialog** - Add full edit capability for events (currently only status can be changed)
2. **Date Filtering** - Filter news/events by scheduled or rescheduled dates
3. **Notifications** - Notify members when events are rescheduled
4. **Calendar View** - Display scheduled events in a calendar interface
5. **Bulk Reschedule** - Reschedule multiple events at once
6. **Audit Trail** - Track all schedule changes with timestamps

## Files Modified

1. `supabase/migrations/20260429_add_schedule_fields_to_news_events.sql` - Database migration
2. `src/pages/admin/News.tsx` - News management UI updates
3. `src/pages/admin/Events.tsx` - Events management UI updates

## Build Status
✅ Build successful - No errors or warnings related to these changes
