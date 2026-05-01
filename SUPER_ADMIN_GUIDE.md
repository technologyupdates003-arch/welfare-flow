# Super Admin Role - Complete Guide

## 🔐 Overview

The Super Admin role is an enhanced administrative role with full system access, including:
- View all member data and profiles
- Reset member passwords
- Read all member private chats
- System troubleshooting and error management
- Complete audit logging
- System health monitoring

---

## ✨ Super Admin Features

### 1. Dashboard Overview
**Location:** `/super-admin`

The Super Admin Dashboard provides:
- **Total Members**: Count of all members in the system
- **System Errors**: Real-time error count with unresolved count
- **System Health**: Status of all system metrics
- **Database Stats**: Members, messages, conversations count
- **Access Logs**: Tracking of all super admin member access

### 2. Member Management
**Location:** `/super-admin` → Members Tab

Features:
- Search members by name, phone, or email
- View all member information
- Access member profiles
- View member status (active/inactive)
- Quick access to member details

### 3. Member Detail View
**Location:** `/super-admin/member/{memberId}`

Complete member information including:

#### Profile Tab
- Full name, phone, email
- Member status
- Join date and last updated
- Address and ID number
- All personal information

#### Password Tab
- **Reset Password**: Generate new temporary password for member
- **Password History**: View all password resets
- **Reset Reason**: Document why password was reset
- **Audit Trail**: All password changes are logged

#### Chats Tab
- View all member conversations
- Read all private messages
- Access conversation history
- View message timestamps
- All chat access is logged

#### Logs Tab
- Access logs for this member
- View when super admin accessed member data
- Reason for access
- Timestamp of access

### 4. System Troubleshooting
**Location:** `/super-admin/troubleshooting`

Complete system monitoring and error management:

#### Error Management
- View all system errors
- Filter by error level (ERROR, WARNING, INFO)
- Mark errors as resolved
- Add resolution notes
- Track error resolution history

#### System Warnings
- View all system warnings
- Monitor system issues
- Track warning history

#### System Health
- Monitor all system metrics
- View metric status (healthy, warning, critical)
- Track metric values over time
- Real-time health updates

#### Diagnostics
- Database connection status
- Authentication service status
- Storage service status
- Real-time subscriptions status
- Database statistics

---

## 🔑 Key Capabilities

### Password Reset Workflow

1. Go to `/super-admin`
2. Find member in Members tab
3. Click "View" button
4. Go to "Password" tab
5. Click "Reset Password"
6. Enter new temporary password
7. Add reason for reset (required for audit)
8. Click "Reset Password"
9. Member receives new credentials via email
10. Access is logged automatically

### Viewing Member Chats

1. Go to `/super-admin`
2. Find member in Members tab
3. Click "View" button
4. Go to "Chats" tab
5. View all conversations
6. Read all messages
7. View message timestamps
8. All access is logged

### System Error Resolution

1. Go to `/super-admin/troubleshooting`
2. View errors in "Errors" tab
3. Click "Resolve" on error
4. Add resolution notes
5. Click "Mark as Resolved"
6. Error is marked as resolved
7. Resolution is logged

### System Health Monitoring

1. Go to `/super-admin/troubleshooting`
2. View health metrics in "Health" tab
3. Monitor metric status
4. Check critical issues
5. Click "Refresh" to update
6. View diagnostics for detailed info

---

## 📊 Audit & Logging

All Super Admin actions are logged for security and compliance:

### Audit Logs Track:
- Super admin ID
- Action performed
- Target user/member
- Timestamp
- IP address
- Details of action

### Member Access Logs Track:
- Which super admin accessed member
- What type of access (view_profile, view_chat, reset_password)
- Reason for access
- Timestamp

### System Logs Track:
- Error level (ERROR, WARNING, INFO, DEBUG)
- Component where error occurred
- Error message
- Error details
- User affected
- Request path
- Status code
- Resolution status

---

## 🗄️ Database Tables

### audit_logs
```sql
- id (UUID) - Primary key
- super_admin_id (UUID) - Super admin who performed action
- action (VARCHAR) - Action performed
- target_user_id (UUID) - User affected
- target_member_id (UUID) - Member affected
- details (JSONB) - Additional details
- ip_address (VARCHAR) - IP address
- created_at (TIMESTAMP) - When action occurred
```

### password_resets
```sql
- id (UUID) - Primary key
- user_id (UUID) - User whose password was reset
- reset_token (VARCHAR) - Reset token
- reset_by (UUID) - Super admin who reset password
- reset_at (TIMESTAMP) - When reset occurred
- new_password_hash (VARCHAR) - New password hash
- created_at (TIMESTAMP) - When reset was created
- expires_at (TIMESTAMP) - When reset expires
```

### system_logs
```sql
- id (UUID) - Primary key
- log_level (VARCHAR) - ERROR, WARNING, INFO, DEBUG
- component (VARCHAR) - Component where error occurred
- message (TEXT) - Error message
- error_details (JSONB) - Detailed error info
- user_id (UUID) - User affected
- request_path (VARCHAR) - Request path
- status_code (INTEGER) - HTTP status code
- created_at (TIMESTAMP) - When error occurred
- resolved (BOOLEAN) - Whether error is resolved
- resolved_by (UUID) - Super admin who resolved
- resolved_at (TIMESTAMP) - When resolved
```

