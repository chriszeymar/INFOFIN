# Phase 9: Expense Management Restructure + Role Alignment

> All stakeholder questions answered. Final spec.

---

## Confirmed Decisions

| # | Question | Answer |
|---|----------|--------|
| Q1 | Budgets location | **Top-level** — its own feature |
| Q2 | Labels | **"Expenses"** (parent), **"Requests"** (sub-item) |
| Q3 | Mockup cards | **Reimbursements**, **Reports**, **Purchase Orders** |
| Q4 | Dashboard split | **Keep**: Analyst→Basic, Reviewer/Approver/Admin→Full |

**New requirement:** Requests must be **assignable** to a specific reviewer or department after posting.

---

## Final Sidebar

```
Dashboard
Expenses ▾
  ├─ Overview
  └─ Requests
Budgets
Master Data (admin)
───
User Management (admin)
Profile
```

## Final Routes

| Route | Component |
|-------|-----------|
| `/` | Dashboard |
| `/expenses` | ExpenseManagement (card hub) |
| `/expenses/requests` | SpendRequestsList |
| `/expenses/requests/new` | RequestForm |
| `/expenses/requests/:id` | SpendRequestDetail |
| `/budgets` | BudgetManagement |
| `/master-data` | MasterData |
| `/users` | UserManagement |
| `/profile` | Profile |

---

## New: Request Assignment

| DB | Add `AssignedToUserId INT NULL FK → User(Id)` to `SpendRequest` |
| Backend | Add to `CreateSpendRequestRequest`, set on Create, allow update on Transition |
| Frontend | Dropdown in RequestForm, display in Detail, filter in List |

---

## Expense Management Landing (`/expenses`)

| Card | Icon | Link | Status |
|------|------|------|--------|
| **Requests** | FileText | `/expenses/requests` | ✅ Active |
| **Reimbursements** | Receipt | `#` | 🔒 Coming Soon |
| **Reports** | BarChart3 | `#` | 🔒 Coming Soon |
| **Purchase Orders** | ShoppingCart | `#` | 🔒 Coming Soon |

---

## Request Status Flow

```
POSTED → UNDER_REVIEW → APPROVED → COMPLETED
  ↓           ↓              ↓
  └── DECLINED ◄──────────────┘
```

| Status | Who Acts | Next |
|--------|----------|------|
| POSTED | FPA Reviewer | UNDER_REVIEW or DECLINED |
| UNDER_REVIEW | FPA Approver | APPROVED or DECLINED |
| APPROVED | Financial Analyst | COMPLETED |

---

## Role Visibility Matrix

| Feature | Analyst | Reviewer | Approver | Admin |
|---------|:---:|:---:|:---:|:---:|
| Dashboard | Basic (dept) | Full | Full | Full |
| Expenses → Overview | ✅ | ✅ | ✅ | ✅ |
| Expenses → Requests | Own dept | All | All | All |
| New Request | ✅ | — | — | ✅ |
| Approve | — | Posted→Review | Review→Approved | ✅ |
| Complete | ✅ | — | — | ✅ |
| Budgets | ✅ (own) | ✅ | ✅ | ✅ |
| Master Data | — | — | — | ✅ |

---

## Files Touched (19 total)

| # | File | Change |
|---|------|--------|
| 1 | `DB/01_initial_schema.sql` | Add `AssignedToUserId INT NULL FK` to SpendRequest |
| 2 | `DB/02_seed_data.sql` | 5→4 roles, new test users |
| 3 | `Api/SpendRequestsController.cs` | Status, UserContext, CanTransition, NormalizeStatus, assignment |
| 4 | `Api/CreateSpendRequestRequest.cs` | Add `AssignedToUserId` |
| 5 | `Model/SpendRequest.Gen.cs` | Add `AssignedToUserId` property |
| 6 | `src/auth/AuthContext.tsx` | Role type, ROLES, mapBackendRole |
| 7 | `src/lib/mock-data.ts` | Statuses, STATUS_META, APPROVAL_STEPS, mock records |
| 8 | `src/components/requests/request-form.tsx` | Assignee dropdown |
| 9 | `src/components/dashboard/basic-dashboard.tsx` | Status checks |
| 10 | `src/pages/SpendRequestDetail.tsx` | canAct, assignment display |
| 11 | `src/pages/ExpenseManagement.tsx` | **NEW** — card hub |
| 12 | `src/components/app-sidebar.tsx` | Collapsible Expenses |
| 13 | `src/components/app-shell.tsx` | titleFor() |
| 14 | `src/components/top-bar.tsx` | labelFor() |
| 15 | `src/App.tsx` | New `/expenses/*` routes |
| 16 | `src/pages/SpendRequestsList.tsx` | Auto-updated via STATUS_META |
| 17 | `src/pages/BudgetManagement.tsx` | No change |
| 18 | `src/components/requests/status-badge.tsx` | No change (STATUS_META updated) |
| 19 | `src/components/requests/request-slideover.tsx` | No change |

---

## Execution Order

```
Phase 9a ──► DB + Backend (files 1-5)
Phase 9b ──► Frontend foundation (files 6-7)
Phase 9c ──► Feature pages (files 8-11)
Phase 9d ──► Navigation (files 12-15)
Phase 9e ──► Final build → zero errors
```
