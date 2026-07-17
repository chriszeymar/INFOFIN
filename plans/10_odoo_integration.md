# Phase 10: Odoo Integration

> Odoo provides raw data (actuals + forecasts). InfoFin mirrors, then aggregates into clean actuals. Planning lives on top. 2 new tables, 2 mirror columns, 5 sync steps.

> **Last probed**: 2026-07-13 — live connection to `https://erp.infoset.cd` (database: `INFOSET_TEST`)

---

## Architecture

```
Odoo
  │
  ├─ account.move.line ────→ OdooJournalLine (raw journal entries)
  │
  ├─ crossovered.budget.lines ──→ Budget (forecasts)         ← NEW Step 5
  │     via account.budget.post → account.account
  │     via account.analytic.account → res.company
  │
  ▼
┌─────────────────────────────────────────────┐
│ RAW           OdooJournalLine (1 table)     │  ← stored, upserted by OdooLineId
│               Journal entries as-is          │
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ MIRROR        Department.OdooCompanyId      │  ← 2 columns on existing tables
│               Category.OdooAccountId         │     InsUpd by Odoo ID
└─────────────────────────────────────────────┘
  │
  ▼  (service method — not persisted)
┌─────────────────────────────────────────────┐
│ TRANSFORM     Join Raw→Mirror               │  ← 1 SQL query
│               Aggregate by Dept×Cat×Period  │
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ ACTUALS       Actuals table (1 new table)   │  ← Odoo-derived, read-only
│               "What happened"                │
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ FORECAST      Budget table (existing)       │  ← Odoo-derived, overwritten on sync
│               "What we planned"              │
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ PLANNING      Budget grid, adjustments      │  ← Phase 11
│               "What we compare"              │
└─────────────────────────────────────────────┘
```

---

## What Odoo Gives Us

Probed live from `https://erp.infoset.cd` (database: `INFOSET_TEST`) on 2026-07-13.

### Data Scale (verified)

| What | Count |
|------|-------|
| Total accounts (`account.account`) | 2,585 |
| P&L accounts (income/expense types) | 883 |
| P&L accounts with 2026 transactions | 67 |
| P&L accounts with budget forecasts | 105 |
| Budgets (`crossovered.budget`) | 14 (2023–2026) |
| Budget lines | 307 |
| Budget posts (`account.budget.post`) | 118 (117 are 1:1 with accounts) |
| Analytic accounts (cost centers) | 10 |
| Distinct accounts with budgets | 105 (all P&L) |

### Companies → Departments

| Odoo Company | → InfoFin Department |
|-------------|---------------------|
| INFOSET SARL (id=1) | INFOSET SARL |
| GENISYS (id=2) | GENISYS |
| AGMUX SA (id=7) | AGMUX SA |

### Accounts → Categories

883 P&L accounts. Only P&L types become categories. **FG classification can be parsed from account names** — Infoset appends cost type suffixes:

| Odoo `account_type` | Name suffix | → InfoFin `FinancialGroup` |
|---------------------|-------------|---------------------------|
| `income`, `income_other` | *(revenue names)* | Revenue (FG 1) |
| `expense_direct_cost` | `COS` or `cos` in name | COS (FG 2) |
| `expense` | `Opex Fix` or `Fix` in name | Fixed Costs (FG 3) |
| `expense` | `Opex Variable` or `Variable` in name | Variable Costs (FG 4) |
| `expense` | *(no suffix)* | Variable Costs (FG 4, default) |

Examples from live data:
```
610001 | Janitorial Expenses- Opex Fix       | → FG 3 (Fixed)
610003 | Transport Cost- Opex Variable       | → FG 4 (Variable)
601110 | COS-Hardwares - COS                 | → FG 2 (COS)
```

Balance sheet accounts (asset, liability, equity) are ignored — not relevant to P&L planning.

### Journal Entries → Actuals

Each line = debit/credit to one account, at one company, on one date. These are the raw actuals that feed the matrix.

### Odoo Budgets → InfoFin Forecasts (NEW)

Odoo has a native budgeting module (`crossovered.budget`). Infoset uses it actively with 14 budgets across 2023–2026. Budget lines map through:
- `account.budget.post` → `account_ids` → `account.account` → InfoFin Category
- `account.analytic.account` → `company_id` → `res.company` → InfoFin Department
- `planned_amount` → `Budget.ForecastAmount`

**Key finding**: Odoo's `practical_amount` (auto-computed execution) is unreliable — partially populated, sometimes negative. InfoFin computes execution independently from raw journal lines (Steps 3-4), which is the correct approach.

---

## Sync Steps

### Step 1: Authenticate
`authenticate(database, username, password, {})` → returns `uid`

### Step 2: Sync Master Data
Fetch `res.company` and `account.account` (P&L only). For each:
- Find existing by Odoo ID → InsUpd (update if changed)
- Not found → InsUpd (create new)
- Users' manually-added entities (no Odoo ID) are untouched
- **NEW**: Parse account name suffixes (`Opex Fix`, `Opex Variable`, `COS`) to assign correct `FinancialGroupId`

### Step 3: Sync Journal Lines
Fetch `account.move.line` for the target year. Two modes:

```
Full sync (first run):         domain = [date range, parent_state=posted]
Incremental (subsequent):      domain = [write_date > lastSync, date range, parent_state=posted]
```

Upsert into `OdooJournalLine` by `OdooLineId`. Update changed, insert new, never delete.

