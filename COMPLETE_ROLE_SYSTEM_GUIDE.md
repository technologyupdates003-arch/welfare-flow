# Complete Role-Based System Guide

## 🎯 Overview

The welfare management system has a **seamless role-based system** where:
- ✅ All users login with the same credentials (phone + password)
- ✅ No difference in login process
- ✅ System automatically detects user's role
- ✅ User is routed to their role-specific dashboard
- ✅ Only dashboard features differ based on role

---

## 📱 Login Process (Same for Everyone)

### Step 1: Open Application
- Go to http://localhost:8080/

### Step 2: Enter Credentials
```
Phone: 0712345678 (or +254712345678)
Password: Member2026
```

### Step 3: Click Login
- System checks user's role in database
- User is automatically routed to correct dashboard

---

## 🔄 Automatic Dashboard Routing

After login, the system checks the user's role and routes them:

```
Login → Check Role → Route to Dashboard
                  ├─ No Role → Member Dashboard
                  ├─ Chairperson → Chairperson Dashboard
                  ├─ Vice Chairperson → Vice Chairperson Dashboard
                  ├─ Secretary → Secretary Dashboard
                  ├─ Vice Secretary → Vice Secretary Dashboard
                  ├─ Patron → Patron Dashboard
                  └─ Admin → Admin Dashboard
```

---

## 👥 Role Assignments & Dashboards

### 1️⃣ MEMBER (No Role)
**Login**: Phone + Password (Member2026)
**Dashboard**: Member Dashboard
**Features**:
- View events
- View documents
- View news
- View notifications
- Manage profile
- View beneficiaries
- Download documents

---

### 2️⃣ CHAIRPERSON
**Login**: Phone + Password (Member2026)
**Dashboard**: Chairperson Dashboard
**Features** (Read-Only):
- View active members count
- View total collected payments
- View members with penalties (defaulters)
- View active events
- Monitor welfare overview

---

### 3️⃣ VICE CHAIRPERSON
**Login**: Phone + Password (Member2026)
**Dashboard**: Vice Chairperson Dashboard
**Features** (Read-Only):
- View active members
- View total collected payments
- View average contributions
- View active events
- View member statistics
- View recent events
- View members with penalties

---

### 4️⃣ SECRETARY
**Login**: Phone + Password (Member2026)
**Dashboard**: Secretary Dashboard
**Features** (Write Access):
- **Manage Events**: Create, edit, delete events
- **Record Meeting Minutes**: Create, edit, delete meeting records
- View total events
- View active events
- View total members
- View documents

---

### 5️⃣ VICE SECRETARY
**Login**: Phone + Password (Member2026)
**Dashboard**: Vice Secretary Dashboard
**Features** (Read-Only):
- View all events by type
- View recent activities
- View recent documents
- View document status
- View member records
- View notifications

---

### 6️⃣ PATRON
**Login**: Phone + Password (Member2026)
**Dashboard**: Patron Dashboard
**Features** (Read-Only):
- View total members
- View total collected payments
- View payment rate percentage
- View active events
- View role distribution
- View recent activities
- View member performance overview
- View members requiring attention

---

### 7️⃣ ADMIN (Treasurer)
**Login**: Phone + Password (Member2026)
**Dashboard**: Admin Dashboard
**Features** (Full Access):
- Manage members (add, edit, delete)
- Manage beneficiaries
- **Assign roles to members** ← Key feature
- View contributions
- View payments
- View unmatched payments
- Send bulk SMS
- Manage events
- Manage documents
- Manage news
- Manage notifications
- Configure settings
- Manage roles

---

## 🛡️ How to Assign Roles (Admin Only)

### Quick Steps:
1. **Login as Admin**
   - Phone: Admin phone
   - Password: Member2026

2. **Go to Members Page**
   - Click "Members" in sidebar

3. **Find Member**
   - Use search box to find by name, phone, or ID

4. **Click Shield Icon**
   - In the Actions column, click the shield icon

5. **Select Role**
   - Choose from dropdown:
     - Chairperson
     - Vice Chairperson
     - Secretary
     - Vice Secretary
     - Patron
     - Administrator

