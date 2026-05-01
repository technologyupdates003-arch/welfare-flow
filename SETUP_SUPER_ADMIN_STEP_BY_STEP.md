# Super Admin Setup - Step by Step (WORKING)

## ⚠️ Important: Run Each Query Separately

PostgreSQL requires that enum changes be committed before use. You must run these as **separate queries** in Supabase SQL Editor.

---

## Query 1: Add super_admin to Enum

**Run this FIRST and wait for success:**

```sql
ALTER TYPE app_role ADD VALUE 'super_admin' BEFORE 'admin';
```

✅ Wait for "Success" message before proceeding to Query 2

---

## Query 2: Create Super Admin Tables

**Run this SECOND (after Query 1 succeeds):**

```sql
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit logs" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create password_resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reset_token VARCHAR(255) UNIQUE NOT NULL,
  reset_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reset_at TIMESTAMP WITH TIME ZONE,
  new_password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view password resets" ON password_resets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can create password resets" ON password_resets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update password resets" ON password_resets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level VARCHAR(20) NOT NULL,
  component VARCHAR(255),
  message TEXT NOT NULL,
  error_details JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_path VARCHAR(500),
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view system logs" ON system_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update system logs" ON system_logs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create member_access_logs table
CREATE TABLE IF NOT EXISTS member_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  access_type VARCHAR(100) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE member_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view member access logs" ON member_access_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can create member access logs" ON member_access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create system_health table
CREATE TABLE IF NOT EXISTS system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC,
  status VARCHAR(50),
  details JSONB,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view system health" ON system_health
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Add policies for existing tables
CREATE POLICY "Super admins can view all conversations" ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view all messages" ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_super_admin_id ON audit_logs(super_admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_reset_token ON password_resets(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

CREATE INDEX IF NOT EXISTS idx_system_logs_log_level ON system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_resolved ON system_logs(resolved);

CREATE INDEX IF NOT EXISTS idx_member_access_logs_super_admin_id ON member_access_logs(super_admin_id);
CREATE INDEX IF NOT EXISTS idx_member_access_logs_member_id ON member_access_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_member_access_logs_created_at ON member_access_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_health_metric_name ON system_health(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_health_checked_at ON system_health(checked_at DESC);
```

✅ Wait for "Success" message

---

## Query 3: Add Role to Admin User

**Run this THIRD:**

```sql
-- Find your admin user ID
SELECT id, email FROM auth.users WHERE email LIKE '%admin%';
```

Copy the `id` (UUID format)

---

## Query 4: Insert Super Admin Role

**Run this FOURTH (replace YOUR_ADMIN_ID with the ID from Query 3):**

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_ADMIN_ID', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify it was added
SELECT user_id, role FROM user_roles WHERE user_id = 'YOUR_ADMIN_ID';
```

✅ You should see both `admin` and `super_admin` roles

---

## Step 5: Test

1. **Log out** of the app
2. **Log back in** as admin
3. You should see **3 buttons** in header:
   - Admin Dashboard
   - Super Admin
   - Member Dashboard
4. Click **Super Admin** ✅

---

## ✅ Checklist

- [ ] Query 1: Add enum (wait for success)
- [ ] Query 2: Create tables (wait for success)
- [ ] Query 3: Find admin user ID
- [ ] Query 4: Add role to user
- [ ] Log out and log back in
- [ ] See 3 dashboard buttons
- [ ] Click Super Admin button

---

## 🆘 Troubleshooting

**Error: "unsafe use of new value"**
- Solution: Make sure you ran Query 1 first and waited for success before running Query 2

**Error: "relation does not exist"**
- Solution: Make sure you ran Query 2 before Query 4

**Can't see Super Admin button**
- Solution: Make sure you ran Query 4 and added the role to your user

---

**Status**: ✅ Ready to use
**Time**: ~5 minutes
