# Phase 8: Workflow Simplification — Detailed Plan

> Based on stakeholder meeting notes: Post → Verify → Approve → Check

## Investigation Results

### Current state audit (files touched by this change)

| Layer | File | Touches |
|-------|------|---------|
| **Backend** | `SpendRequestsController.cs` | Status constants, `CanTransition()`, `UserContext`, `NormalizeStatus()`, `BuildUserContext()`, `FilterByScope()`, `CanAccessRequest()` |
| **Backend** | `02_seed_data.sql` | Role names |
| **Frontend** | `AuthContext.tsx` | Role type, `ROLES[]`, `ELEVATED_ROLES[]`, `mapBackendRole()` |
| **Frontend** | `mock-data.ts` | `RequestStatus` type, `STATUS_META`, `APPROVAL_STEPS`, 7 hardcoded spend requests |
| **Frontend** | `status-badge.tsx` | Uses `STATUS_META` directly |
| **Frontend** | `request-slideover.tsx` | Uses `SpendRequest`, `formatCurrency` |
| **Frontend** | `request-form.tsx` | Uses `spendRequests`, `departments`, `categoryTree`, `vendors` |
| **Frontend** | `basic-dashboard.tsx` | Uses `spendRequests` mock data |
| **Frontend** | `SpendRequestsList.tsx` | Status filter dropdown, table |
| **Frontend** | `SpendRequestDetail.tsx` | `APPROVAL_STEPS`, timeline, `canAct` check, status-badge |
| **Frontend** | `app-sidebar.tsx` | `role === 'Admin'` check for Master Data/Users |
| **Frontend** | `App.tsx` | Route definitions (no changes needed) |
| **DB** | `dbo.Role` table | Row 1-5: Encodeur, Directeur BU/SU, Validation FPA, Val MD, Administrateur |
| **DB** | `dbo.User` table | 5 test users with RoleId references |

---

## Step 1: Database — Rename Roles

**File:** `DB/InfoFin.DB.DbUp/Scripts/02_seed_data.sql`

**Current:**
```sql
INSERT INTO [dbo].[Role] ([Name]) VALUES 
('Encodeur'),
('Directeur BU/SU'),
('Validation FPA'),
('Val MD'),
('Administrateur');
```

**Change to:**
```sql
INSERT INTO [dbo].[Role] ([Name]) VALUES 
('Financial Analyst'),
('FPA Reviewer'),
('FPA Approver'),
('Administrateur');
```

| Old ID | Old Name | New ID | New Name | Notes |
|--------|----------|--------|----------|-------|
| 1 | Encodeur | 1 | Financial Analyst | Dept analyst who posts |
| 2 | Directeur BU/SU | 2 | FPA Reviewer | FPA who verifies |
| 3 | Validation FPA | 3 | FPA Approver | FPA who approves |
| 4 | Val MD | *(removed)* | — | Not in workflow |
| 5 | Administrateur | 4 | Administrateur | System admin |

**Warning:** This changes RoleId assignments. Existing users will need remapping. If a clean DB reset is acceptable (re-run DbUp on fresh DB), no migration needed. Otherwise, write an UPDATE migration.

**Test users update:**
```sql
INSERT INTO [dbo].[User] ([Email], [PasswordHash], [RoleId], [DepartmentId], [IsActive])
VALUES
('admin@infoset.cd',              'admin', 4, NULL, 1),
('analyst.cirrus@infoset.cd',     'pass',  1, 1, 1),
('reviewer@infoset.cd',           'pass',  2, 6, 1),
('approver@infoset.cd',           'pass',  3, 6, 1);
```

---

## Step 2: Backend — Update SpendRequestsController.cs

### 2a: Status Constants (lines 15-19)

**Current:**
```csharp
private const string StatusPendingDirector = "PendingDirector";
private const string StatusPendingFpa = "PendingFPA";
private const string StatusPendingMd = "PendingMD";
private const string StatusApproved = "Approved";
private const string StatusDeclined = "Declined";
```

**New:**
```csharp
private const string StatusPosted = "Posted";
private const string StatusUnderReview = "UnderReview";
private const string StatusApproved = "Approved";
private const string StatusCompleted = "Completed";
private const string StatusDeclined = "Declined";
```

### 2b: Create method (line 144)

**Current:** `Status = StatusPendingDirector`
**New:** `Status = StatusPosted`

### 2c: UserContext (line 370-380)

Remove `IsDirector`, `IsMd`. Add `IsReviewer`, `IsApprover`.

```csharp
private sealed class UserContext
{
    public int UserId { get; init; }
    public int? DepartmentId { get; init; }
    public string RoleName { get; init; } = string.Empty;
    public bool IsAnalyst { get; init; }    // was IsEncoder
    public bool IsReviewer { get; init; }    // new
    public bool IsApprover { get; init; }    // new
    public bool IsAdmin { get; init; }
}
```

### 2d: BuildUserContext (line 230-250)

**Current:** `RoleContains(roleName, "ENCODEUR")`, `RoleContains(roleName, "DIRECTEUR")`, etc.

**New:**
```csharp
IsAnalyst  = RoleContains(roleName, "ANALYST"),
IsReviewer = RoleContains(roleName, "REVIEWER"),
IsApprover = RoleContains(roleName, "APPROVER"),
IsAdmin    = RoleContains(roleName, "ADMIN")
```

