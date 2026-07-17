# Odoo Budget Forecast Sync — Implementation Plan

> **Goal**: Pull Odoo budget forecasts (`crossovered.budget.lines`) into InfoFin's `Budget` table so forecast vs execution comparison is fully automated — no manual forecast entry needed.

> **Date**: 2026-07-13  
> **Branch**: `main`  
> **Status**: Discoveries complete — ready to implement

---

## Discoveries (Live Probing, 2026-07-13)

All counts verified against `https://erp.infoset.cd` (database: `INFOSET_TEST`):

| Metric | Count | Notes |
|--------|-------|-------|
| Odoo budgets (`crossovered.budget`) | 14 | 2023–2026, per-department naming |
| Budget lines | 307 | Across all years |
| Budget posts (`account.budget.post`) | 118 | 117 are 1:1 with a single account; 1 maps to 3 accounts |
| Distinct accounts with budgets | 105 | All P&L types (income, expense, expense_direct_cost) |
| P&L accounts with 2026 transactions | 67 | Out of 883 total P&L accounts |
| Analytic accounts (cost centers) | 10 | Maps to 3 companies (INFOSET, GENISYS, AGMUX) |
| Budget post → account mapping | 1:1 (99%) | Simplifies mapping — no complex multi-account aggregation needed |

### Critical Finding: FG Classification in Account Names

Infoset appends cost type suffixes to Odoo account names. This can be parsed during master data sync (Step 2) to assign correct `FinancialGroupId`:

| Name contains | → FinancialGroup |
|--------------|-----------------|
| `Opex Fix` or `Fix` | FG 3 (Fixed Costs) |
| `Opex Variable` or `Variable` | FG 4 (Variable Costs) |
| `COS` or `cos` | FG 2 (COS) |
| Revenue accounts (`income` type) | FG 1 (Revenue) |

This solves the gap where all `expense` accounts previously defaulted to FG 4.

---

## Odoo Data Model (What We're Pulling)

### Structure discovered via live probing

```
crossovered.budget (14 records)
  │  id, name, date_from, date_to, company_id
  │  e.g., "BUDGET ADMINISTRATION 2026", 2026-01-01→2026-12-31
  │
  └── crossovered.budget.lines (307 records)
        │  planned_amount, date_from, date_to
        │  
        ├── general_budget_id → account.budget.post (118 records)
        │     │  name: e.g., "Automobile expenses", "Payrolls expenses"
        │     └── account_ids: [accountId, ...]  ← many2many, typically 1 account
        │           → account.account → InfoFin Category (via OdooAccountId)
        │
        └── analytic_account_id → account.analytic.account (10 records)
              │  name: e.g., "Compte Cirrus", "Direction Générale"
              └── company_id → res.company → InfoFin Department (via OdooCompanyId)
```

### Key data points

| Odoo Field | Format | Value Example | Maps To |
|-----------|--------|--------------|---------|
| `general_budget_id` | tuple `[id, "name"]` | `[22, "Payrolls expenses"]` | `account.budget.post` |
| `analytic_account_id` | tuple `[id, "name"]` | `[8, "Comptabilité & ADM"]` | `account.analytic.account` |
| `planned_amount` | decimal | `201208.0` | `Budget.ForecastAmount` |
| `date_from` | string `"YYYY-MM-DD"` | `"2026-01-01"` | `Budget.Year` |
| `account_ids` (on budget post) | `int[]` | `[749]` | `account.account.id` |

---

## Mapping Strategy

### Mapping Chain

```
Odoo budget line
    │
    ├─ 1. general_budget_id → account.budget.post → account_ids[0]
    │      → Category WHERE OdooAccountId = account_ids[0]
    │      (117/118 posts are 1:1 — only "Marketing Cost" maps to 3 accounts)
    │
    ├─ 2. analytic_account_id → account.analytic.account → company_id
    │      → Department WHERE OdooCompanyId = company_id
    │      (Multiple analytic accounts under same company → aggregated to one department)
    │
    └─ 3. planned_amount, date_from.Year
           → Budget (DepartmentId, CategoryId, Year, ForecastAmount, Month=NULL)
```

