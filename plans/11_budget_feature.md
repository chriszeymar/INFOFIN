# Phase 11: Budget Management & Rectification Matrix

> Phase 10 syncs Odoo → Actuals. Phase 11 displays it, layers targets & adjustments on top. One unified view.

---

## Data Flow (Post Phase 10)

```
Actuals (Odoo-derived, read-only)     ← synced via POST /api/odoo/sync
  + Budget.Target (user-set goals)     ← entered in matrix UI
  + ActualAdjustment (human overlay)   ← rectifications, offline items
  = Matrix display
```

---

## Core Concept: One Grid, Three Sources

The matrix is a **single unified grid**. It does not compare two data sources side-by-side. Instead, it layers three sources:

1. **Actuals (The Foundation):** `Actuals` table — Odoo-derived, read-only. Populated by `POST /api/odoo/sync`. This is what's actually in the books.
2. **Targets (The Goals):** `Budget` table — stakeholders set target amounts per department × category × year. These are the benchmarks.
3. **Adjustments (The Human Overlay):** `ActualAdjustment` table — authorized users add un-booked expenses, rectify Odoo misclassifications, or input offline items.

**Role-Based Security:** Who can edit targets and adjustments is controlled by existing roles. No complex locking or versioning workflows needed.

### Strategic Note: Odoo → Category Mapping

`Actuals` joins to `Category` via `Category.OdooAccountId`. The Odoo sync auto-populates both Departments and Categories. Users enhance Classification (Fixed/Variable) in Master Data UI. Drill-down from any matrix cell traces back to `OdooJournalLine` for raw transaction detail.

---

## Analysis of Current Excel (The Matrix to Rebuild)

### Structure

The finance team manually builds a **department x category** matrix in Excel:

```
                  +- FIXED COSTS --------------+- VARIABLE COSTS -+
                  | Admin  | Tech  | Marketing  | Admin | Tech | Mkt|
BANKING & DIGITAL |--------|-------|------------|-------|------|----|
  CIRRUS          | 125K   | 45K   | 12K        | 30K   | 15K  | 8K |
  INFOSET         | 98K    | 32K   | 9K         | 22K   | 10K  | 5K |
  TOTAL BANKING   | 223K   | 77K   | 21K        | 52K   | 25K  | 13K|
------------------+--------+-------+------------+-------+------+----|
IT & CLOUD         |        |       |            |       |      |    |
  GENISYS          | 85K    | 120K  | 3K         | 18K   | 45K  | 2K |
  AGMUX            | 40K    | 65K   | 1K         | 8K    | 22K  | 1K |
  TOTAL IT         | 125K   | 185K  | 4K         | 26K   | 67K  | 3K |
------------------+--------+-------+------------+-------+------+----|
DG, ADMIN & FIN    |        |       |            |       |      |    |
  DG               | 55K    | 10K   | 2K         | 15K   | 5K   | 1K |
  FPA              | 30K    | 5K    | 1K         | 8K    | 3K   | 0K |
  ADMIN & ACCT     | 40K    | 8K    | 1K         | 12K   | 4K   | 1K |
  TOTAL I7 SARL    | 125K   | 23K   | 4K         | 35K   | 12K  | 2K |
```

### What They Calculate

| Metric | Formula |
|--------|---------|
| Total Fixed Costs | Sum of all fixed cost categories |
| Total Variable Costs | Sum of all variable cost categories |
| Total OPEX | Fixed + Variable |
| Total Costs | COS + OPEX |
| % Used | Actual / Target x 100 |

### What They Already Have in Our DB (Post Phase 10)

| Spreadsheet Concept | InfoFin DB Table | Status |
|---------------------|-----------------|--------|
| Department rows | `Department` with `OdooCompanyId` | ✅ Synced from Odoo |
| Cost categories | `Category` with `OdooAccountId`, `FinancialGroup` | ✅ Synced from Odoo |
| Actual amounts | `Actuals` table | ✅ 168 rows from Odoo |
| Raw journal detail | `OdooJournalLine` | ✅ 6,363 lines |
| BU/SU grouping | `DepartmentGroup` → `BucketType` | ✅ Seeded |
| Budget targets | `Budget` table | ⬜ To be built |
| Adjustments | `ActualAdjustment` | ⬜ To be built |

---

## BU vs SU -- Critical Implications

### Business Units (BU) -- Banking & Digital, IT & Cloud

BU departments generate revenue. Their matrix shows **ALL sections**:

