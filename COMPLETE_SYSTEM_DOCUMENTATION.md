# KHCWW Welfare Management System - Complete Documentation

## System Overview

**KHCWW Welfare Management System** is a comprehensive web-based platform for managing welfare operations, member information, meetings, benefits, and administrative functions for the Kenya Harambee Community Welfare Workers organization.

**Technology Stack:**
- Frontend: React + TypeScript
- Backend: Supabase (PostgreSQL + Auth)
- Styling: Tailwind CSS
- Build Tool: Vite
- Package Manager: Bun

---

## User Roles & Access Levels

### 1. **Super Admin**
- Full system access
- Can manage all users and roles
- Can access all dashboards and features
- Can verify payments and approve/reject requests
- Can manage admin users

### 2. **Admin**
- Administrative dashboard access
- Member management (add, edit, delete, assign roles)
- Verify penalty payments
- View all reports and analytics
- Manage beneficiary data
- Manage news and announcements

### 3. **Secretary**
- Create and submit meeting minutes
- Upload secretary signature
- View approved minutes
- Access member downloads
- View member list
- Submit beneficiary requests

### 4. **Chairperson**
- Approve or reject meeting minutes
- Upload chairperson signature
- View all minutes (submitted and approved)
- Access chairperson dashboard
- View member list

### 5. **Treasurer**
- View financial reports
- Access treasurer dashboard
- View member payment history
- Generate financial statements

### 6. **Office Bearer** (Generic role for any office position)
- Attend executive meetings
- View executive minutes
- Access member downloads
- View member list

### 7. **Member**
- View approved meeting minutes
- Download minutes and documents
- Pay penalties
- View personal information
- Access member dashboard

### 8. **Guest**
- Limited read-only access
- View public news and announcements
- Cannot access member data or minutes

---

## Pages & Dashboards

### Member Dashboard (`/member`)
- Personal information display
- Meeting minutes access
- Penalty payment history
- Document downloads
- Profile management

### Admin Dashboard (`/admin`)
- Member management
- Role assignment/removal
- Penalty payment verification
- Beneficiary data import
- News management
- Analytics and reports

### Secretary Dashboard (`/secretary`)
- Create meeting minutes
- Submit minutes for approval
- View rejection notes
- Upload signature
- Access member list

### Chairperson Dashboard (`/chairperson`)
- Review submitted minutes
- Approve/reject minutes with notes
- Upload signature
- View all minutes
- Access member list

### Treasurer Dashboard (`/treasurer`)
- Financial reports
- Payment tracking
- Member contribution history
- Financial statements

### News & Announcements (`/news`)
- View latest news
- Read announcements
- Track read status

### Chat System (`/chat`)
- Direct messaging between members
- Group conversations
- Message history
- Real-time notifications

---

## Core Features

### 1. Meeting Minutes Workflow
**Process:**
1. Secretary creates minutes with:
   - Meeting date and type (Regular/Executive)
   - Attendees and absences
   - Agenda items and discussions
   - Decisions and action items
   - Secretary signature (auto-filled from stored signature)

2. Secretary submits for approval

3. Chairperson reviews:
   - Views complete formatted minutes
   - Can approve or reject with notes
   - Chairperson signature auto-fills on approval

4. Secretary sees rejection notes and can resubmit

5. Approved minutes visible to members based on meeting type

**Executive Meetings:**
- Only office bearers (members with roles) shown for attendees/absences
- Executive minutes only visible to members with roles
- Secretary can select specific executive members from dropdown

**Status Workflow:**
- Draft → Submitted → Approved/Rejected

### 2. Signature Management
- Secretary uploads signature once, auto-used for all future minutes
- Chairperson uploads signature once, auto-used for all approvals
- Signatures stored in Supabase storage bucket
- Persistent across sessions

### 3. Penalty Payment System
**Member Side:**
- Submit penalty payment with amount and reference number
- View payment history with status
- Status indicators: Pending, Verified, Rejected

**Admin Side:**
- View all pending payments
- Verify payments with confirmation
- Reject payments with reason
- View complete payment history

### 4. Beneficiary Management
**Import Feature:**
- Upload Excel file with beneficiary data
- Members matched by phone number
- Supports: spouse info, up to 6 children, parents, NOK, retirement date, ID number
- Upsert logic: creates new or updates existing records

**Beneficiary Requests:**
- Members can submit beneficiary requests
- Admin reviews and approves/rejects
- Request history tracking

### 5. Role Management
- Admin can assign roles to members
- Admin can remove roles from members
- Role-based access control throughout system
- Executive meeting filtering based on roles

### 6. News & Announcements
- Admin creates and publishes news
- Members view news with read tracking
- Announcements system for important updates

