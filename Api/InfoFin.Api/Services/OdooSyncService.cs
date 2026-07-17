using System.Data;
using Dapper;
using InfoFin.Integration.Odoo;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace InfoFin.Api.Services;

public sealed class OdooSyncService
{
    private readonly IOdooAdapter _odoo;
    private readonly string _connStr;

    // ── FG classification (same logic, moved here) ──────────────────

    private static int ResolveFinancialGroup(string accountName, string odooType)
    {
        if (odooType is "income" or "income_other") return 1;
        if (odooType == "expense_direct_cost") return 2;
        var name = accountName ?? "";
        if (name.Contains("Opex Fix", StringComparison.OrdinalIgnoreCase) ||
            name.Contains("- Fix", StringComparison.OrdinalIgnoreCase) ||
            name.Contains(" Fix ", StringComparison.OrdinalIgnoreCase))
            return 3;
        return 4;
    }

    public OdooSyncService(IOdooAdapter odoo, IConfiguration config)
    {
        _odoo = odoo;
        _connStr = config.GetConnectionString("Default")!;
    }

    // ── Full Sync ───────────────────────────────────────────────────

    public async Task<SyncResult> SyncAsync(int year)
    {
        var result = new SyncResult { RunId = Guid.NewGuid().ToString("N")[..8], Year = year };
        var startedAt = DateTime.UtcNow;

        // Step 1: Sync budget forecasts
        var budgetLines = await _odoo.FetchBudgetLinesAsync(year);
        result.BudgetLinesFetched = budgetLines.Count;

        if (budgetLines.Count > 0)
        {
            var postIds = budgetLines.Select(l => l.BudgetPostId).Distinct().ToList();
            var posts = await _odoo.FetchBudgetPostsAsync(postIds);
            var postAccountMap = posts.ToDictionary(p => p.Id, p => p.AccountIds);
            result.BudgetRowsUpserted = await SyncBudgets(budgetLines, postAccountMap, year);
        }

        // Step 2: Sync executed actuals
        var analyticLines = await _odoo.FetchAnalyticLinesAsync(year);
        result.AnalyticLinesFetched = analyticLines.Count;

        if (analyticLines.Count > 0)
        {
            result.ActualsRowsUpserted = await SyncActuals(analyticLines, year);
        }

        result.DurationMs = (DateTime.UtcNow - startedAt).TotalMilliseconds;
        await PersistResult(result);
        return result;
    }

    // ── Budget Sync ─────────────────────────────────────────────────

    private async Task<int> SyncBudgets(List<OdooBudgetLine> lines,
        Dictionary<int, List<int>> postAccountMap, int year)
    {
        await using var conn = new SqlConnection(_connStr);
        await conn.OpenAsync();

        var deptMap = await LoadDepartmentMap(conn);
        var catMap = await LoadAccountMap(conn);

        var aggregated = new Dictionary<(int DeptId, int CatId, int Year), decimal>();

        foreach (var line in lines)
        {
            var deptId = MatchDepartment(line.AnalyticAccountName, deptMap);
            if (deptId == null) continue;

            if (!postAccountMap.TryGetValue(line.BudgetPostId, out var accountIds))
                continue;

            foreach (var odooAcctId in accountIds)
            {
                if (!catMap.TryGetValue(odooAcctId, out var catId)) continue;
                var key = (deptId.Value, catId, line.DateFrom.Year);
                aggregated[key] = aggregated.GetValueOrDefault(key) + line.PlannedAmount;
            }
        }

        const string sql = """
            MERGE Budget AS t
            USING (SELECT @DeptId AS DepartmentId, @CatId AS AccountId, @Year AS Year, @Month AS Month) AS s
            ON t.DepartmentId = s.DepartmentId AND t.AccountId = s.AccountId 
               AND t.Year = s.Year AND (t.Month = s.Month OR (t.Month IS NULL AND s.Month IS NULL))
            WHEN MATCHED THEN UPDATE SET ForecastAmount = @Amount, UpdateDT = GETDATE(), IsActive = 1
            WHEN NOT MATCHED THEN INSERT (DepartmentId, AccountId, Year, Month, ForecastAmount, CurrencyId, IsActive)
            VALUES (@DeptId, @CatId, @Year, NULL, @Amount, 1, 1);
            """;

        foreach (var ((deptId, catId, yr), amount) in aggregated)
            await conn.ExecuteAsync(sql, new { DeptId = deptId, CatId = catId, Year = yr, Month = (int?)null, Amount = amount });

        return aggregated.Count;
    }

    // ── Actuals Sync ────────────────────────────────────────────────

