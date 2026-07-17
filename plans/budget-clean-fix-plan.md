# Budget Feature — Clean Fix Plan

**Date:** 2026-07-16  
**Problem:** Numbers in Budget Grid/Navigator don't match Odoo sync data. Two account systems exist.

---

## Root Cause Analysis

### 1. Two Account Systems (The Core Problem)

| System | Account IDs | OdooAccountId | Source |
|--------|------------|---------------|--------|
| **Old manual accounts** | 1-60, 1353 | NULL | Created via UI before Odoo integration |
| **Odoo-synced accounts** | Auto-generated | Set | Created by Odoo sync (`ResolveFinancialGroup`) |

**52 accounts** have NULL `OdooAccountId`. These are NOT linked to any Odoo data. The Budget and Actuals tables have been populated by Odoo sync using the Odoo-synced accounts, NOT the manual ones.

### 2. Grid SQL Problem

The Grid query JOINs Budget/Actuals with Account but uses the **same column names from both systems**. Some accounts have `OdooAccountId`, some don't. The sync only maps when `OdooAccountId` matches.

### 3. Spaghetti Architecture

```
BudgetsController.cs (358 lines)
├── Get (scaffold CRUD)              ← legacy, never used for grid
├── GetPaged (scaffold CRUD)         ← legacy
├── GetById                           ← legacy
├── Post / Put / Delete               ← legacy CRUD, should be read-only now
├── GetGrid                           ← complex UNION + section builder
├── GetMonths                         ← fine
├── GetNavigator                      ← separate aggregation, out of sync
├── BuildSections                     ← 40-line section builder
├── MakeItem                          ← item DTO builder
└── DTOs: DeptOut, SectionOut, ClassOut, ItemOut, CellDto ← nested complexity
```

The Grid builds a deeply nested structure:
```
DeptOut[] 
  → SectionOut[] (REVENUES, COS, FIXED_COSTS, VARIABLE_COSTS, GROSS_MARGIN, TOTAL_OPEX, EBIT)
    → ClassOut[] (ADMIN_FIN, TECH_OPS, MKT_SALES)
      → ItemOut[] (individual accounts)
```

This is over-engineered. The Navigator does separate aggregation that can diverge.

---

## Clean Architecture (Target)

### One Data Source

```
Odoo Sync → Budget (ForecastAmount) + Actuals (Amount)
              ↓
         Grid / Navigator read directly from these two tables
              ↓
         NO manual editing. NO CRUD endpoints. Read-only views.
```

### Simplified Grid

```
GET /api/budgets/grid/{year}?buSu=&month=

Returns: Flat list of rows, one per account per department
[
  { deptName, accountName, fgName, classification, forecast, execution, variance }
]
```

Frontend builds the table layout. Backend just returns data.

### Simplified Navigator

```
GET /api/budgets/navigator/{year}?buSu=&month=

Returns:
[
  { groupName, bucketType, forecast, execution, departments: [...] }
]
```

### Remove

| Item | Reason |
|------|--------|
| CRUD endpoints (Post, Put, Delete) | Budget is read-only from Odoo |
| Section/Class DTOs (SectionOut, ClassOut, ItemOut) | Frontend builds layout |
| BuildSections / MakeItem helpers | Not needed |
| UNION SQL | Use simple JOIN instead |
| Account classification guessing | Use FG from Account table directly |

---

## Implementation Steps

### Step 1 — Audit Odoo Account Mapping

| Check | Action |
|-------|--------|
| How many Budget rows reference accounts with NULL OdooAccountId? | Identify orphan rows |
| How many Actuals rows reference accounts with NULL OdooAccountId? | Identify orphan rows |
| Do all Odoo-synced accounts have correct FG? | Verify classification |

### Step 2 — Clean Budget Controller

- Delete Post, Put, Delete, GetById, Get (CRUD) endpoints
- Simplify GetGrid: single flat query with JOINs
- Simplify GetNavigator: same data source as Grid
- Remove BuildSections, MakeItem, nested DTOs
- Add `variance` = forecast - execution to response

### Step 3 — Verify Data Coherence

| Check | Expected |
|-------|----------|
| SUM(Budget.ForecastAmount) across all depts | Should match Odoo export total |
| SUM(Actuals.Amount) by dept by month | Should match Odoo execution export |
| Grid Revenue total | Should = SUM where FG.Name='Revenus' |
| Grid COS total | Should = SUM where FG.Name='COS' |

### Step 4 — Frontend Adaptation

- Update BudgetGrid to use flat data (not nested Sections)
- Update BudgetNavigator to use simplified response
- Remove edit mode / save draft UI
- Verify year/month/BU/SU filters work

---

## Data Flow (Clean)

```
                    ┌──────────────────┐
                    │   Odoo Sync      │
                    │ (OdooSyncService)│
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
        ┌──────────┐                 ┌──────────┐
        │  Budget   │                 │ Actuals  │
        │ Forecast  │                 │ Amount   │
        └─────┬─────┘                 └─────┬─────┘
              │                             │
              └──────────┬──────────────────┘
                         ▼
              ┌─────────────────────┐
              │  Grid Query (flat)  │
              │  JOIN Budget +      │
              │  Actuals by         │
              │  Dept+Account       │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │  Frontend renders   │
              │  table with dept    │
              │  columns, account   │
              │  rows, FG sections  │
              └─────────────────────┘
```
