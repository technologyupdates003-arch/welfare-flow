# Welfare Flow - System Overview (Visual Guide)

## 🎯 System Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    WELFARE FLOW SYSTEM                      │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │   USER LOGIN     │
                    │ Phone + Member   │
                    │      2026        │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  AUTHENTICATION  │
                    │  (Supabase Auth) │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  ROLE DETECTION  │
                    │ (user_roles tbl) │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────┐          ┌────────┐          ┌────────┐
    │ ADMIN  │          │ OFFICE │          │MEMBER  │
    │DASHBOARD          │BEARER  │          │DASHBOARD
    │        │          │DASHBOARD          │        │
    └────────┘          └────────┘          └────────┘
        │                    │                    │
        ├─ Members Mgmt      ├─ Chairperson      ├─ Profile
        ├─ Role Assignment   ├─ Vice Chair       ├─ Events
        ├─ Beneficiaries     ├─ Secretary        ├─ Documents
        ├─ All Reports       ├─ Vice Secretary   ├─ News
        └─ Full Access       ├─ Patron           └─ Beneficiaries
                             └─ (Read-only)
```

---

## 👥 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      ROLE HIERARCHY                         │
└─────────────────────────────────────────────────────────────┘

ADMIN (Full Access)
├── Can manage all members
├── Can assign roles
├── Can manage beneficiaries
├── Can view all reports
└── Can access all features

OFFICE BEARERS (Specialized Access)
├── CHAIRPERSON (Read-only)
│   ├── View defaulters
│   ├── View payments
│   └── View active members
│
├── VICE CHAIRPERSON (Read-only)
│   ├── View events
│   ├── View member stats
│   └── View penalties
│
├── SECRETARY (Read & Write)
│   ├── Manage events (create/edit/delete)
│   ├── Create meeting minutes
│   ├── Edit meeting minutes
│   └── Delete meeting minutes
│
├── VICE SECRETARY (Read-only)
│   ├── View records
│   └── View documentation
│
└── PATRON (Read-only)
    ├── View governance overview
    └── View performance metrics

MEMBER (Standard Access)
└── View personal features only
```

---

## 🔐 Login Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      LOGIN PROCESS                           │
└──────────────────────────────────────────────────────────────┘

STEP 1: Enter Credentials
┌─────────────────────────────┐
│ Phone: 0712345678           │
│ Password: Member2026        │
└──────────┬──────────────────┘
           │
STEP 2: Authenticate
┌──────────▼──────────────────┐
│ Supabase Auth Check         │
│ ✓ Phone exists              │
│ ✓ Password correct          │
└──────────┬──────────────────┘
           │
STEP 3: Detect Role
┌──────────▼──────────────────┐
│ Query user_roles table      │
│ Find user's assigned role   │
└──────────┬──────────────────┘
           │
STEP 4: Route to Dashboard
┌──────────▼──────────────────┐
│ If role = 'secretary'       │
│   → Secretary Dashboard     │
│ If role = 'chairperson'     │
│   → Chairperson Dashboard   │
│ If role = 'admin'           │
│   → Admin Dashboard         │
│ If no role                  │
│   → Member Dashboard        │
└─────────────────────────────┘

✓ SEAMLESS - User sees no difference in login process
✓ AUTOMATIC - System detects role and shows correct dashboard
✓ TRANSPARENT - Only dashboard features differ
```

---

## 📊 Member Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│              MEMBER MANAGEMENT (Admin Only)                  │
└──────────────────────────────────────────────────────────────┘

ADD MEMBER
┌─────────────────────────────┐
│ Click: + Add Member         │
│ Enter: Name, ID, Phone      │
│ Click: Add Member           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Creates:                    │
│ • User account (Supabase)   │
│ • Member record             │
│ • Default role: 'member'    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Member can now login with   │
│ phone + Member2026          │
└─────────────────────────────┘

EDIT MEMBER
┌─────────────────────────────┐
│ Click: Edit icon            │
│ Update: Name, ID, Phone     │
│ Click: Update Member        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Member record updated       │
│ Changes take effect         │
│ immediately                 │
└─────────────────────────────┘

ASSIGN ROLE
┌─────────────────────────────┐
│ Click: Shield icon          │
│ Select: Role from dropdown  │
│ Click: Assign Role          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Upsert into user_roles:     │
│ user_id → role              │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Next login:                 │
│ User sees new dashboard     │
│ Role appears in table       │
└─────────────────────────────┘

MANAGE BENEFICIARIES
┌─────────────────────────────┐
│ Click: Users icon           │
│ Click: Add Beneficiary tab  │
│ Enter: Name, Relationship   │
│ Click: Add Beneficiary      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Beneficiary added to:       │
│ beneficiaries table         │
│ Linked to member_id         │
└─────────────────────────────┘

DELETE MEMBER
┌─────────────────────────────┐
│ Click: Trash icon           │
│ Confirm: Delete             │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Member deleted from:        │
│ • members table             │
│ • user_roles table          │
│ • beneficiaries table       │
└─────────────────────────────┘
```