### Step 4: Aggregate to Actuals
```sql
MERGE Actuals AS t
USING (
    SELECT d.Id AS DeptId, c.Id AS CatId, jl.Year, jl.Month, SUM(jl.NetAmount) AS Amt
    FROM OdooJournalLine jl
    JOIN Department d ON d.OdooCompanyId = jl.OdooCompanyId
    JOIN Category c ON c.OdooAccountId = jl.OdooAccountId
    GROUP BY d.Id, c.Id, jl.Year, jl.Month
) AS s ON t.DepartmentId = s.DeptId AND t.CategoryId = s.CatId AND t.Year = s.Year
    AND (t.Month = s.Month OR (t.Month IS NULL AND s.Month IS NULL))
WHEN MATCHED THEN UPDATE SET Amount = s.Amt
WHEN NOT MATCHED THEN INSERT (DepartmentId, CategoryId, Year, Month, Amount)
VALUES (s.DeptId, s.CatId, s.Year, s.Month, s.Amt);
```

### Step 5: Sync Budget Forecasts (NEW)
Fetch `crossovered.budget.lines` for the sync year. For each line:
1. Resolve `general_budget_id` → `account.budget.post` → `account_ids[0]` → InfoFin `Category` (via `OdooAccountId`)
2. Resolve `analytic_account_id` → `account.analytic.account` → `company_id` → InfoFin `Department` (via `OdooCompanyId`)
3. Aggregate multiple analytic accounts under same company into same department
4. MERGE `planned_amount` into `Budget` table on `(DepartmentId, CategoryId, Year)` with `Month = NULL`

Full details: see `plans/odoo-forecast-sync-plan.md`.

---

## Database Changes

### New: `OdooJournalLine`

```sql
CREATE TABLE [dbo].[OdooJournalLine] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [OdooLineId] INT NOT NULL,
    [OdooCompanyId] INT NOT NULL,
    [OdooCompanyName] NVARCHAR(200) NULL,
    [OdooAccountId] INT NOT NULL,
    [OdooAccountCode] NVARCHAR(20) NULL,
    [OdooAccountName] NVARCHAR(200) NULL,
    [Date] DATE NOT NULL,
    [Year] AS YEAR([Date]),
    [Month] AS MONTH([Date]),
    [Debit] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [Credit] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [NetAmount] AS (Credit - Debit),
    [State] NVARCHAR(20) NULL,
    [OdooWriteDate] DATETIME NULL,
    [ImportedAt] DATETIME NOT NULL DEFAULT GETDATE()
);
CREATE UNIQUE INDEX [IX_OdooJournalLine_OdooLineId] ON [dbo].[OdooJournalLine]([OdooLineId]);
```

### New: `Actuals`

```sql
CREATE TABLE [dbo].[Actuals] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [DepartmentId] INT NOT NULL,
    [CategoryId] INT NOT NULL,
    [Year] INT NOT NULL,
    [Month] INT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [FK_Actuals_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department]([Id]),
    CONSTRAINT [FK_Actuals_Category] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Category]([Id]),
    CONSTRAINT [UQ_Actuals_DeptCatPeriod] UNIQUE([DepartmentId], [CategoryId], [Year], [Month])
);
```

### Alter: Mirror Columns

```sql
ALTER TABLE [dbo].[Department] ADD [OdooCompanyId] INT NULL;
ALTER TABLE [dbo].[Category] ADD
    [OdooAccountId] INT NULL,
    [OdooAccountCode] NVARCHAR(20) NULL,
    [OdooAccountType] NVARCHAR(50) NULL;
```

---

## Adapter Changes

| Change | Details |
|--------|---------|
| Fix `AuthenticateAsync` | Add 4th arg `new Dictionary<string,object>()` |
| Add `FetchCompaniesAsync` | `res.company` → `List<OdooCompany>` |
| Enhance `ChartAccount` | Add `Id`, `CompanyId`, `CompanyName` |
| Replace `FetchActualsAsync` | → `FetchJournalLinesAsync(year, DateTime? since)` — raw, ungrouped |
| Json robustness | Handle `false`/`null`/array/string for `account_id` and `company_id` |

---

## API

| Endpoint | Does |
|----------|------|
| `POST /api/odoo/sync` | Full sync (steps 1-5) |
| `POST /api/odoo/sync-forecasts?year=` | Step 5 only — pull Odoo budgets into InfoFin `Budget` table |
| `POST /api/odoo/sync-journals/{year}` | Steps 3-4 only (re-fetch + re-aggregate) |
| `GET /api/odoo/health` | Auth check |
| `GET /api/odoo/status` | Database state summary |

---

## How Budget Consumes This (Phase 11)

```
Grid displays:    Budget.ForecastAmount   ← Odoo budgets (Step 5, Month=NULL)
                vs Actuals.Amount         ← Odoo journal entries (Steps 3-4, per Month)
```

| Table | Source | Editable? | Grain |
|-------|--------|-----------|-------|
| `Actuals` | Odoo journal lines (Steps 3-4) | ❌ Read-only | (Dept, Cat, Year, Month) |
| `Budget` | Odoo budgets (Step 5) + manual edits | ✅ Editable | (Dept, Cat, Year, Month=NULL) |
| `BudgetAdjustment` | Manual adjustments | ✅ Editable | Audit trail per change |

Comparison happens in `DashboardController` (KPIs, charts) and `BudgetsController` (grid) via SQL UNION of both tables on `(DepartmentId, CategoryId, Year)`.

---

## Key Principles

1. **Import expands, never shrinks.** InsUpd by Odoo ID — creates what's new, updates what changed, leaves user-added entities untouched.
2. **Transform is a method, not a table.** One SQL query. No intermediate storage.
3. **Actuals ≠ Budget.** Actuals = "what happened" (Odoo-derived, read-only). Budget = "what we planned" (human-set). Separate tables.
4. **No Odoo calls at runtime.** After sync, everything reads from SQL Server.
5. **Incremental by default.** First sync = full. Every sync after = `write_date > last`.