```
                    REVENUES   COS       FIXED COSTS          VARIABLE COSTS        GROSS
                    (income)   (cost)    Admin|Tech|Mkt|Tot   Admin|Tech|Mkt|Tot     MARGIN   EBIT
BANKING & DIGITAL
  CIRRUS            500K       200K      125K  45K  12K 182K   30K  15K   8K  53K   300K     65K
  INFOSET           380K       150K       98K  32K   9K 139K   22K  10K   5K  37K   230K     54K
  TOTAL BANKING     880K       350K      223K  77K  21K 321K   52K  25K  13K  90K   530K    119K
```

| Metric | Formula | Visible For |
|--------|---------|-------------|
| Total Revenus | Sum of revenue categories | **BU only** |
| Total COS | Sum of COS categories | **BU only** |
| Gross Margin | Revenus - COS | **BU only** |
| Total Fixed Costs | Sum of fixed categories | Both |
| Total Variable Costs | Sum of variable categories | Both |
| Total OPEX | Fixed + Variable | Both |
| Total Costs | COS + OPEX | **BU only** |
| EBIT | Gross Margin - OPEX | **BU only** |

### Support Units (SU) -- DG, Admin & Fin

SU departments are **cost centers only** -- no revenue, no COS:

```
                    FIXED COSTS          VARIABLE COSTS
                    Admin|Tech|Mkt|Tot   Admin|Tech|Mkt|Tot     TOTAL OPEX
DG, ADMIN & FIN
  DG                 55K  10K   2K  67K   15K   5K   1K  21K     88K
  FPA                30K   5K   1K  36K    8K   3K   0K  11K     47K
  ADMIN & ACCT       40K   8K   1K  49K   12K   4K   1K  17K     66K
  TOTAL I7 SARL     125K  23K   4K 152K   35K  12K   2K  49K    201K
```

### Implementation Impact

| Feature | How BU/SU Affects It |
|---------|---------------------|
| **Matrix view** | BU/SU toggle. BU shows Revenus + COS sections. SU shows only OPEX. |
| **Data entry** | Category dropdown filters by BU/SU. Revenue/COS hidden for SU dept entries. |
| **Totals row** | BU calculates Gross Margin + EBIT. SU stops at Total OPEX. |
| **CSV import** | Auto-detect BU vs SU from department BucketType. Skip revenue rows for SU. |
| **Role scoping** | Analyst sees own dept. Reviewer/Admin sees all. BU/SU filter in UI. |

---

## What Makes This Better Than Excel

| Excel Today | InfoFin After |
|-------------|---------------|
| Manually export Odoo data, paste into Excel, then build matrix | Odoo populates the grid automatically -- it IS the starting data |
| Manually type target numbers into separate sheet | Targets are overlaid directly on the same grid |
| Offline expenses tracked in separate files | Adjustments added inline, turning accounting data into management data |
| #DIV/0! when target = 0 | Graceful "--" display |
| Full data visible to everyone | Role-filtered: Analyst sees own dept only |
| Manual column/group creation | Auto-grouped by BU/SU from DB structure |
| No easy way to compare years | Side-by-side period comparison with variance |
| No "what-if" without breaking formulas | What-if sandbox: drag amounts, see cascading impact instantly |

### Drill-Down from Totals

Click any cell and see what makes up that number -- Odoo transactions and manual adjustments:

```
TOTAL BANKING FIXED: $321K  <- click
  Odoo baseline:
    +- Payroll expenses:      $175K  (CIRRUS $92K, INFOSET $83K)
    +- Medical Expenses:       $20K  (CIRRUS $11K, INFOSET $9K)
    +- Rent Expenses:          $43K  (CIRRUS $24K, INFOSET $19K)
  Manual adjustments:
    +- Offsite team bonus:      +$5K  (added by J.Doe, Oct 12)
    +- Rectified rent category: +$2K  (moved from wrong Odoo account)
```

### Period Comparison Side-by-Side

```
              2025        2026        D
CIRRUS OPEX   $210K      $235K      +$25K (+12%)
GENISYS OPEX  $258K      $273K      +$15K (+6%)
```

### Target Consumption Alerts

| Rule | Visual |
|------|--------|
| < 60% of target | Green -- on track |
| 60-80% of target | Yellow -- approaching limit |
| 80-100% of target | Orange -- near exhaustion |
| > 100% of target | Red -- exceeded target |

### What-If Sandbox

Drag amounts between categories and instantly see cascading effects:

```
Move $10K from CIRRUS Marketing -> CIRRUS Tech
  +- CIRRUS Total Fixed: unchanged ($182K)
  +- Banking & Digital EBIT: unchanged ($119K)
  +- Company EBIT: unchanged ($198K)
  +- CIRRUS Marketing remaining: $2K WARNING (now only 20% left)
```

### Role-Filtered Views