---

## 🔄 Role Assignment Process

```
┌──────────────────────────────────────────────────────────────┐
│              ROLE ASSIGNMENT WORKFLOW                        │
└──────────────────────────────────────────────────────────────┘

BEFORE ASSIGNMENT
┌─────────────────────────────┐
│ Members Table               │
├─────────────────────────────┤
│ Name: John Doe              │
│ Phone: 0712345678           │
│ ID: 12345678                │
│ Role: No Role ⚪            │
│ Actions: [Edit] [Users]     │
│          [Shield] [Delete]  │
└─────────────────────────────┘

CLICK SHIELD ICON
┌─────────────────────────────┐
│ Assign Role Dialog          │
├─────────────────────────────┤
│ Select Role:                │
│ ┌─────────────────────────┐ │
│ │ Chairperson             │ │
│ │ Vice Chairperson        │ │
│ │ Secretary               │ │
│ │ Vice Secretary          │ │
│ │ Patron                  │ │
│ │ Administrator           │ │
│ └─────────────────────────┘ │
│                             │
│ [Assign Role] [Remove Role] │
└─────────────────────────────┘

SELECT SECRETARY
┌─────────────────────────────┐
│ Role selected: Secretary    │
│ Click: Assign Role          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Database Update:            │
│ INSERT INTO user_roles      │
│ (user_id, role)             │
│ VALUES (uuid, 'secretary')  │
│ ON CONFLICT DO UPDATE       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Toast: "Role assigned!"     │
│ Dialog closes               │
└──────────┬──────────────────┘
           │
           ▼
AFTER ASSIGNMENT
┌─────────────────────────────┐
│ Members Table               │
├─────────────────────────────┤
│ Name: John Doe              │
│ Phone: 0712345678           │
│ ID: 12345678                │
│ Role: Secretary 🔵          │
│ Actions: [Edit] [Users]     │
│          [Shield] [Delete]  │
└─────────────────────────────┘

NEXT LOGIN
┌─────────────────────────────┐
│ John logs in with:          │
│ Phone: 0712345678           │
│ Password: Member2026        │
│                             │
│ System detects:             │
│ role = 'secretary'          │
│                             │
│ Shows:                      │
│ Secretary Dashboard ✓       │
│ • Event Management          │
│ • Meeting Minutes           │
│ • Member Data (read-only)   │
└─────────────────────────────┘
```

---

## 📋 Members Table Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    MEMBERS TABLE                             │
├──────────────────────────────────────────────────────────────┤
│ Name    │ Phone      │ ID      │ Role        │ Contrib │ Pen │
├─────────┼────────────┼─────────┼─────────────┼─────────┼─────┤
│ John    │ 0712345678 │ 1234567 │ Secretary   │ 50,000  │ 0   │
│ Jane    │ 0712345679 │ 1234568 │ Chairperson │ 75,000  │ 0   │
│ Bob     │ 0712345680 │ 1234569 │ No Role     │ 25,000  │ 500 │
│ Alice   │ 0712345681 │ 1234570 │ Patron      │ 100,000 │ 0   │
│ Charlie │ 0712345682 │ 1234571 │ No Role     │ 30,000  │ 0   │
└─────────┴────────────┴─────────┴─────────────┴─────────┴─────┘

ACTIONS COLUMN:
[Edit] - Update member info
[Users] - Manage beneficiaries
[Shield] - Assign/remove role
[Delete] - Remove member
```

---

## 🔐 Database Security (RLS)

```
┌──────────────────────────────────────────────────────────────┐
│            ROW LEVEL SECURITY POLICIES                       │
└──────────────────────────────────────────────────────────────┘

MEMBERS TABLE
├─ Office bearers can view all members
├─ Members can view own profile
└─ Admin can do everything

EVENTS TABLE
├─ Secretaries can create/edit/delete
├─ Office bearers can view
└─ Members can view

MEETING_MINUTES TABLE
├─ Secretaries can create/edit/delete own
├─ Admin can do everything
├─ Office bearers can view
└─ Members cannot access

PAYMENTS TABLE
├─ Office bearers can view
├─ Admin can do everything
└─ Members cannot access

CONTRIBUTIONS TABLE
├─ Office bearers can view
├─ Admin can do everything
└─ Members cannot access

PENALTIES TABLE
├─ Office bearers can view
├─ Admin can do everything
└─ Members cannot access

