# Phase 10: Odoo Integration

> Odoo provides raw data. InfoFin mirrors it, then aggregates into clean actuals. Planning lives on top. Lean: 1 new table, 2 new columns, 4 sync steps.

---

## Architecture

```
Odoo
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
│               Filter state≠draft            │
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
│ PLANNING      Budget, targets, adjustments  │  ← Phase 11
│               "What we want"                 │
└─────────────────────────────────────────────┘
```

**Transform is a service method, not a table.** It runs one SQL query that joins Raw through Mirror, aggregates, and writes to Actuals. No intermediate storage.

---

## What Odoo Gives Us

Discovered from `https://erp.infoset.cd` (database: `INFOSET_TEST`).

### Companies → Departments

| Odoo Company | → InfoFin Department |
|-------------|---------------------|
| INFOSET SARL (id=1) | INFOSET SARL |
| GENISYS (id=2) | GENISYS |
| AGMUX SA (id=7) | AGMUX SA |

### Accounts → Categories

2,585 total. Only P&L types become categories:

| Odoo `account_type` | → InfoFin `FinancialGroup` |
|---------------------|---------------------------|
| `income`, `income_other` | Revenue (FG 1) |
| `expense_direct_cost` | COS (FG 2) |
| `expense` | Variable OPEX (FG 4) |

Balance sheet accounts (asset, liability, equity) are ignored — not relevant to P&L planning.

### Journal Entries → Actuals

Each line = debit/credit to one account, at one company, on one date. These are the raw actuals that feed the matrix.

---

## Sync Steps

### Step 1: Authenticate
`authenticate(database, username, password, {})` → returns `uid`

### Step 2: Sync Master Data
Fetch `res.company` and `account.account` (P&L only). For each:
- Find existing by Odoo ID → InsUpd (update if changed)
- Not found → InsUpd (create new)
- Users' manually-added entities (no Odoo ID) are untouched

### Step 3: Sync Journal Lines
Fetch `account.move.line` for the target year. Two modes:

```
Full sync (first run):         domain = [date range, state!=draft]
Incremental (subsequent):      domain = [write_date > lastSync, date range, state!=draft]
```

Upsert into `OdooJournalLine` by `OdooLineId`. Update changed, insert new, never delete.

### Step 4: Aggregate to Actuals
```sql
INSERT INTO Actuals (DepartmentId, CategoryId, Year, Month, Amount)
SELECT d.Id, c.Id, jl.Year, jl.Month, SUM(jl.Credit - jl.Debit)
FROM OdooJournalLine jl
JOIN Department d ON d.OdooCompanyId = jl.OdooCompanyId
JOIN Category c ON c.OdooAccountId = jl.OdooAccountId
WHERE jl.State != 'draft'
GROUP BY d.Id, c.Id, jl.Year, jl.Month
ON CONFLICT (DepartmentId, CategoryId, Year, Month) DO UPDATE SET Amount = EXCLUDED.Amount
```

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
| `POST /api/odoo/sync` | Full sync (steps 1-4) |
| `POST /api/odoo/sync-journals/{year}` | Steps 3-4 only (re-fetch + re-aggregate) |
| `GET /api/odoo/health` | Auth check |

---

## How Budget Consumes This (Phase 11)

```
Matrix displays:  Actuals.Amount        ← Odoo baseline (Layer: Actuals)
                + ActualAdjustment      ← human overlay (Layer: Planning)
                vs Budget.Target        ← user-set goal (Layer: Planning)
```

`Actuals` is read-only after sync. `Budget` stores planning data. `ActualAdjustment` stores rectifications. Clean separation.

---

## Key Principles

1. **Import expands, never shrinks.** InsUpd by Odoo ID — creates what's new, updates what changed, leaves user-added entities untouched.
2. **Transform is a method, not a table.** One SQL query. No intermediate storage.
3. **Actuals ≠ Budget.** Actuals = "what happened" (Odoo-derived, read-only). Budget = "what we planned" (human-set). Separate tables.
4. **No Odoo calls at runtime.** After sync, everything reads from SQL Server.
5. **Incremental by default.** First sync = full. Every sync after = `write_date > last`.
