# Category → Account Rename Plan

> **Goal**: Rename "Categories" to "Accounts" across the UI and API to align terminology with Odoo — InfoFin categories ARE Odoo accounts.

> **Date**: 2026-07-13  
> **Branch**: `main`

---

## Scope Assessment

After scanning the entire codebase: **~49 files** reference "Category" or "Categories".

| Layer | Files | User-facing | Internal (gen) |
|-------|-------|-------------|-----------------|
| Frontend | 15 | 12 | 3 |
| Backend API | 5 | 3 | 2 |
| Database | 29 | 0 | 29 |
| Domain/DAL/Model | 17 | 0 | 17 |
| Common (DI) | 2 | 0 | 2 |

**Critical constraint**: 17 Domain/DAL/Model files, 7 stored procedures, and 29 DB files are **code-generated** by `apstory-api-gen`. They derive from the DB schema. Hand-editing them will be overwritten on next generation.

---

## Strategy: Two-Phase Approach

### Phase 1: User-Facing Rename (NOW — low risk, high value)

Change everything the user sees. Keep internal names (DB tables, C# classes, stored procs) unchanged to avoid breaking the scaffold.

| What changes | What stays |
|-------------|-----------|
| UI labels, buttons, modals, empty states, page titles | DB table `[dbo].[Category]` |
| API route: rename controller to `AccountsController` → route becomes `/api/accounts` | C# class `Category` (model) |
| Odoo sync labels: "Categories" → "Accounts" | `ICategoryService`, `CategoryRepository` |
| Dashboard/Requests labels | Stored procedures `zgen_Category_*` |
| Export column headers | `CategoryId` FK columns |

### Phase 2: Full DB + Scaffold Regeneration (LATER)

1. DB migration: rename `[dbo].[Category]` → `[dbo].[Account]`, all FK columns `CategoryId` → `AccountId`
2. Re-run `apstory-api-gen` to regenerate all `.Gen.cs` files, stored procs, DI registrations
3. Fix hand-written controllers with raw SQL (BudgetsController, DashboardController, OdooController)
4. Fix `OdooAccountMapping.InfoFinCategoryId` → `InfoFinAccountId`
5. Drop old stored procedures

**Phase 2 is optional** — Phase 1 alone delivers the user-facing value. Phase 2 is cleanup for developer ergonomics.

---

## Phase 1 Implementation

### 1. Backend: Rename API Route

**File**: `Api/InfoFin.Api/Controllers/CategoriesController.cs`

- Rename class from `CategoriesController` → `AccountsController`
- ASP.NET derives route from class name: `api/[controller]` → `/api/accounts`
- Keep all internal references to `ICategoryService`, `Category` model unchanged

### 2. Backend: Update OdooController Labels

**File**: `Api/InfoFin.Api/Controllers/OdooController.cs`

Change user-facing labels:
- `"Accounts → Categories"` → `"Odoo Accounts → InfoFin Accounts"`
- `CategoriesCreated`/`CategoriesUpdated` properties → rename to `AccountsCreated`/`AccountsUpdated`
- Status endpoint: `"Categories with Odoo ID"` → `"Accounts with Odoo ID"`

### 3. Frontend: Master Data Page

**File**: `InfoFin.UI/src/pages/MasterData.tsx`

| Current | → | New |
|---------|---|-----|
| Sidebar section `'Categories'` | → | `'Accounts'` |
| Card label `'Categories'` | → | `'Accounts'` |
| Card description `'Expense types and cost accounts'` | → | `'Chart of accounts (P&L)'` |
| Table header `Category` | → | `Account` |
| Modal title `'Add Category'` | → | `'Add Account'` |
| Modal title `'Edit Category'` | → | `'Edit Account'` |
| Input placeholder `'Category name'` | → | `'Account name'` |
| Empty state `'No categories found...'` | → | `'No accounts found...'` |
| Delete confirm `'Delete Category?'` | → | `'Delete Account?'` |
| Pagination `'Showing X of Y categories'` | → | `'Showing X of Y accounts'` |
| Component `CategoriesGrid` | → | `AccountsGrid` |
| Component `CategoryModal` | → | `AccountModal` |
| API paths `/api/categories` | → | `/api/accounts` |

### 4. Frontend: Dashboard

**File**: `InfoFin.UI/src/pages/Dashboard.tsx`

- `'Top Overspent Categories'` → `'Top Overspent Accounts'`
- Description → `'Accounts exceeding approved budget'`

### 5. Frontend: Spend Requests

**Files**: `SpendRequestsList.tsx`, `SpendRequestDetail.tsx`, `request-form.tsx`, `request-slideover.tsx`

- Column header `Category` → `Account`
- Form label `"Category"` → `"Account"`
- Select placeholder `'Select category'` → `'Select account'`

### 6. Frontend: Dashboard Components

**Files**: `basic-dashboard.tsx`, `overspent-table.tsx`

- Table header `Category` → `Account`
- Title `'Top Overspent Categories'` → `'Top Overspent Accounts'`
- Subtitle → `'Accounts exceeding their approved budget'`
- Empty state → `'No overspent accounts — all within budget.'`

### 7. Frontend: OdooSyncWizard

**File**: `OdooSyncWizard.tsx`

- Step label `'Accounts → Categories'` → `'Odoo Accounts'`
- Results: `'Categories created'` → `'Accounts created'`
- Results: `'Categories updated'` → `'Accounts updated'`
- Status: `'Categories with Odoo ID'` → `'Accounts with Odoo ID'`

### 8. Frontend: Types & API Service

**File**: `spendRequestService.ts`

- API path: `/api/categories` → `/api/accounts`

### 9. Frontend: Export Headers

**Files**: `spend-requests-export-excel.ts`, `spend-requests-export-pdf.ts`

- Column header `categoryName` label → `'Account'`

### 10. Frontend: Mock Data & Types

**Files**: `mock-data.ts`, `dashboard-data.ts`, `spend-request.ts`

- Array names: `categories` → `accounts`, `overspentCategories` → `overspentAccounts`
- Property names: `categoryName` → `accountName`, `category` → `account` (where user-facing)

---

## Files Changed (Phase 1)

| # | File | Type of change |
|---|------|---------------|
| 1 | `Api/.../CategoriesController.cs` | Rename class → `AccountsController` |
| 2 | `Api/.../OdooController.cs` | Update labels + property names |
| 3 | `InfoFin.UI/src/pages/MasterData.tsx` | ~20 label/route changes |
| 4 | `InfoFin.UI/src/pages/Dashboard.tsx` | 2 label changes |
| 5 | `InfoFin.UI/src/pages/SpendRequestsList.tsx` | 1 column header |
| 6 | `InfoFin.UI/src/pages/SpendRequestDetail.tsx` | 1 label |
| 7 | `InfoFin.UI/src/components/requests/request-form.tsx` | 2 labels |
| 8 | `InfoFin.UI/src/components/requests/request-slideover.tsx` | 1 label |
| 9 | `InfoFin.UI/src/components/dashboard/basic-dashboard.tsx` | 1 column header |
| 10 | `InfoFin.UI/src/components/dashboard/overspent-table.tsx` | 3 labels |
| 11 | `InfoFin.UI/src/components/master-data/OdooSyncWizard.tsx` | 5 labels |
| 12 | `InfoFin.UI/src/api/spendRequestService.ts` | 1 API path |
| 13 | `InfoFin.UI/src/lib/export/spend-requests-export-excel.ts` | 1 column label |
| 14 | `InfoFin.UI/src/lib/export/spend-requests-export-pdf.ts` | 1 column label |
| 15 | `InfoFin.UI/src/types/spend-request.ts` | Interface property renames |
| 16 | `InfoFin.UI/src/lib/mock-data.ts` | Array/variable renames |
| 17 | `InfoFin.UI/src/lib/dashboard-data.ts` | Property rename |

**17 files total** | **Zero DB changes** | **Zero generated code changes**

---

## Phase 2: Full DB Migration (Future)

If developer ergonomics justify it later:

1. Create DB migration script renaming `[dbo].[Category]` → `[dbo].[Account]`
2. Rename FK columns: `CategoryId` → `AccountId` on Actuals, Budget, SpendRequest, OdooAccountMapping
3. Rename `OdooAccountMapping.InfoFinCategoryId` → `InfoFinAccountId`
4. Re-run `apstory-api-gen` against renamed schema
5. Fix raw SQL in `BudgetsController.cs`, `DashboardController.cs`, `OdooController.cs`
6. Fix `OdooAccountMapping` model and service references
7. Drop old `zgen_Category_*` stored procedures

Estimated effort: 4-6 hours + thorough testing.