6. **Click Assign Role**
   - Role is assigned immediately
   - Badge appears in Role column

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LOGIN PAGE                            │
│  Phone: 0712345678                                       │
│  Password: Member2026                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              AUTH PROVIDER (useAuth)                     │
│  - Checks user credentials                              │
│  - Fetches user role from database                      │
│  - Stores role in context                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              APP ROUTES (AppRoutes)                      │
│  - Reads role from context                              │
│  - Routes to appropriate dashboard                      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        ▼            ▼            ▼              ▼
    ┌────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐
    │ Member │  │Secretary │  │Patron  │  │ Admin    │
    │ Layout │  │ Layout   │  │ Layout │  │ Layout   │
    └────────┘  └──────────┘  └────────┘  └──────────┘
        │            │            │              │
        ▼            ▼            ▼              ▼
    ┌────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐
    │ Member │  │Secretary │  │Patron  │  │ Admin    │
    │ Dash   │  │ Dash     │  │ Dash   │  │ Dash     │
    └────────┘  └──────────┘  └────────┘  └──────────┘
```

---

## 🔐 Database Role Storage

### user_roles Table
```sql
user_id (UUID) → role (VARCHAR)
```

### Example Data
```
User ID: abc123 → role: "secretary"
User ID: def456 → role: "chairperson"
User ID: ghi789 → role: "admin"
User ID: jkl012 → role: null (regular member)
```

---

## ✅ Verification Checklist

### After Assigning a Role:
- [ ] Role appears in Members table
- [ ] Role badge shows correct name
- [ ] Member can login with same credentials
- [ ] Member sees correct dashboard
- [ ] Member has correct features
- [ ] Other members unaffected

### Testing Each Role:
1. **Assign role to test member**
2. **Logout from admin account**
3. **Login with test member credentials**
4. **Verify correct dashboard appears**
5. **Verify correct features available**
6. **Verify read-only or write access as expected**

---

## 🎯 Common Workflows

### Workflow 1: Create Secretary
```
1. Admin creates member: "John Doe", "0712345678"
2. Admin goes to Members
3. Admin finds "John Doe"
4. Admin clicks Shield icon
5. Admin selects "Secretary"
6. Admin clicks "Assign Role"
7. John's row shows "Secretary" badge

When John logs in:
- Phone: 0712345678
- Password: Member2026
- Sees Secretary Dashboard
- Can manage events and meeting minutes
```

### Workflow 2: Promote Member to Chairperson
```
1. Admin finds member in Members list
2. Admin clicks Shield icon
3. Admin selects "Chairperson"
4. Admin clicks "Assign Role"
5. Member's role changes to Chairperson

When member logs in:
- Same credentials
- Sees Chairperson Dashboard
- Has read-only access to defaulters
```

### Workflow 3: Remove Role
```
1. Admin finds member with role
2. Admin clicks Shield icon
3. Admin clicks "Remove Role" button
4. Member's role is removed

When member logs in:
- Same credentials
- Sees Member Dashboard
- Back to regular member features
```

---

## 🚀 Key Features

✅ **Seamless Login**: No difference in login process
✅ **Automatic Routing**: System detects role and routes automatically
✅ **Same Credentials**: All users use phone + Member2026
✅ **Easy Assignment**: Admin assigns roles in Members page
✅ **Role Flexibility**: Can change roles anytime
✅ **Dashboard Customization**: Each role sees different features
✅ **Read-Only Access**: Some roles have read-only dashboards
✅ **Write Access**: Some roles can create/edit/delete
✅ **Audit Trail**: All role assignments tracked

---

## 📝 Important Notes

1. **Universal Password**: All members use "Member2026"
2. **Phone-Based Login**: Login uses phone number as identifier
3. **Role Detection**: System automatically detects role after login
4. **No Special Login**: No separate login for different roles
5. **Dashboard Only**: Only dashboard differs, login is identical
6. **Admin Assignment**: Only admins can assign roles
7. **One Role Per Member**: Each member has one role
8. **Easy Changes**: Roles can be changed anytime

---

## 🎉 Summary

The role-based system is completely **transparent to users**:
- They login normally with phone + password
- System automatically detects their role
- They see their role-specific dashboard
- No confusion, no special login process
- Simple and intuitive for all users

**Result**: A professional, role-based welfare management system where users login once and see their customized dashboard! 🚀