### 7. Chat System
- Direct messaging between members
- Group conversations
- Message history
- Real-time notifications
- User presence indicators

### 8. Member Management
- Add new members
- Edit member information
- Delete members
- Assign/remove roles
- View member list with filters
- Member profile management

---

## Database Schema

### Core Tables

**members**
- id, name, phone, email, id_number, retirement_date
- spouse_name, spouse_phone, spouse_id_number
- children (up to 6)
- parents, next_of_kin
- created_at, updated_at

**user_roles**
- id, user_id, role (admin, secretary, chairperson, treasurer, office_bearer, member)
- created_at

**meeting_minutes**
- id, meeting_date, meeting_type (regular/executive)
- secretary_id, chairperson_id
- attendees, absent_with_apology, absent_without_apology
- agenda, discussions, decisions, action_items
- secretary_name, secretary_signature_url
- chairperson_name, chairperson_signature_url
- status (draft/submitted/approved/rejected)
- rejection_notes, rejection_date
- created_at, updated_at

**penalty_payments**
- id, member_id, amount, reference_number, payment_date
- status (pending/verified/rejected)
- verified_by, verified_at, rejection_reason, notes
- created_at

**beneficiary_requests**
- id, member_id, spouse_name, spouse_phone, spouse_id_number
- children (up to 6), parents, next_of_kin
- retirement_date, id_number
- status (pending/approved/rejected)
- admin_notes, created_at, updated_at

**news**
- id, title, content, author_id, published_at
- created_at, updated_at

**news_read_tracking**
- id, news_id, member_id, read_at

**messages**
- id, sender_id, recipient_id, content, read_at
- created_at

**signatures**
- id, user_id, signature_url, created_at, updated_at

---

## Automation Features

### 1. Auto-Signature Prefill
- Secretary signature auto-fills when creating minutes
- Chairperson signature auto-fills when approving minutes
- No manual entry needed

### 2. Executive Meeting Filtering
- When "Executive Meeting" selected, only office bearers shown
- Applies to attendees, absences, and member dropdown

### 3. Role-Based Access Control
- Members with roles see executive minutes
- Members without roles don't see executive minutes
- Admin can manage role assignments

### 4. Signature Persistence
- Signatures stored in database
- Automatically retrieved and displayed
- Persists across sessions

### 5. Rejection Workflow
- Secretary sees rejection notes in edit dialog
- Can make corrections and resubmit
- Chairperson can view rejection history

### 6. Payment Verification
- Admin verifies or rejects payments
- Members see payment status
- Rejection reasons tracked

### 7. Beneficiary Import
- Bulk import from Excel
- Phone number matching
- Upsert logic for create/update

### 8. News Read Tracking
- System tracks which members read which news
- Read status indicators
- Unread count tracking

### 9. Chat Notifications
- Real-time message notifications
- User presence indicators
- Message read receipts

### 10. Member Profile Auto-Fill
- Chairperson name auto-filled from member profile
- Secretary name auto-filled from member profile
- Reduces manual data entry

---

## Security Features

### Authentication
- Supabase Auth with email/password
- Session management
- Secure token storage

### Authorization
- Role-based access control (RBAC)
- Row-level security (RLS) policies
- Function-level access checks

### Data Protection
- Encrypted password storage
- Secure API endpoints
- CORS protection

### Audit Trail
- User action logging
- Timestamp tracking
- Change history

---

## Deployment

### Build Process
```bash
bun install
bun run build
```

### Deployment Package
- `welfare-flow-frontend-final.zip` (0.88 MB)
- Contains optimized production build
- Ready for deployment to hosting platform

### Environment Variables
- `.env` file contains:
  - Supabase URL
  - Supabase Anon Key
  - API endpoints
  - Feature flags

---

## System Status

- **Build**: ✅ Successful - No errors or warnings
- **Testing**: ✅ Complete
- **Documentation**: ✅ Complete
- **Deployment**: ✅ Ready

---

## Support & Troubleshooting

### Admin Access Issues
If admin cannot see dashboard:
1. Run: `SELECT user_id, role FROM user_roles WHERE role IN ('admin', 'super_admin');`
2. If no results, add admin role: `INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');`

### Signature Issues
If signatures not persisting:
1. Check signature storage bucket permissions
2. Verify RLS policies allow signature access
3. Run: `ULTIMATE_SIGNATURE_FIX.sql`

### Meeting Minutes Issues
If minutes not showing:
1. Verify member has appropriate role
2. Check meeting type (executive vs regular)
3. Verify minutes status is "approved"

---

## Contact & Support

For issues or questions, contact the system administrator or refer to the troubleshooting guides in the root directory.