### How It Connects With Master Data Sync

The master data sync (Steps 1-2) must run BEFORE forecast sync. It establishes the mappings:

| Sync Step | Creates | Used by Forecast Sync |
|-----------|---------|----------------------|
| Companies → Departments | `Department.OdooCompanyId` | Maps `analytic_account.company_id` → `Department.Id` |
| Accounts → Categories | `Category.OdooAccountId` | Maps `account.budget.post.account_ids` → `Category.Id` |
| **FG name parsing** (NEW) | `Category.FinancialGroupId` | Ensures Fixed vs Variable is correct before budgets land |

The FG name parsing should be added to the existing `UpsertCategory` method in `OdooController.cs`:

```csharp
private static int ResolveFinancialGroup(string accountName, string odooType)
{
    if (odooType is "income" or "income_other") return 1;  // Revenue
    if (odooType == "expense_direct_cost") return 2;        // COS
    
    // Parse name suffix for Fixed vs Variable
    var name = accountName ?? "";
    if (name.Contains("Opex Fix", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("- Fix", StringComparison.OrdinalIgnoreCase))
        return 3;  // Fixed Costs
    
    return 4;  // Variable Costs (default for expense type)
}
```

Then in `UpsertCategory`, replace `TypeToFg.GetValueOrDefault(acct.Type, 4)` with `ResolveFinancialGroup(acct.Name, acct.Type)`.

### Critical Design Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Aggregate by company, not by analytic account** | Multiple analytic accounts exist per company (e.g., 7 under INFOSET). InfoFin departments are currently at company level. Creating per-analytic-account departments would restructure the org model. For pilot, aggregate all analytic accounts under the same company into one department. |
| 2 | **Month = NULL** | Odoo budgets are yearly (`date_from` = Jan 1, `date_to` = Dec 31). The `Budget` table supports `Month = NULL` for yearly forecasts. This matches the existing grid behavior. |
| 3 | **Overwrite on sync** | Each sync replaces the `ForecastAmount` for `(DepartmentId, CategoryId, Year)` if it already exists. This keeps forecasts in sync with Odoo. Users who manually adjust forecasts will lose changes — Phase 2 can add a "locked" flag. |
| 4 | **Only sync years with budget data** | Don't assume current year. Sync whatever years exist in `crossovered.budget`. Currently: 2023, 2024, 2025, 2026. |
| 5 | **One budget post → multiple accounts = multiple InfoFin rows** | If a budget post maps to 2 accounts, create 2 `Budget` rows (same Dept, same amount, different Category). This is rare but possible. |

### Edge Cases

| Case | Handling |
|------|----------|
| Budget post has NO `account_ids` (empty array or `false`) | Skip the line, log a warning |
| Account ID not found in InfoFin `Category.OdooAccountId` | Skip the line, log a warning — the account hasn't been synced yet (run master data sync first) |
| Analytic account's company not found in InfoFin `Department.OdooCompanyId` | Skip the line, log a warning — the company hasn't been synced yet |
| Multiple budget lines map to same `(Dept, Cat, Year)` | SUM the `planned_amount` values |
| Budget line's `date_from` and `date_to` span different years | Use `date_from.Year` as the budget year |

---

## Implementation

### Step 1: Add Odoo Adapter Methods

**File**: `Integration/InfoFin.Integration.Odoo/IOdooAdapter.cs` and `OdooAdapter.cs`

#### New models (`Integration/InfoFin.Integration.Odoo/Models/Models.cs`)

```csharp
public sealed class OdooBudget
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateOnly DateFrom { get; set; }
    public DateOnly DateTo { get; set; }
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
}

public sealed class OdooBudgetLine
{
    public int Id { get; set; }
    public int BudgetId { get; set; }           // crossovered_budget_id
    public int BudgetPostId { get; set; }        // general_budget_id
    public string BudgetPostName { get; set; } = string.Empty;
    public int AnalyticAccountId { get; set; }   // analytic_account_id
    public string AnalyticAccountName { get; set; } = string.Empty;
    public DateOnly DateFrom { get; set; }
    public DateOnly DateTo { get; set; }
    public decimal PlannedAmount { get; set; }
}

public sealed class OdooBudgetPost
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<int> AccountIds { get; set; } = new();
}

public sealed class OdooAnalyticAccount
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
}
```

