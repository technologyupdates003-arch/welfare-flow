# Step-by-Step Role Assignment with Screenshots

## 🎯 Complete Walkthrough

---

## PART 1: ASSIGNING A ROLE (Admin)

### Step 1: Login as Admin
```
Screen: Login Page
├─ Phone: [Your admin phone]
├─ Password: Member2026
└─ Click: Login Button
```

**Result**: You see Admin Dashboard

---

### Step 2: Navigate to Members
```
Screen: Admin Dashboard
├─ Sidebar on left
├─ Click: "Members" option
└─ Wait: Page loads
```

**Result**: Members page with table of all members

---

### Step 3: Find the Member
```
Screen: Members Page
├─ Search Box at top
├─ Type: Member name, phone, or ID
└─ Press: Enter or wait for results
```

**Example Search**:
- Name: "John Doe"
- Phone: "0712345678"
- ID: "32580859"

**Result**: Member appears in table

---

### Step 4: Locate Action Buttons
```
Screen: Members Table
├─ Find member row
├─ Look at Actions column (rightmost)
├─ See 4 buttons:
│  ├─ ✏️ Edit (pencil)
│  ├─ 👥 Beneficiaries (users)
│  ├─ 🛡️ Assign Role (shield) ← THIS ONE
│  └─ 🗑️ Delete (trash)
└─ Click: Shield icon
```

**Result**: Role assignment dialog opens

---

### Step 5: Select Role
```
Screen: Assign Role Dialog
├─ Title: "Assign Role to [Member Name]"
├─ Dropdown: "Select Role"
├─ Options:
│  ├─ Chairperson
│  ├─ Vice Chairperson
│  ├─ Secretary ← Example
│  ├─ Vice Secretary
│  ├─ Patron
│  └─ Administrator
└─ Click: Select "Secretary"
```

**Result**: "Secretary" is selected in dropdown

---

### Step 6: Confirm Assignment
```
Screen: Assign Role Dialog
├─ Selected Role: Secretary
├─ Button: "Assign Role"
└─ Click: "Assign Role" button
```

**Result**: Success message appears

---

### Step 7: Verify Assignment
```
Screen: Members Table
├─ Find member row
├─ Look at Role column
├─ See: "Secretary" badge
└─ Status: ✅ Role assigned successfully
```

**Result**: Member now has Secretary role

---

## PART 2: MEMBER LOGIN (Same for Everyone)

### Step 1: Open Application
```
Browser: http://localhost:8080/
Screen: Login Page
```

---

### Step 2: Enter Phone Number
```
Screen: Login Page
├─ Field: Phone Number
├─ Enter: 0712345678
│  (or +254712345678)
└─ Status: Phone entered
```

---

### Step 3: Enter Password
```
Screen: Login Page
├─ Field: Password
├─ Enter: Member2026
└─ Status: Password entered
```

---

### Step 4: Click Login
```
Screen: Login Page
├─ Button: Login
└─ Click: Login button
```

**Result**: System processes login

---

### Step 5: System Detects Role
```
Behind the scenes:
├─ System checks user credentials
├─ System queries database for role
├─ System finds: "secretary"
└─ System routes to Secretary Dashboard
```

---

### Step 6: See Dashboard
```
Screen: Secretary Dashboard
├─ Title: "Secretary Dashboard"
├─ Sidebar shows:
│  ├─ Dashboard
│  ├─ Manage Events
│  └─ Meeting Minutes
├─ Main area shows:
│  ├─ Total Events
│  ├─ Active Events
│  ├─ Total Members
│  └─ Documents
└─ Status: ✅ Logged in as Secretary
```

**Result**: User sees Secretary-specific dashboard

---

## PART 3: DIFFERENT ROLES, SAME LOGIN

### Example 1: Regular Member (No Role)
```
Login:
├─ Phone: 0712345678
├─ Password: Member2026
└─ Result: Member Dashboard
   ├─ Events
   ├─ Documents
   ├─ News
   └─ Profile
```

---

### Example 2: Chairperson
```
Login:
├─ Phone: 0712345678
├─ Password: Member2026
└─ Result: Chairperson Dashboard
   ├─ Active Members
   ├─ Total Collected
   ├─ Defaulters (read-only)
   └─ Active Events
```

---

### Example 3: Secretary
```
Login:
├─ Phone: 0712345678
├─ Password: Member2026
└─ Result: Secretary Dashboard
   ├─ Manage Events (create/edit/delete)
   ├─ Meeting Minutes (create/edit/delete)
   ├─ Total Events
   └─ Active Events
```

---

### Example 4: Admin
```
Login:
├─ Phone: 0712345678
├─ Password: Member2026
└─ Result: Admin Dashboard
   ├─ Members Management
   ├─ Contributions
   ├─ Payments
   ├─ Events
   ├─ Documents
   ├─ Settings
   └─ Role Assignment
```

---

## 🔄 CHANGING A ROLE

### To Change Secretary to Chairperson:

```
Step 1: Admin Dashboard → Members
Step 2: Find member
Step 3: Click Shield icon
Step 4: Select "Chairperson"
Step 5: Click "Assign Role"
Step 6: Member's role changes to Chairperson

When member logs in next time:
├─ Same phone & password
└─ Sees Chairperson Dashboard
```

---

## 🗑️ REMOVING A ROLE

### To Remove Role from Member:

```
Step 1: Admin Dashboard → Members
Step 2: Find member with role
Step 3: Click Shield icon
Step 4: Click "Remove Role" button
Step 5: Role is removed

When member logs in next time:
├─ Same phone & password
└─ Sees Member Dashboard (regular member)
```

---

## ✅ VERIFICATION CHECKLIST

After assigning a role, verify:

```
☐ Role appears in Members table
☐ Role badge shows correct name
☐ Member can login with same credentials
☐ Member sees correct dashboard
☐ Member has correct features
☐ Other members unaffected
☐ Role persists after logout/login
```

---

## 🎯 QUICK REFERENCE

### Assign Role:
```
Members → Find Member → Shield Icon → Select Role → Assign
```

### Remove Role:
```
Members → Find Member → Shield Icon → Remove Role
```

### Change Role:
```
Members → Find Member → Shield Icon → Select New Role → Assign
```

### Login (Any Role):
```
Phone: 0712345678
Password: Member2026
```

---

## 📝 IMPORTANT REMINDERS

✅ **All users use same password**: Member2026
✅ **Login is identical**: No special process for roles
✅ **System detects role**: Automatic routing
✅ **Only dashboard differs**: Login experience is same
✅ **Roles can be changed**: Anytime by admin
✅ **Instant effect**: Changes take effect immediately

---

## 🚀 YOU'RE READY!

You now know:
1. ✅ How to assign roles (Admin)
2. ✅ How users login (Same for everyone)
3. ✅ How system routes to dashboards (Automatic)
4. ✅ How to change roles (Easy)
5. ✅ How to remove roles (Simple)

**The system is ready to use!** 🎉