# Meeting Notes — Gap Analysis

> Source: Stakeholder meeting, July 2026

---

## Meeting Notes Summary

1. **Not all employees** will have access to this platform.
2. **Each department** has a **financial analyst** responsible for logging spend requests.
3. The **Financial Planning (FPA) department** will assess → review → approve requests.
4. Workflow within Finance: **Post → Verify → Approve → Check if already taken care of**.

---

## What's Already Done

| Feature | Status | Notes |
|---------|--------|-------|
| Auth & login (JWT) | ✅ | Only registered users can access |
| Role-based access | ✅ | 5 roles: Encodeur, Directeur, FPA, MD, Admin |
| Department scoping | ✅ | Encoder sees own dept; Director sees group; FPA/MD see all |
| Spend request submission | ✅ | Encoder drafts & submits with category/dept/amount/vendor |
| Spend request history | ✅ | Immutable audit trail per status change |
| Notification logging | ✅ | Table ready, triggered on status transitions |
| Dashboard UI | ✅ | KPIs, charts, overspent table, basic dashboard |
| Requests list + detail | ✅ | Search, filter, pagination, slideover, timeline |
| Budget management UI | ✅ | Table with progress bars, CSV upload modal |
| Master Data UI | ✅ | Categories tree, departments, users, vendors, currencies |
| DB schema | ✅ | 17 tables covering org, financial, budget, transactions |

## What's Implemented vs Meeting Notes

### Workflow Comparison

| Step | Current (Code) | Meeting Notes | Status |
|------|---------------|---------------|--------|
| 1 | Encoder submits → **PendingDirector** | Department Analyst **Posts** | 🔧 Needs rename |
| 2 | Director approves → **PendingFPA** | FPA **Verifies** (within FPA) | 🔧 Remove Director tier |
| 3 | FPA approves → **PendingMD** | FPA **Approves** | 🔧 Merge FPA steps |
| 4 | MD approves → **Approved** | **Check** completion | 🔧 Replace MD role |

### Role Comparison

| Current Role | Meeting Role | Action |
|-------------|-------------|--------|
| **Encodeur** | Department Financial Analyst | ✅ Keep, rename label in UI |
| **Directeur BU/SU** | *(not mentioned)* | 🔧 Remove from workflow |
| **Validation FPA** | FPA Reviewer (Verify) | 🔧 Split/redefine FPA stages |
| **Val MD** | *(not mentioned)* | 🔧 Remove from workflow |
| **Administrateur** | *(implied)* | ✅ Keep for system management |

### Key Gaps to Address

| # | Gap | Plan |
|---|-----|------|
| 1 | **Workflow too complex** — 3-tier (Director→FPA→MD) is heavier than meeting's "Post→Verify→Approve→Check" | Simplify to 4-step within-FPA flow |
| 2 | **Director & MD roles not needed** in meeting vision | Remove from approval chain; keep as optional visibility roles |
| 3 | **FPA needs internal stages** — meeting says FPA does verify AND approve | Split FPA into: FPA Verifier + FPA Approver, or use status tracking |
| 4 | **"Check if already taken care of"** — no completion tracking exists | Add final confirmation step + completed status |
| 5 | **Status naming** — current names don't match stakeholder language | Rename to match: Posted, Under Review, Approved, Completed |
| 6 | **Role table needs updating** if Director/MD removed | Update DB seed and AuthContext role mapping |

---

## Proposed New Workflow

```
┌──────────────────┐
│  DEPT ANALYST    │  (one per department)
│  Posts request   │
└────────┬─────────┘
         │ Status: POSTED
         ▼
┌──────────────────┐      ┌──────────────────┐
│  FPA VERIFIER    │──────│  DECLINED        │
│  Reviews budget  │      │  (back to poster)│
└────────┬─────────┘      └──────────────────┘
         │ Status: UNDER_REVIEW
         ▼
┌──────────────────┐      ┌──────────────────┐
│  FPA APPROVER    │──────│  DECLINED        │
│  Final sign-off  │      │  (back to poster)│
└────────┬─────────┘      └──────────────────┘
         │ Status: APPROVED
         ▼
┌──────────────────┐
│  COMPLETED       │
│  Marked as done  │
└──────────────────┘
```

### Proposed Roles

| # | Role | Who | Scope |
|---|------|-----|-------|
| 1 | **Financial Analyst** | One per department | Logs requests for their dept |
| 2 | **FPA Reviewer** | Finance dept staff | Verifies against budget |
| 3 | **FPA Approver** | Finance dept senior | Final approval |
| 4 | **Administrateur** | System admin | Master data, users, config |

### Proposed Statuses

| Status | Meaning | Who acts |
|--------|---------|----------|
| **POSTED** | Submitted by dept analyst | FPA Reviewer picks up |
| **UNDER_REVIEW** | Being verified against budget | FPA Approver reviews |
| **APPROVED** | Approved by FPA | Dept analyst confirms completion |
| **COMPLETED** | Confirmed as processed | Final state |
| **DECLINED** | Rejected at any stage | Back to dept analyst |

---

## Implementation Plan

### Phase A: DB & Backend
1. Update status constants in `SpendRequestsController.cs` (5 statuses → new 4-step flow)
2. Update `CanTransition()` to match new flow
3. Update `UserContext` role detection (remove Director, MD; split FPA into Reviewer/Approver)
4. Update Role seed data
5. Re-scaffold if needed

### Phase B: Frontend
1. Update role mapping in `AuthContext.tsx`
2. Update `useSession` role types
3. Update sidebar role checks
4. Update request form status labels
5. Update request detail timeline
6. Update status badges

### Phase C: Test & Validate
1. Test with each role
2. Verify scoping still works
3. Verify approval flow end-to-end
