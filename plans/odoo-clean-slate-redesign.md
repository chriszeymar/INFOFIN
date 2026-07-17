# Odoo Integration — Clean Slate Redesign

**Date:** 2026-07-16  
**Database:** `cirrus` @ `erp.infoset.cd`  
**Status:** Data verified. Ready to execute.

---

## 0. Verified Data (live test 2026-07-16)

| Query | Lines | Depts | Companies | Total |
|-------|-------|-------|-----------|-------|
| Budget Planner | 125 | 7 | AGMUX SA, GENISYS, INFOSET SARL | — |
| Budget Executed | 2,320 | 8 | AGMUX SA, INFOSET SARL | $498,827.19 |

**Departments:** AGMUX-SAS, Comptabilité & ADM, Compte Cirrus, Compte genisys, Direction Générale, Direction Technique, FP Analysis, Infoset Monetique

**FG resolution is automatic** — Odoo account names contain suffixes (`- Opex Fix`, `- Opex Variable`, `- COS`) parsed by `ResolveFinancialGroup`.

---

## Target Architecture

```
Odoo (XML-RPC)                     InfoFin DB
──────────────                     ──────────
crossovered.budget.lines ──map──▶  Budget (DeptId, AccountId, Year, ForecastAmount)
account.budget.post      ──map──▶  (via budget post → account IDs → Account.Id)

account.analytic.line    ──map──▶  Actuals (DeptId, AccountId, Year, Month, Amount)
                          ──map──▶  (via analytic account name → Department.Id)
                                    (via general_account_id → Account.OdooAccountId → Account.Id)
```

**Any feature** (budgets, dashboard, reports) queries `Budget` and `Actuals` directly:
```sql
SELECT d.Name Dept, a.Name Account, fg.Name FG,
       b.ForecastAmount, act.Amount Executed,
       (b.ForecastAmount - act.Amount) Variance
FROM Budget b
JOIN Account a ON a.Id = b.AccountId
JOIN Department d ON d.Id = b.DepartmentId
JOIN FinancialGroup fg ON fg.Id = a.FinancialGroupId
LEFT JOIN Actuals act ON act.DepartmentId=b.DepartmentId 
    AND act.AccountId=b.AccountId AND act.Year=b.Year
WHERE b.Year = 2026
```

---

## Filter Coverage Analysis

All existing Budget + Dashboard filters are covered:

| Filter | Where it works | Mechanism |
|--------|---------------|-----------|
| **Year** | Odoo fetch | `date > 'YYYY-12-31'` in XML-RPC domain |
| **Company** | Odoo fetch | `company_id IN (...)` in XML-RPC domain |
| **BU / SU** | InfoFin DB | `BucketType.Name` via Department→DepartmentGroup |
| **Month** | InfoFin DB | `Actuals.Month <= @M`, budget is annual (NULL) |
| **Department** | InfoFin DB | `DepartmentId` FK on Budget + Actuals |
| **Account** | InfoFin DB | `AccountId` FK on Budget + Actuals |
| **Financial Group** | InfoFin DB | `FinancialGroupId` on Account |

**Key insight:** Only Year and Company are pushed to Odoo. Everything else queries the clean `Budget`/`Actuals` tables post-sync via standard SQL WHERE clauses. No filter is lost.

---

## Implementation Stages

### Stage 1 — Delete Old Odoo Implementation

| Action | File / Table |
|--------|-------------|
| Delete `OdooController.cs` | `Api/Controllers/OdooController.cs` |
| Delete `OdooAdapter.cs` | `Integration/Odoo/OdooAdapter.cs` |
| Strip `IOdooAdapter.cs` | Keep only 3 method signatures |
| Clean `Models.cs` | Remove unused models |
| Drop `OdooJournalLine` table | Migration script |
| Drop `OdooAnalyticLine` table | Migration script |
| Drop `OdooSyncRun` table | Migration script |

### Stage 2 — Rename Category → Account (DB + Scaffold)

| Step | What |
|------|------|
| 2a | DB migration: `sp_rename 'Category' → 'Account'`, update all FKs |
| 2b | Rerun `apstory-scaffold -regen dbo -namespace InfoFin` |
| 2c | Fix compilation: custom code referencing `Category` → `Account` |
| 2d | Update UI: all `category` → `account` in types, API paths, components |
| 2e | Build & verify (0 errors) |

