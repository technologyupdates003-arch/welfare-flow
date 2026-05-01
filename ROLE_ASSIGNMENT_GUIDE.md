# How to Assign Roles to Members

## 📋 Step-by-Step Guide

### Step 1: Login as Admin
1. Open the application
2. Login with admin credentials
3. You'll see the Admin Dashboard

### Step 2: Go to Members Page
1. Click **Members** in the sidebar
2. You'll see a list of all members with their information

### Step 3: Find the Member to Assign Role
1. Use the search box to find the member by name, phone, or ID number
2. Locate the member in the table

### Step 4: Click the Shield Icon
In the **Actions** column, you'll see 4 buttons:
- ✏️ Edit (pencil icon)
- 👥 Beneficiaries (users icon)
- 🛡️ **Assign Role** (shield icon) ← Click this
- 🗑️ Delete (trash icon)

### Step 5: Select a Role
A dialog will appear with:
- **Select Role** dropdown
- Choose from:
  - Chairperson
  - Vice Chairperson
  - Secretary
  - Vice Secretary
  - Patron
  - Administrator

### Step 6: Assign the Role
1. Select the role from dropdown
2. Click **Assign Role** button
3. You'll see a success message
4. The role will appear in the **Role** column

### Step 7: Verify Role Assignment
- The member's row will now show their assigned role in a badge
- Example: "Chairperson" badge will appear in the Role column

---

## 🔄 How Role-Based Login Works

### Login Process (Same for Everyone)
1. Enter phone number (e.g., 0712345678)
2. Enter password (Member2026)
3. Click Login

### After Login - Dashboard Routing
The system automatically detects the user's role and shows:

| Role | Dashboard | Features |
|------|-----------|----------|
| **No Role** | Member Dashboard | View events, documents, news, profile |
| **Chairperson** | Chairperson Dashboard | View defaulters, payments (read-only) |
| **Vice Chairperson** | Vice Chairperson Dashboard | View events, member stats (read-only) |
| **Secretary** | Secretary Dashboard | Manage events, record meeting minutes |
| **Vice Secretary** | Vice Secretary Dashboard | View documents, records (read-only) |
| **Patron** | Patron Dashboard | Oversight, view all statistics |
| **Admin** | Admin Dashboard | Full system access |

---

## 📊 Example Scenarios

### Scenario 1: Assign Secretary Role
1. Admin logs in
2. Goes to Members page
3. Searches for "John Doe"
4. Clicks Shield icon
5. Selects "Secretary"
6. Clicks "Assign Role"
7. John's row now shows "Secretary" badge

**When John logs in:**
- Uses phone: 0712345678
- Uses password: Member2026
- Sees Secretary Dashboard with event management and meeting minutes

### Scenario 2: Assign Chairperson Role
1. Admin logs in
2. Goes to Members page
3. Searches for "Jane Smith"
4. Clicks Shield icon
5. Selects "Chairperson"
6. Clicks "Assign Role"
7. Jane's row now shows "Chairperson" badge

**When Jane logs in:**
- Uses phone: 0712345678
- Uses password: Member2026
- Sees Chairperson Dashboard with read-only access to defaulters and payments

---

## 🔐 Important Notes

### Login Credentials
- **Phone**: Same as member phone (e.g., 0712345678 or +254712345678)
- **Password**: Member2026 (universal password for all members)
- **No difference** in login process regardless of role

### Role Assignment Requirements
- Member must have a user account (created through "Add Member")
- Only admins can assign roles
- One role per member at a time
- Can change role anytime by reassigning

### Dashboard Access
- Role determines which dashboard is shown
- No separate login for different roles
- Same credentials work for all roles
- Only dashboard features differ

---

## 🎯 Quick Reference

### To Assign a Role:
```
Admin Dashboard → Members → Find Member → Shield Icon → Select Role → Assign
```

### To Remove a Role:
```
Admin Dashboard → Members → Find Member → Shield Icon → Remove Role Button
```

### To Change a Role:
```
Admin Dashboard → Members → Find Member → Shield Icon → Select New Role → Assign
```

---

## ✅ Verification Checklist

After assigning a role, verify:
- [ ] Role appears in the Role column
- [ ] Role badge shows correct role name
- [ ] Member can still login with same credentials
- [ ] Member sees correct dashboard after login
- [ ] Member's features match their role

---

## 🚀 Common Tasks

### Add a New Secretary
1. Create member: Name, Phone, ID
2. Go to Members
3. Find the member
4. Click Shield icon
5. Select "Secretary"
6. Click Assign Role
✅ Done! Member is now a Secretary

### Promote Member to Chairperson
1. Go to Members
2. Find the member
3. Click Shield icon
4. Select "Chairperson"
5. Click Assign Role
✅ Done! Member is now Chairperson

### Remove Role from Member
1. Go to Members
2. Find the member with role
3. Click Shield icon
4. Click "Remove Role" button
✅ Done! Member is back to regular member

---

## 📝 Notes

- All members use the same password: **Member2026**
- Login is identical for all users
- Only dashboard changes based on role
- Roles can be changed anytime
- No special login process needed
- System automatically routes to correct dashboard

The role system is completely transparent to users - they login normally and see their role-specific dashboard! 🎉