| Role | Sees |
|------|------|
| Financial Analyst (CIRRUS) | Only CIRRUS row in the matrix |
| FPA Reviewer | Full matrix, all departments |
| Admin | Full matrix + edit permissions |

---

## Strategic Note: Backend-Driven Pivot (Performance)

Rendering a massive pivot table (Departments x Categories x Months) in React causes severe UI lag if the frontend processes raw rows. **The .NET backend must do the heavy lifting** -- pivoting and aggregating data into a structured `BudgetMatrixDto` -- so the frontend only renders pre-computed cells. This is non-negotiable for performance.

---

## Database Strategy

### Existing (keep as-is)
- `Budget` table -- stores target amounts per department x category x year/month

### New Table: `ActualAdjustment`
Stores the **manual rectification layer** on top of Odoo actuals. Keeps Odoo data cleanly separated.

| Column | Type | Purpose |
|--------|------|---------|
| Id | int | PK |
| DepartmentId | int | Which department |
| CategoryId | int | Which category |
| Year | int | Fiscal year |
| Month | int | 1-12, NULL = annual |
| Amount | decimal | Adjustment value (+ for addition, - for deduction) |
| Reason | nvarchar(500) | Why this adjustment exists |
| CreatedBy | int | User who made the adjustment |
| CreatedAt | datetime | Timestamp |

### Matrix Calculation Formula

```
Cell Display = Actuals.Amount (Odoo-derived, synced) + SUM(ActualAdjustment.Amount) (human overlay)
Target %    = Cell Display / Budget.ForecastAmount x 100
```

`Actuals` is read-only after sync. `Budget` stores planning targets. `ActualAdjustment` stores rectifications. Three separate tables, one unified display.

---

## User Flow: From Empty to Matrix

The budget page starts empty. Sync first, then plan:

```
EMPTY STATE              ODOO SYNC (Phase 10)        THE MATRIX
+------------------+     +-------------------+     +---------------------------+
| No actuals for   |     | POST /api/odoo/   |     | BU/SU matrix with:        |
| 2026 yet.        | --> | sync              | --> | - Actuals from Odoo        |
|                  |     | → 168 rows in     |     | - Target entry inline      |
| [Run Odoo Sync]  |     |   Actuals table   |     | - Adjustments overlay      |
+------------------+     +-------------------+     +---------------------------+
```

1. **Empty State:** User lands on Budgets. No Actuals data yet. "Run Odoo Sync" button.
2. **Sync:** `POST /api/odoo/sync` populates `Actuals` table with 168 rows (Dept × Cat × Year/Month).
3. **The Matrix:** Data appears. User enters targets, adds adjustments. BU/SU toggle. Totals auto-calculated.

> **Key Principle:** The matrix structure (rows, columns, groupings) comes from master data -- not from Odoo. Odoo only provides the numbers. Master data (departments, categories, classifications, BU/SU) is already seeded and managed via the existing master data feature.

---

## Phased Build Plan

---

### Phase 11A: Foundation — Matrix Display

**Goal:** Read Actuals from Phase 10, pivot into the matrix, display with totals.

| Step | What | Details |
|------|------|---------|
| A1 | `GetMatrix` endpoint | Reads `Actuals` + joins `Department`/`Category`/`DepartmentGroup`/`BucketType`. Returns pivoted DTO: rows=departments grouped by BU/SU, columns=categories grouped by FinancialGroup×Classification, cells=Actuals.Amount. |
| A2 | Empty state | Budget page detects no Actuals for selected year. "Run Odoo Sync" button that calls `POST /api/odoo/sync`, then refreshes matrix. |
| A3 | Matrix page + grid | `BudgetMatrix.tsx` with `BudgetGrid.tsx`. Year selector, BU/SU toggle. Auto-calculated totals (row, column, group). EBIT for BU view. |
| A4 | Drill-down modal | Click cell → query `OdooJournalLine` for that (Dept, Cat, Period) → show raw transactions + adjustments. |

**Phase 11A Files:**

| # | File | Change |
|---|------|--------|
| 1 | `Api/DTOs/BudgetMatrixDto.cs` | **New** — pivoted matrix structure |
| 2 | `Api/Controllers/BudgetsController.cs` | Modify — add `GetMatrix(year, buSu)` |
| 3 | `src/pages/BudgetMatrix.tsx` | **New** — empty state + matrix page |
| 4 | `src/components/budgets/BudgetGrid.tsx` | **New** — matrix table component |
| 5 | `src/components/budgets/DrillDownModal.tsx` | **New** — OdooJournalLine detail |
| 6 | `src/lib/budget-utils.ts` | **New** — formatting, color thresholds |

---

### Phase 11B: Human Overlay — Targets & Adjustments

**Goal:** Stakeholders set targets and add manual adjustments on top of Actuals.