**Affected by rename:**
- `Category` table → `Account`
- `CategoryId` columns in Budget, Actuals, SpendRequest → `AccountId`
- `ICategoryService` → `IAccountService`
- `CategoryController` → `AccountController`
- `/api/categories` → `/api/accounts`
- All Gen/* repositories and models

### Stage 3 — Build Clean Odoo Sync

| File | Purpose | ~Lines |
|------|---------|--------|
| `IOdooAdapter.cs` | Interface: HealthCheck, FetchBudgetLines, FetchBudgetPosts, FetchAnalyticLines | 15 |
| `OdooAdapter.cs` | XML-RPC calls only, no business logic | 120 |
| `OdooSyncService.cs` | **NEW** — orchestration: fetch → map → store in Budget/Actuals | 80 |
| `OdooController.cs` | 3 endpoints: health, sync, last-sync | 50 |
| `Models.cs` | OdooBudgetLine, OdooBudgetPost, OdooAnalyticLine, OdooCompany, ChartAccount | 60 |

### Stage 4 — DB Migration Scripts

| Script | Content |
|--------|---------|
| `08_rename_category_to_account.sql` | Rename table, all FKs, indexes, constraints |
| `09_odoo_clean_slate.sql` | Drop old staging tables, create `OdooDepartmentMapping`, `OdooSyncRun` |

### Stage 5 — End-to-End Verification

| Step | Check |
|------|-------|
| Run DB migrations | All scripts succeed |
| Build backend | `dotnet build` 0 errors |
| Run Odoo sync | Budget + Actuals populated from `cirrus` |
| Verify data | Dept consolidation query returns forecast + executed |
| Build frontend | `npx tsc -b` 0 errors |
| UI smoke test | Sync wizard, budget grid, dashboard |

---

## Appendix A — Yannick's Queries

### Query A — Budget Planifié (Planned)
```sql
SELECT cbl.company_id, aaa.name Dept, abp.name Poste, 
       abr.account_id Compte, cbl.planned_amount MontantPlannifie
FROM crossovered_budget_lines cbl
  LEFT JOIN account_budget_post abp ON (cbl.general_budget_id = abp.id)
  LEFT JOIN account_budget_rel abr ON (cbl.general_budget_id = abr.budget_id)
  INNER JOIN account_analytic_account aaa ON (cbl.analytic_account_id = aaa.id)
WHERE cbl.date_from > '2025-12-31' AND cbl.company_id IN (1,2,3,7)
GROUP BY cbl.company_id, aaa.name, abp.name, abr.account_id, cbl.planned_amount
```

### Query B — Budget Exécuté (Executed)
```sql
SELECT aal.company_id, aaa.name Depart, aa.name CompteNom, 
       abr.account_id Compte, SUM(aal.amount) MontantExecuté
FROM account_budget_rel abr
  LEFT JOIN account_account aa ON aa.id = abr.account_id
  LEFT JOIN account_analytic_line aal ON aal.general_account_id = abr.account_id
  LEFT JOIN account_analytic_account aaa ON aaa.id = aal.account_id
WHERE aal.date > '2025-12-31' AND aal.company_id IN (1)
GROUP BY aal.company_id, aaa.name, aa.name, abr.account_id
```

## Appendix B — FG Classification (Automatic)

| Odoo Account Type / Name Suffix | FinancialGroup | FG Id |
|--------------------------------|---------------|-------|
| `income`, `income_other` | Revenue | 1 |
| `expense_direct_cost` or `- COS` | Cost of Sales | 2 |
| `- Opex Fix` or `Opex Fix` | Fixed Costs | 3 |
| Default expense | Variable Costs | 4 |

## Appendix C — Data Flow Diagram

```
ODOO                              MAP                            INFOfIN
────                              ───                            ───────
crossovered.budget.lines         OdooDepartmentMapping           Budget
  ├─ analytic_account_id.name ──▶ (DB table) ─────────────────▶ DepartmentId
  ├─ general_budget_id                                          
  │   └─ account.budget.post.account_ids ─────────────────────▶ AccountId  
  └─ planned_amount ──────────────────────────────────────────▶ ForecastAmount

account.analytic.line                                            Actuals
  ├─ account_id.name ──────────▶ OdooDepartmentMapping ───────▶ DepartmentId
  ├─ general_account_id ───────▶ Account.OdooAccountId ───────▶ AccountId
  ├─ date ────────────────────────────────────────────────────▶ Year, Month
  └─ amount ──────────────────────────────────────────────────▶ Amount
```

## Appendix D — What Gets Deleted

| Item | Reason |
|------|--------|
| `account.move.line` fetch for actuals | Replaced by `account.analytic.line` |
| Company name → department guessing | Department from analytic account name |
| `FetchAnalyticAccountsAsync` | Names come in Odoo tuples |
| `AnalyticDeptMap` hardcoded C# dict | Replaced by `OdooDepartmentMapping` DB table |
| `OdooJournalLine` staging table | Not needed for budget/actuals |
| `OdooAnalyticLine` staging table | Direct to Actuals, no staging needed |
| `StoreJournalLines`, `StoreAnalyticLines` | No staging tables |
| `AggregateAnalyticToActuals` (C# loop) | Single SQL MERGE |
| `SyncForecastsInternal` (200 lines) | Simplify to ~40 lines |
