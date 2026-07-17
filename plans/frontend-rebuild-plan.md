# Frontend Rebuild Plan — Post Odoo Sync

**Date:** 2026-07-16  
**Prerequisite:** Backend clean slate complete. Category→Account rename done. Odoo sync simplified.

---

## Impact Assessment

| Layer | Files Affected | Severity |
|-------|---------------|----------|
| Types/interfaces | `odoo-data.ts`, `dashboard-data.ts`, `budget-types.ts` | 🔴 Breaking |
| API services | `dashboardService.ts`, budget service files | 🔴 Breaking |
| Odoo Sync UI | `OdooSyncWizard.tsx`, `sync-progress.tsx`, `sync-details.tsx`, `export-menu.tsx` | 🟡 Simplify |
| Budget Grid | `BudgetGrid.tsx`, `BudgetNavigator` | 🟡 Rename |
| Dashboard | `Dashboard.tsx`, `DashboardWidgets` | 🟡 Rename |
| Master Data | `MasterData.tsx`, `Accounts` screens | 🔴 Rename |

---

## Phase 1 — Odoo Sync Page (Simplify)

**Goal:** Adapt UI to the new simple 2-step backend.

**Before:** 6 stages, progress polling, detail arrays, complex SyncDetails
**After:** 2 stages (Budgets + Actuals), simple result card

### Files to change:

| File | Action |
|------|--------|
| `src/lib/odoo-data.ts` | Simplify types — remove old SyncStage, JournalLine, etc. Add new `SyncResult` type |
| `src/components/master-data/OdooSyncWizard.tsx` | Rewrite: simple sync button, result card |
| `src/components/odoo/sync-progress.tsx` | Simplify to 2 stages or remove |
| `src/components/odoo/sync-details.tsx` | Replace with simple result card |
| `src/components/odoo/database-state.tsx` | Keep — still shows Budget/Actuals counts |
| `src/components/odoo/export-menu.tsx` | Keep — still useful |

### New API type:
```ts
interface SyncResult {
  runId: string
  year: number
  budgetLinesFetched: number
  budgetRowsUpserted: number
  analyticLinesFetched: number
  actualsRowsUpserted: number
  durationMs: number
}
```

---

## Phase 2 — Budget Feature (Rename + Data Fix)

**Goal:** Fix all Category→Account references. Verify grid works with new data.

### Files to change:

| File | Action |
|------|--------|
| `src/components/budgets/BudgetGrid.tsx` | `CategoryId` → `AccountId`, `CatName` → `AccountName` |
| `src/api/budgetService.ts` or similar | Update API paths & param names |
| `src/lib/budget-types.ts` | Update interfaces |
| `BudgetNavigator` component | Fix references |
| Any `category` references in budget hooks/utils | Find & replace |

### API endpoints check:
- `GET /api/budgets/grid/{year}` — already uses `AccountId` in SQL ✅
- `GET /api/budgets/navigator/{year}` — check SQL for `Category` refs
- `GET /api/budgets` — params changed: `categoryId` → `accountId`

---

## Phase 3 — Dashboard (Data Source Fix)

**Goal:** Fix dashboard data queries to use `AccountId` instead of `CategoryId`.

### Files to change:

| File | Action |
|------|--------|
| `src/pages/Dashboard.tsx` | Fix filter param names |
| `src/api/dashboardService.ts` | Fix `DashboardParams` interface |
| `src/lib/dashboard-data.ts` | Fix types referencing Category |
| Dashboard widgets (if separate) | Fix data props |

### API endpoints check:
- `GET /api/dashboard` — check params & SQL
- `GET /api/dashboard/departments` — check SQL

---

## Phase 4 — Master Data Screens (Accounts + Mappings)

**Goal:** Rename Categories→Accounts. Add Odoo Department Mapping management.

### Files to change:

| File | Action |
|------|--------|
| `src/pages/MasterData.tsx` | "Categories" → "Accounts", add Odoo Mapping tab |
| `src/components/master-data/AccountsList.tsx` (or similar) | Rename component |
| Account edit/create forms | Fix field names |
| **NEW** `src/components/master-data/OdooDeptMapping.tsx` | Manage `OdooDepartmentMapping` table |
| API calls for accounts | Update paths (`/api/accounts` instead of `/api/categories`) |

### New API endpoints needed:
- `GET /api/accounts` — list all accounts (was `/api/categories`)
- `GET /api/odoo/department-mappings` — list mappings
- `POST /api/odoo/department-mappings` — create mapping
- `DELETE /api/odoo/department-mappings/{id}` — delete mapping

---

## Execution Order

```
Phase 1 (Odoo Sync) ──▶ Phase 2 (Budget) ──▶ Phase 3 (Dashboard) ──▶ Phase 4 (Master Data)
     1-2 hours              2-3 hours             1-2 hours               2-3 hours
```

Each phase ends with `npx tsc -b` verifying 0 errors before moving to the next.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking API contract | Check backend endpoints FIRST before changing frontend |
| Stale TypeScript types | Regenerate from API if scaffold supports it (`apstory-api-gen.ps1`) |
| Missing data after rename | Verify Budget/Actuals tables have data before testing grid |
| Auth on new endpoints | Add `[AllowAnonymous]` during testing, restore after |
