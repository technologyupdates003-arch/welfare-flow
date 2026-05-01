# RBAC Implementation Plan

## Current State
- Roles exist in DB but don't control access
- UI shows "No Role" even when roles are assigned
- No dashboard access control based on roles
- No permission enforcement

## Phase 1: Fix Role Display + Assignment (TODAY)
1. ✅ Members table shows actual roles
2. ✅ Assign/Remove role works with instant UI update
3. ✅ Real-time subscription updates role display

## Phase 2: Role → Dashboard Mapping
1. Create role-permission matrix
2. Update sidebar to show/hide based on role
3. Protect routes with role guards

## Phase 3: Permission Enforcement
1. Backend API checks role before returning data
2. RLS policies enforce role-based access
3. Audit logging for role changes

## Role Definitions
- **admin**: Full system access
- **chairperson**: Meeting minutes, approvals
- **secretary**: Meeting minutes, records
- **vice_chairperson**: Read-only access
- **vice_secretary**: Secretary duties
- **patron**: Limited access
- **member**: View own data only
- **super_admin**: Full system + user management

## Database Structure
```
user_roles (existing)
├── user_id
├── role
└── is_active

permissions (new)
├── id
├── role
├── resource
└── action

role_permissions (new)
├── role_id
├── permission_id
```