### 2e: CanTransition (line 329-340)

**Current:** Director→FPA→MD chain.

**New flow:**
```csharp
return currentStatus switch
{
    StatusPosted => context.IsReviewer && (targetStatus == StatusUnderReview || targetStatus == StatusDeclined),
    StatusUnderReview => context.IsApprover && (targetStatus == StatusApproved || targetStatus == StatusDeclined),
    StatusApproved => context.IsAnalyst && targetStatus == StatusCompleted,
    _ => false
};
```

Also keep admin override: `context.IsAdmin` can move any non-terminal status.

### 2f: NormalizeStatus (line 347-360)

```csharp
return normalized switch
{
    "POSTED" => StatusPosted,
    "UNDERREVIEW" => StatusUnderReview,
    "APPROVED" => StatusApproved,
    "COMPLETED" => StatusCompleted,
    "DECLINED" => StatusDeclined,
    _ => null
};
```

### 2g: FilterByScope & CanAccessRequest

Replace `IsEncoder` → `IsAnalyst`. Replace `IsFpa || IsMd` → `IsReviewer || IsApprover`. Remove Director scope logic.

---

## Step 3: Frontend — AuthContext.tsx

### 3a: Role type (line 6-10)

**Current:**
```ts
export type Role = "Admin" | "Requester" | "Director" | "FP&A" | "Managing Director";
```

**New:**
```ts
export type Role = "Admin" | "Financial Analyst" | "FPA Reviewer" | "FPA Approver";
```

### 3b: ROLES array + ELEVATED_ROLES

```ts
export const ROLES: Role[] = ["Admin", "Financial Analyst", "FPA Reviewer", "FPA Approver"];

const ELEVATED_ROLES: Role[] = ["Admin", "FPA Reviewer", "FPA Approver"];
```

### 3c: mapBackendRole

```ts
function mapBackendRole(backendRole: string): Role {
  const r = backendRole.toLowerCase();
  if (r.includes("admin")) return "Admin";
  if (r.includes("analyst")) return "Financial Analyst";
  if (r.includes("reviewer")) return "FPA Reviewer";
  if (r.includes("approver")) return "FPA Approver";
  return "Financial Analyst";
}
```

---

## Step 4: Frontend — mock-data.ts

### 4a: RequestStatus type

**Current:**
```ts
export type RequestStatus = 'draft' | 'pending_director' | 'pending_fpa' | 'pending_md' | 'approved' | 'declined';
```

**New:**
```ts
export type RequestStatus = 'posted' | 'under_review' | 'approved' | 'completed' | 'declined';
```

### 4b: STATUS_META

```ts
export const STATUS_META: Record<RequestStatus, {...}> = {
  posted:       { label: 'Posted', variant: 'default' },
  under_review: { label: 'Under Review', variant: 'warning' },
  approved:     { label: 'Approved', variant: 'success' },
  completed:    { label: 'Completed', variant: 'neutral' },
  declined:     { label: 'Declined', variant: 'danger' },
};
```

### 4c: APPROVAL_STEPS

```ts
export const APPROVAL_STEPS = ['Posted', 'Under Review', 'Approved', 'Completed'] as const;
```

### 4d: 7 mock spend requests

Update all `status` and `timeline` values to use new status strings. Example for SR-2026-0148:
```ts
status: 'under_review',
timeline: [
  { step: 'Posted', actor: 'Dana Whitfield', state: 'done', date: '2026-06-18' },
  { step: 'Under Review', actor: 'FPA Reviewer', state: 'current' },
  { step: 'Approved', actor: 'Pending', state: 'pending' },
  { step: 'Completed', actor: 'Pending', state: 'pending' },
],
```

---

## Step 5: Frontend — SpendRequestDetail.tsx

### 5a: `canAct` check (line ~50)

**Current:** checks `pending_director`, `pending_fpa`, `pending_md`
**New:** checks `posted` (reviewer), `under_review` (approver), `approved` (analyst)

### 5b: Step indicator rendering

The step indicator maps `APPROVAL_STEPS` to timeline. Already portable — just need the new step names in `APPROVAL_STEPS` and timeline data.

---

## Step 6: Frontend — SpendRequestsList.tsx

Status filter dropdown uses `STATUS_META` keys — automatically updated via Step 4.

---

## Step 7: Frontend — app-sidebar.tsx

**Current:** `role === 'Admin'` for Master Data/Users visibility.

**No change needed** — Admin is still the admin role name.

---

## Step 8: DB — Run Migration

1. Drop existing `dbo.Role` and `dbo.User` test rows
2. Re-run DbUp with updated `02_seed_data.sql`
3. Or: run manual SQL to UPDATE roles and UPDATE user RoleIds

---

## Execution Order

```
Step 1: DB roles      ──► Step 8: Run migration
Step 2: Backend       ──► Build API, fix errors
Step 3: AuthContext   ──►
Step 4: mock-data     ──►
Step 5: Detail page   ──►
Step 6: List page     ──► (auto-fixed by Step 4)
Step 7: Sidebar       ──► (no change needed)
                         ──► Final build ──► Clean
```

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| RoleId shift breaks existing users | Drop & recreate DB (clean slate) |
| Frontend mock data ≠ real status after change | Update all 7 mock records |
| `NormalizeStatus` old names still sent from frontend | Update all `transition` POST bodies |
| Director scope logic removed but still referenced | Compiler catches unused code |