#### New adapter methods

```csharp
// In IOdooAdapter.cs:
Task<List<OdooBudgetLine>> FetchBudgetLinesAsync(int? year = null, CancellationToken ct = default);
Task<List<OdooBudgetPost>> FetchBudgetPostsAsync(List<int> postIds, CancellationToken ct = default);
Task<List<OdooAnalyticAccount>> FetchAnalyticAccountsAsync(CancellationToken ct = default);

// In OdooAdapter.cs implementation:
public async Task<List<OdooBudgetLine>> FetchBudgetLinesAsync(int? year = null, CancellationToken ct = default)
{
    var uid = await AuthenticateAsync(ct);
    var domain = new List<object>();
    if (year.HasValue)
    {
        domain.Add(new object[] { "date_from", ">=", $"{year}-01-01" });
        domain.Add(new object[] { "date_from", "<", $"{year + 1}-01-01" });
    }
    
    var results = await ExecuteKwAsync<JsonElement[]>(uid, 
        "crossovered.budget.lines", "search_read",
        new object[] { domain.ToArray() },
        new Dictionary<string, object> { 
            ["fields"] = new[] { "id", "crossovered_budget_id", "general_budget_id", 
                                 "analytic_account_id", "date_from", "date_to", "planned_amount" } 
        }, ct);

    return results.Select(r => new OdooBudgetLine
    {
        Id = r.GetProperty("id").GetInt32(),
        BudgetId = TupleId(TryGet(r, "crossovered_budget_id")),
        BudgetPostId = TupleId(TryGet(r, "general_budget_id")),
        BudgetPostName = TupleName(TryGet(r, "general_budget_id")),
        AnalyticAccountId = TupleId(TryGet(r, "analytic_account_id")),
        AnalyticAccountName = TupleName(TryGet(r, "analytic_account_id")),
        DateFrom = ParseDate(TryGet(r, "date_from")),
        DateTo = ParseDate(TryGet(r, "date_to")),
        PlannedAmount = TryGet(r, "planned_amount") is var pa && pa.ValueKind == JsonValueKind.Number 
            ? pa.GetDecimal() : 0
    }).ToList();
}

public async Task<List<OdooBudgetPost>> FetchBudgetPostsAsync(List<int> postIds, CancellationToken ct = default)
{
    var uid = await AuthenticateAsync(ct);
    var domain = new object[] { new object[] { "id", "in", postIds.ToArray() } };
    
    var results = await ExecuteKwAsync<JsonElement[]>(uid,
        "account.budget.post", "search_read",
        new object[] { domain },
        new Dictionary<string, object> { ["fields"] = new[] { "id", "name", "account_ids" } }, ct);

    return results.Select(r => new OdooBudgetPost
    {
        Id = r.GetProperty("id").GetInt32(),
        Name = SafeString(TryGet(r, "name")),
        AccountIds = ParseIntArray(TryGet(r, "account_ids"))
    }).ToList();
}
```

### Step 2: Add Controller Endpoint

**File**: `Api/InfoFin.Api/Controllers/OdooController.cs`

#### New endpoint: `POST /api/odoo/sync-forecasts`