### member_access_logs
```sql
- id (UUID) - Primary key
- super_admin_id (UUID) - Super admin accessing
- member_id (UUID) - Member being accessed
- access_type (VARCHAR) - Type of access
- reason (TEXT) - Reason for access
- created_at (TIMESTAMP) - When access occurred
```

### system_health
```sql
- id (UUID) - Primary key
- metric_name (VARCHAR) - Name of metric
- metric_value (NUMERIC) - Metric value
- status (VARCHAR) - healthy, warning, critical
- details (JSONB) - Additional details
- checked_at (TIMESTAMP) - When checked
```

---

## 🔒 Security & Permissions

### RLS Policies
- Only super admins can view audit logs
- Only super admins can view password resets
- Only super admins can view system logs
- Only super admins can view member access logs
- Only super admins can view system health

### Access Control
- Super admin role required for all features
- All actions are logged
- Reason required for password resets
- All member access is tracked
- IP addresses are recorded

---

## 📱 Navigation

### Super Admin Sidebar
- **Dashboard**: Main overview
- **System Troubleshooting**: Error management and health monitoring
- **Member Management**: View and manage members
- **My Dashboard**: Switch to member view
- **My Profile**: View own profile

### Quick Access
- Search members by name, phone, or email
- Filter errors by level
- Refresh system health
- Export logs

---

## 🚀 Setup Instructions

### 1. Create Super Admin User

Run this SQL in Supabase SQL Editor:

```sql
-- Create super admin user
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'super_admin');
```

Replace `USER_ID_HERE` with the actual user ID from auth.users table.

### 2. Run Database Migration

Run `supabase/migrations/20260420_add_super_admin_role.sql` in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy entire contents of migration file
4. Click Run
5. Wait for success message

### 3. Verify Setup

1. Log in as super admin user
2. You should see "Super Admin Dashboard" in sidebar
3. Navigate to `/super-admin`
4. Verify all tabs are accessible

---

## 📋 Workflow Examples

### Example 1: Reset Forgotten Password

1. Member calls saying they forgot password
2. Go to `/super-admin`
3. Search for member by name
4. Click "View"
5. Go to "Password" tab
6. Click "Reset Password"
7. Generate temporary password (e.g., "TempPass123!")
8. Add reason: "Member forgot password - called support"
9. Click "Reset Password"
10. Member receives email with new credentials
11. Member logs in and changes password
12. Access is logged automatically

### Example 2: Investigate Member Chat Issue

1. Member reports chat not working
2. Go to `/super-admin`
3. Search for member
4. Click "View"
5. Go to "Chats" tab
6. View all conversations
7. Check recent messages
8. Identify issue (e.g., message not sent)
9. Go to `/super-admin/troubleshooting`
10. Check system logs for errors
11. Resolve error if found
12. Notify member

### Example 3: Monitor System Health

1. Go to `/super-admin/troubleshooting`
2. View error count and warnings
3. Check system health metrics
4. If critical issues found:
   - Click "Refresh" to update
   - View diagnostics
   - Check database connection
   - Review recent errors
   - Resolve errors as needed

---

## 🎯 Best Practices

1. **Always Document**: Add reason when resetting passwords
2. **Monitor Regularly**: Check system health daily
3. **Resolve Errors**: Mark errors as resolved when fixed
4. **Review Logs**: Check audit logs weekly
5. **Secure Access**: Only access member data when necessary
6. **Communicate**: Inform members of password resets
7. **Track Changes**: Document all system changes
8. **Backup Data**: Regular database backups

---

## ⚠️ Important Notes

1. **All Access is Logged**: Every action is recorded for security
2. **Password Resets**: Members should change temporary passwords immediately
3. **Chat Access**: Reading member chats is logged and auditable
4. **Error Resolution**: Document resolution steps for future reference
5. **System Health**: Monitor regularly to prevent issues
6. **Compliance**: All actions must comply with data protection regulations

---

## 🆘 Troubleshooting

### Issue: Can't see Super Admin Dashboard
**Solution**: 
- Verify user has super_admin role in user_roles table
- Refresh browser
- Check that migration was run

### Issue: Password reset not working
**Solution**:
- Verify user_id is correct
- Check that password_resets table exists
- Verify RLS policies are correct

### Issue: Can't view member chats
**Solution**:
- Verify super_admin role is assigned
- Check that conversation_participants table has data
- Verify RLS policies allow super admin access

### Issue: System logs not showing
**Solution**:
- Verify system_logs table exists
- Check that migration was run
- Verify RLS policies are correct

---

## 📞 Support

For issues or questions:
1. Check system logs in `/super-admin/troubleshooting`
2. Review audit logs for recent actions
3. Check member access logs for access history
4. Contact system administrator

---

**Last Updated**: April 20, 2026
**Status**: Ready for deployment