| Step | What | Details |
|------|------|---------|
| B1 | `ActualAdjustment` table + migration | DB script for the rectification layer (separate from `Actuals`). |
| B2 | `SetTarget` + `AddAdjustment` endpoints | Backend APIs to persist `Budget` rows (targets) and `ActualAdjustment` rows (overlay). |
| B3 | Inline target entry | Click cell, type target number. Writes to `Budget` table. BU/SU-aware. |
| B4 | Inline rectification UI | Click cell, add adjustment with reason. Audit trail: who, when, why. Writes to `ActualAdjustment`. |
| B5 | **Copy from prior year** | One-click: "Copy 2025 targets to 2026." Copies `Budget` rows. |

**Phase 11B Files:**

| # | File | Change |
|---|------|--------|
| 7 | `DB/.../06_actual_adjustment.sql` | **New** — migration |
| 8 | `Api/Controllers/BudgetsController.cs` | Modify — add `SetTarget`, `AddAdjustment`, `CopyFromYear` |
| 9 | `src/components/budgets/RectificationModal.tsx` | **New** |

---

### Phase 11C: Bulk Operations -- Import & Export

**Goal:** Finance team can bulk-upload their existing Excel data and export the matrix.

| Step | What | Details |
|------|------|---------|
| C1 | CSV/Excel import | Upload file, map columns to Department x Category x Classification. BU/SU auto-detection. Preview grid before saving. Upsert into Budget + ActualAdjustment tables. |
| C2 | Export to Excel | One-click download of current matrix view with formatting preserved. |

**Phase 11C Files:**

| # | File | Change |
|---|------|--------|
| 10 | `Api/Controllers/BudgetsController.cs` | Modify — add `ImportTargets`, `ExportMatrix` |
| 11 | `src/components/budgets/CsvImportDialog.tsx` | **New** |

---

### Phase 11D: Insights -- Alerts, Comparison & What-If

**Goal:** The matrix becomes an active planning tool, not just a static viewer.

| Step | What | Details |
|------|------|---------|
| D1 | Target consumption alerts | Color-coded % badges on each cell: green (<60%), yellow (60-80%), orange (80-100%), red (>100%). Clean, inline -- no extra gauges or widgets. |
| D2 | Period comparison | Side-by-side: select two years/quarters, see variance column (+$25K, +12%). |
| D3 | **What-if sandbox** | Toggle into sandbox mode. Drag amounts between categories. See cascading impact on totals, EBIT, and alerts -- all computed live without saving. Changes are discarded on exit unless explicitly applied. |
| D4 | Historical trend chart | Simple Recharts line/bar chart: OPEX/Revenue/EBIT over selected years. Low effort, high visual impact for meetings. |

**Phase 11D Files:**

| # | File | Change |
|---|------|--------|
| 12 | `src/components/budgets/PeriodComparison.tsx` | **New** |
| 13 | `src/components/budgets/WhatIfSandbox.tsx` | **New** |
| 14 | `src/components/budgets/TrendChart.tsx` | **New** |

---

## Complete File Inventory (All Phases)

| # | File | Phase | Change |
|---|------|-------|--------|
| 1 | `Api/DTOs/BudgetMatrixDto.cs` | 11A | **New** |
| 2 | `Api/Controllers/BudgetsController.cs` | 11A-C | Modify (cumulative) |
| 3 | `src/pages/BudgetMatrix.tsx` | 11A | **New** |
| 4 | `src/components/budgets/BudgetGrid.tsx` | 11A | **New** |
| 5 | `src/components/budgets/DrillDownModal.tsx` | 11A | **New** |
| 6 | `src/lib/budget-utils.ts` | 11A | **New** |
| 7 | `DB/.../06_actual_adjustment.sql` | 11B | **New** |
| 8 | `src/components/budgets/RectificationModal.tsx` | 11B | **New** |
| 9 | `src/components/budgets/CsvImportDialog.tsx` | 11C | **New** |
| 10 | `src/components/budgets/PeriodComparison.tsx` | 11D | **New** |
| 11 | `src/components/budgets/WhatIfSandbox.tsx` | 11D | **New** |
| 12 | `src/components/budgets/TrendChart.tsx` | 11D | **New** |

---

## Excluded (Out of Scope for Lean MVP)

- **NO** Budget Locking workflows (roles handle permissions)
- **NO** Budget Version tracking (management tool, not audit tool)
- **NO** Complex multiple scenarios (Base/Optimistic/Pessimistic)
- **NO** Top-down allocation wizards
- **NO** Budget calendar or deadline reminders
- **NO** Email notifications when budget exceeded
- **NO** Approval workflows (roles control who can edit what)