BENEFICIARIES TABLE
├─ Office bearers can view
├─ Members can view own
├─ Admin can do everything
└─ Others cannot access
```

---

## 📱 Dashboard Navigation

```
┌──────────────────────────────────────────────────────────────┐
│                  NAVIGATION STRUCTURE                        │
└──────────────────────────────────────────────────────────────┘

ADMIN DASHBOARD
├─ Dashboard (overview)
├─ Members (management + role assignment)
├─ Contributions
├─ Payments
├─ Unmatched Payments
├─ Bulk SMS
├─ Events
├─ Documents
├─ News
├─ Notifications
└─ Settings

SECRETARY DASHBOARD
├─ Dashboard (overview)
├─ Events (manage)
├─ Meeting Minutes (manage)
└─ (Read-only access to member data)

CHAIRPERSON DASHBOARD
├─ Dashboard (overview)
└─ (Read-only: defaulters, payments, members)

VICE CHAIRPERSON DASHBOARD
├─ Dashboard (overview)
└─ (Read-only: events, stats, penalties)

VICE SECRETARY DASHBOARD
├─ Dashboard (overview)
└─ (Read-only: records, documentation)

PATRON DASHBOARD
├─ Dashboard (overview)
└─ (Read-only: governance, metrics)

MEMBER DASHBOARD
├─ Dashboard (overview)
├─ Events
├─ Documents
├─ Downloads
├─ News
├─ Beneficiaries
├─ Notifications
└─ Profile
```

---

## 🎯 Key Features Summary

```
┌──────────────────────────────────────────────────────────────┐
│                    FEATURE MATRIX                            │
├──────────────────────────────────────────────────────────────┤
│ Feature              │ Admin │ Secretary │ Office │ Member   │
├──────────────────────┼───────┼───────────┼────────┼──────────┤
│ Add Members          │  ✓    │     ✗     │   ✗    │    ✗     │
│ Edit Members         │  ✓    │     ✗     │   ✗    │    ✗     │
│ Delete Members       │  ✓    │     ✗     │   ✗    │    ✗     │
│ Assign Roles         │  ✓    │     ✗     │   ✗    │    ✗     │
│ Manage Beneficiaries │  ✓    │     ✗     │   ✗    │    ✓     │
│ Create Events        │  ✓    │     ✓     │   ✗    │    ✗     │
│ Edit Events          │  ✓    │     ✓     │   ✗    │    ✗     │
│ Delete Events        │  ✓    │     ✓     │   ✗    │    ✗     │
│ View Events          │  ✓    │     ✓     │   ✓    │    ✓     │
│ Create Minutes       │  ✓    │     ✓     │   ✗    │    ✗     │
│ Edit Minutes         │  ✓    │     ✓     │   ✗    │    ✗     │
│ Delete Minutes       │  ✓    │     ✓     │   ✗    │    ✗     │
│ View Minutes         │  ✓    │     ✓     │   ✓    │    ✗     │
│ View Payments        │  ✓    │     ✓     │   ✓    │    ✗     │
│ View Contributions   │  ✓    │     ✓     │   ✓    │    ✗     │
│ View Penalties       │  ✓    │     ✓     │   ✓    │    ✗     │
│ View Members         │  ✓    │     ✓     │   ✓    │    ✗     │
│ View Profile         │  ✓    │     ✓     │   ✓    │    ✓     │
│ View News            │  ✓    │     ✓     │   ✓    │    ✓     │
│ View Documents       │  ✓    │     ✓     │   ✓    │    ✓     │
└──────────────────────┴───────┴───────────┴────────┴──────────┘

✓ = Can access/perform
✗ = Cannot access/perform
```

---

## 🚀 Quick Start

```
┌──────────────────────────────────────────────────────────────┐
│                    QUICK START STEPS                         │
└──────────────────────────────────────────────────────────────┘

1. START DEV SERVER
   npm run dev
   → Runs on port 8081

2. LOGIN AS ADMIN
   Phone: 0712345678 (or any admin phone)
   Password: Member2026

3. ADD A MEMBER
   Members → + Add Member
   Enter: Name, ID, Phone
   Click: Add Member

4. ASSIGN A ROLE
   Find member → Click Shield icon
   Select: Secretary
   Click: Assign Role

5. TEST SECRETARY LOGIN
   Logout → Login with secretary's phone
   Password: Member2026
   → See Secretary Dashboard

6. CREATE MEETING MINUTES
   Secretary Dashboard → Meeting Minutes
   Click: + New Minutes
   Fill in details
   Click: Save

✓ System is ready to use!
```

---

**Last Updated**: April 17, 2026
**System Status**: ✅ FULLY OPERATIONAL