```csharp
[HttpPost("sync-forecasts")]
public async Task<IActionResult> SyncForecasts([FromQuery] int? year = null)
{
    var result = new ForecastSyncResult();
    try
    {
        // 1. Fetch all budget lines (filtered by year if specified)
        var lines = await _odoo.FetchBudgetLinesAsync(year);
        result.TotalLines = lines.Count;

        // 2. Fetch budget posts for account mapping
        var postIds = lines.Select(l => l.BudgetPostId).Distinct().ToList();
        var posts = await _odoo.FetchBudgetPostsAsync(postIds);
        var postMap = posts.ToDictionary(p => p.Id, p => p.AccountIds);

        // 3. Fetch analytic accounts for department mapping
        var analytics = await _odoo.FetchAnalyticAccountsAsync();
        var analyticMap = analytics.ToDictionary(a => a.Id, a => a.CompanyId);

        // 4. Get existing InfoFin mappings
        var allDepts = await _dept.GetDepartmentByIds(null, null, "ASC");
        var deptByOdooCompany = allDepts
            .Where(d => d.OdooCompanyId.HasValue)
            .ToDictionary(d => d.OdooCompanyId!.Value, d => d.Id);

        var allCats = await _cat.GetCategoryByIds(null, null, null, "ASC");
        var catByOdooAccount = allCats
            .Where(c => c.OdooAccountId.HasValue)
            .ToDictionary(c => c.OdooAccountId!.Value, c => c.Id);

        // 5. Map each budget line to (DeptId, CatId, Year) and aggregate
        var aggregated = new Dictionary<(int DeptId, int CatId, int Year), decimal>();
        int skipped = 0, noDept = 0, noCat = 0;

        foreach (var line in lines)
        {
            // Map analytic account → company → department
            if (!analyticMap.TryGetValue(line.AnalyticAccountId, out int companyId))
                { skipped++; continue; }
            if (!deptByOdooCompany.TryGetValue(companyId, out int deptId))
                { noDept++; continue; }

            // Map budget post → account(s) → category(s)
            if (!postMap.TryGetValue(line.BudgetPostId, out var accountIds) || accountIds.Count == 0)
                { noCat++; continue; }

            int yearKey = line.DateFrom.Year;

            foreach (var acctId in accountIds)
            {
                if (!catByOdooAccount.TryGetValue(acctId, out int catId))
                    { noCat++; continue; }

                var key = (deptId, catId, yearKey);
                aggregated[key] = aggregated.GetValueOrDefault(key) + line.PlannedAmount;
            }
        }

        // 6. Upsert into Budget table
        await UpsertBudgets(aggregated);
        
        result.MappedRows = aggregated.Count;
        result.Skipped = skipped;
        result.NoDepartment = noDept;
        result.NoCategory = noCat;

        return Ok(result);
    }
    catch (Exception ex)
    {
        return StatusCode(502, new { error = ex.Message, detail = ex.InnerException?.Message });
    }
}

private async Task UpsertBudgets(Dictionary<(int DeptId, int CatId, int Year), decimal> budgets)
{
    await using var conn = new SqlConnection(_connStr);
    const string sql = """
        MERGE Budget AS t
        USING (SELECT @DeptId AS DepartmentId, @CatId AS CategoryId, @Year AS Year) AS s
        ON t.DepartmentId = s.DepartmentId AND t.CategoryId = s.CategoryId 
           AND t.Year = s.Year AND t.Month IS NULL
        WHEN MATCHED THEN UPDATE SET ForecastAmount = @Amount, UpdateDT = GETDATE(), IsActive = 1
        WHEN NOT MATCHED THEN INSERT (DepartmentId, CategoryId, Year, Month, ForecastAmount, CurrencyId, IsActive)
        VALUES (@DeptId, @CatId, @Year, NULL, @Amount, 1, 1);
        """;

    foreach (var ((deptId, catId, year), amount) in budgets)
    {
        await conn.ExecuteAsync(sql, new { DeptId = deptId, CatId = catId, Year = year, Amount = amount });
    }
}

public sealed class ForecastSyncResult
{
    public int TotalLines { get; set; }
    public int MappedRows { get; set; }
    public int Skipped { get; set; }
    public int NoDepartment { get; set; }
    public int NoCategory { get; set; }
}
```

### Step 3: Add Forecast Sync to Main Sync Pipeline

Add forecast sync as **Step 5** in the main `POST /api/odoo/sync` endpoint, after Step 4 (aggregate to actuals):

```csharp
// Step 5: Sync budget forecasts from Odoo
var forecastResult = await SyncForecastsInternal(year);
result.Forecasts = forecastResult;
```

And add `ForecastSyncResult Forecasts` to the `SyncResult` class.

### Step 4: Add FetchAnalyticAccountsAsync to Adapter

