-- ============================================
-- WELFARE FLOW - MANUAL DATABASE UPDATE
-- Run this in Supabase SQL Editor
-- Date: April 17, 2026
-- ============================================

-- This script includes all new migrations:
-- 1. Beneficiary requests system
-- 2. News read tracking
-- 3. Meeting minutes policies update
-- 4. Signatures storage bucket

-- ============================================
-- 1. BENEFICIARY REQUESTS TABLE
-- ============================================

-- Create beneficiary_requests table for member requests
CREATE TABLE IF NOT EXISTS beneficiary_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('add', 'remove')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- For add requests
  beneficiary_name VARCHAR(255),
  beneficiary_relationship VARCHAR(50),
  beneficiary_phone VARCHAR(20),
  beneficiary_id_number VARCHAR(50),
  
  -- For remove requests
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  
  -- Common fields
  reason TEXT NOT NULL,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_member_id ON beneficiary_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_status ON beneficiary_requests(status);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_type ON beneficiary_requests(request_type);

-- Enable RLS
ALTER TABLE beneficiary_requests ENABLE ROW LEVEL SECURITY;

-- Members can view their own requests
CREATE POLICY "Members can view own requests" ON beneficiary_requests
  FOR SELECT
  TO authenticated
  USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Members can create requests
CREATE POLICY "Members can create requests" ON beneficiary_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" ON beneficiary_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update requests
CREATE POLICY "Admins can update requests" ON beneficiary_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can delete requests
CREATE POLICY "Admins can delete requests" ON beneficiary_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 2. NEWS READ TRACKING
-- ============================================

-- Create news_read table to track which news members have read
CREATE TABLE IF NOT EXISTS news_read (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_news_read_user_id ON news_read(user_id);
CREATE INDEX IF NOT EXISTS idx_news_read_news_id ON news_read(news_id);

-- Enable RLS
ALTER TABLE news_read ENABLE ROW LEVEL SECURITY;

-- Users can view their own read status
CREATE POLICY "Users can view own read status" ON news_read
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can mark news as read
CREATE POLICY "Users can mark news as read" ON news_read
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add profile_picture_url to members table if not exists
ALTER TABLE members ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- ============================================
-- 3. UPDATE MEETING MINUTES POLICIES
-- ============================================

-- Drop the old policy
DROP POLICY IF EXISTS "Secretaries can view all minutes" ON meeting_minutes;

-- Allow office bearers to view all minutes
CREATE POLICY "Office bearers can view all minutes" ON meeting_minutes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('secretary', 'vice_secretary', 'admin', 'chairperson', 'vice_chairperson', 'patron')
    )
  );

-- Allow all authenticated members to view approved minutes
CREATE POLICY "Members can view approved minutes" ON meeting_minutes
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- ============================================
-- 4. SIGNATURES STORAGE BUCKET
-- ============================================

-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload signatures
CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'signatures');

-- Allow authenticated users to update their signatures
CREATE POLICY "Authenticated users can update signatures"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'signatures');

-- Allow authenticated users to delete signatures
CREATE POLICY "Authenticated users can delete signatures"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'signatures');

-- Allow public read access to signatures
CREATE POLICY "Public can view signatures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'signatures');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify everything was created successfully:

-- Check beneficiary_requests table
-- SELECT COUNT(*) as beneficiary_requests_count FROM beneficiary_requests;

-- Check news_read table
-- SELECT COUNT(*) as news_read_count FROM news_read;

-- Check signatures bucket
-- SELECT * FROM storage.buckets WHERE id = 'signatures';

-- Check meeting_minutes policies
-- SELECT * FROM pg_policies WHERE tablename = 'meeting_minutes';

-- ============================================
-- DONE!
-- ============================================
-- All migrations applied successfully.
-- You can now deploy the updated frontend.
