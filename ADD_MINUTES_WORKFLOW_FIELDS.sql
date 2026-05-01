-- Add workflow fields to meeting_minutes table
-- Add rejection/review notes and submitted_for_approval status

-- Add rejection_notes column for chairperson feedback
ALTER TABLE meeting_minutes 
ADD COLUMN IF NOT EXISTS rejection_notes TEXT;

-- Add submitted_by column to track who submitted for approval
ALTER TABLE meeting_minutes 
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add submitted_at column for tracking submission time
ALTER TABLE meeting_minutes 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

-- Add reviewed_by column for chairperson who reviewed
ALTER TABLE meeting_minutes 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add reviewed_at column for tracking review time
ALTER TABLE meeting_minutes 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Update status enum values if needed (we'll handle this in application logic)
-- Status workflow: draft -> submitted -> approved/rejected -> draft (for corrections) -> resubmitted -> approved

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_submitted_status ON meeting_minutes(status, submitted_at);

-- Update RLS policies to allow proper workflow
-- Note: Existing policies should work, but we need to ensure chairpersons can update status and rejection_notes

-- Policy for chairpersons to update minutes (for review/approval)
DROP POLICY IF EXISTS "Chairpersons can review minutes" ON meeting_minutes;
CREATE POLICY "Chairpersons can review minutes" ON meeting_minutes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('chairperson', 'vice_chairperson', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('chairperson', 'vice_chairperson', 'admin')
    )
  );