```csharp
public async Task<List<OdooAnalyticAccount>> FetchAnalyticAccountsAsync(CancellationToken ct = default)
{
    var uid = await AuthenticateAsync(ct);
    var results = await ExecuteKwAsync<JsonElement[]>(uid,
        "account.analytic.account", "search_read",
        new object[] { Array.Empty<object>() },
        new Dictionary<string, object> { 
            ["fields"] = new[] { "id", "name", "company_id" } 
        }, ct);

    return results.Select(r => new OdooAnalyticAccount
    {
        Id = r.GetProperty("id").GetInt32(),
        Name = SafeString(TryGet(r, "name")),
        CompanyId = TupleId(TryGet(r, "company_id")),
        CompanyName = TupleName(TryGet(r, "company_id"))
    }).ToList();
}
```

### Step 5: Add Helper for Integer Array Parsing

Add to `OdooAdapter.cs`:

```csharp
private static List<int> ParseIntArray(JsonElement e)
{
    if (e.ValueKind == JsonValueKind.Array)
    {
        return e.EnumerateArray()
            .Where(x => x.ValueKind == JsonValueKind.Number)
            .Select(x => x.GetInt32())
            .ToList();
    }
    return new List<int>(); // handles false, null, empty
}

private static DateOnly ParseDate(JsonElement e)
{
    if (e.ValueKind == JsonValueKind.String && DateOnly.TryParse(e.GetString()?[..10], out var d))
        return d;
    return DateOnly.MinValue;
}
```

### Step 6: UI — Add Forecast Sync Indicator

**File**: `InfoFin.UI/src/components/master-data/OdooSyncWizard.tsx`

Add a 5th step to the `STEPS` array:

```typescript
{ key: 'forecasts', label: 'Budget Forecasts', icon: Target },
```

And add the forecast sync result to the results display card.

---

## Sync Flow (Complete Pipeline After Changes)

```
POST /api/odoo/sync
  │
  ├─ Step 1: Authenticate
  │
  ├─ Step 2: Sync Master Data
  │   ├── res.company → Department (OdooCompanyId)
  │   └── account.account → Category (OdooAccountId)
  │
  ├─ Step 3: Sync Journal Lines
  │   └── account.move.line → OdooJournalLine
  │
  ├─ Step 4: Aggregate to Actuals
  │   └── OdooJournalLine → Actuals (Dept × Cat × Month)
  │
  └─ Step 5: Sync Forecasts  ← NEW
      ├── crossovered.budget.lines → fetch lines
      ├── account.budget.post → resolve account_ids
      ├── account.analytic.account → resolve company_id
      └── MERGE → Budget (Dept × Cat × Year, Month=NULL)
```

---

## Files Changed

| File | Change |
|------|--------|
| `Integration/InfoFin.Integration.Odoo/IOdooAdapter.cs` | Add `FetchBudgetLinesAsync`, `FetchBudgetPostsAsync`, `FetchAnalyticAccountsAsync` |
| `Integration/InfoFin.Integration.Odoo/OdooAdapter.cs` | Implement new methods + helpers (`ParseIntArray`, `ParseDate`) |
| `Integration/InfoFin.Integration.Odoo/Models/Models.cs` | Add `OdooBudgetLine`, `OdooBudgetPost`, `OdooAnalyticAccount` |
| `Api/InfoFin.Api/Controllers/OdooController.cs` | Add `SyncForecasts`, `UpsertBudgets`, `ForecastSyncResult`, integrate into main sync |
| `InfoFin.UI/src/components/master-data/OdooSyncWizard.tsx` | Add forecast step + result display |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Budget post `account_ids` is `false` (Odoo null for many2many) | `ParseIntArray` returns empty list → skip line, log warning |
| Sync overwrites user-edited forecasts | Phase 2: add `IsLocked` flag to Budget rows. For pilot, communicate that Odoo is the source of truth for forecasts |
| Analytic accounts don't exist yet as departments | Run master data sync (Steps 1-2) BEFORE forecast sync. Dependency order is enforced |
| Large budget line count (307 now, could grow) | Batch upserts in transaction. 307 lines is trivial — no batching needed yet |
| Negative `planned_amount` values (like we saw in practical_amount) | Accept them — they may represent credit-side budgets. The MERGE stores whatever Odoo says |