    private async Task<int> SyncActuals(List<OdooAnalyticLine> lines, int year)
    {
        await using var conn = new SqlConnection(_connStr);
        await conn.OpenAsync();

        var deptMap = await LoadDepartmentMap(conn);
        var catMap = await LoadAccountMap(conn);

        var aggregated = new Dictionary<(int DeptId, int CatId, int Year, int Month), decimal>();

        foreach (var line in lines)
        {
            var deptId = MatchDepartment(line.AnalyticAccountName, deptMap);
            if (deptId == null) continue;

            if (!catMap.TryGetValue(line.GeneralAccountId, out var catId)) continue;

            var month = line.Date.Month;
            var key = (deptId.Value, catId, line.Date.Year, month);
            aggregated[key] = aggregated.GetValueOrDefault(key) + line.Amount;
        }

        const string sql = """
            MERGE Actuals AS t
            USING (SELECT @DeptId AS DepartmentId, @CatId AS AccountId, @Year AS Year, @Month AS Month) AS s
            ON t.DepartmentId = s.DepartmentId AND t.AccountId = s.AccountId 
               AND t.Year = s.Year AND (t.Month = s.Month OR (t.Month IS NULL AND s.Month IS NULL))
            WHEN MATCHED THEN UPDATE SET Amount = @Amount
            WHEN NOT MATCHED THEN INSERT (DepartmentId, AccountId, Year, Month, Amount)
            VALUES (@DeptId, @CatId, @Year, @Month, @Amount);
            """;

        foreach (var ((deptId, catId, yr, month), amount) in aggregated)
            await conn.ExecuteAsync(sql, new { DeptId = deptId, CatId = catId, Year = yr, Month = month, Amount = amount });

        return aggregated.Count;
    }

    // ── Mapping Helpers ─────────────────────────────────────────────

    private async Task<Dictionary<string, int>> LoadDepartmentMap(SqlConnection conn)
    {
        // 1. Load DB-backed mappings
        var mappings = (await conn.QueryAsync<DeptMapRow>(
            "SELECT OdooAnalyticName, DepartmentId FROM OdooDepartmentMapping WHERE IsActive = 1"))
            .ToDictionary(m => m.OdooAnalyticName, m => m.DepartmentId, StringComparer.OrdinalIgnoreCase);

        // 2. Also load all active departments for name contains matching
        var depts = (await conn.QueryAsync<DeptMapRow>(
            "SELECT Name AS OdooAnalyticName, Id AS DepartmentId FROM Department WHERE IsActive = 1")).ToList();

        // Merge: mappings take priority, departments are fallback via Contains matching
        var result = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var m in mappings) result[m.Key] = m.Value;

        foreach (var d in depts)
        {
            if (!result.ContainsKey(d.OdooAnalyticName))
                result[d.OdooAnalyticName] = d.DepartmentId;
        }

        return result;
    }

    private static async Task<Dictionary<int, int>> LoadAccountMap(SqlConnection conn)
    {
        var rows = await conn.QueryAsync<CatMapRow>(
            "SELECT Id, OdooAccountId FROM Account WHERE OdooAccountId IS NOT NULL AND IsActive = 1");
        return rows.GroupBy(r => r.OdooAccountId!.Value).ToDictionary(g => g.Key, g => g.First().Id);
    }

    private static int? MatchDepartment(string odooName, Dictionary<string, int> deptMap)
    {
        if (string.IsNullOrWhiteSpace(odooName)) return null;

        // 1. Exact match
        if (deptMap.TryGetValue(odooName, out var id)) return id;

        // 2. Contains match (both directions)
        foreach (var (key, val) in deptMap)
        {
            if (odooName.Contains(key, StringComparison.OrdinalIgnoreCase) ||
                key.Contains(odooName, StringComparison.OrdinalIgnoreCase))
                return val;
        }

        return null;
    }

    // ── Persistence ─────────────────────────────────────────────────

    private async Task PersistResult(SyncResult result)
    {
        await using var conn = new SqlConnection(_connStr);
        var json = System.Text.Json.JsonSerializer.Serialize(result);
        await conn.ExecuteAsync(
            "INSERT INTO OdooSyncRun (RunId, StartedAt, CompletedAt, DurationMs, Year, ResultJson) VALUES (@RunId, @StartedAt, @CompletedAt, @DurationMs, @Year, @Json)",
            new { result.RunId, StartedAt = DateTime.UtcNow.AddMilliseconds(-result.DurationMs), CompletedAt = DateTime.UtcNow, result.DurationMs, result.Year, Json = json });
    }

    public async Task<SyncResult?> LoadLastResult()
    {
        await using var conn = new SqlConnection(_connStr);
        var json = await conn.QuerySingleOrDefaultAsync<string>(
            "SELECT TOP 1 ResultJson FROM OdooSyncRun ORDER BY CompletedAt DESC");
        return json == null ? null : System.Text.Json.JsonSerializer.Deserialize<SyncResult>(json);
    }

    // ── DTOs ────────────────────────────────────────────────────────

    public sealed class SyncResult
    {
        public string RunId { get; set; } = "";
        public int Year { get; set; }
        public int BudgetLinesFetched { get; set; }
        public int BudgetRowsUpserted { get; set; }
        public int AnalyticLinesFetched { get; set; }
        public int ActualsRowsUpserted { get; set; }
        public double DurationMs { get; set; }
    }

    private sealed class DeptMapRow
    {
        public string OdooAnalyticName { get; set; } = "";
        public int DepartmentId { get; set; }
    }

    private sealed class CatMapRow
    {
        public int Id { get; set; }
        public int? OdooAccountId { get; set; }
    }
}
