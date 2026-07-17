using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly string _connStr;

    public DashboardController(IConfiguration config)
    {
        _connStr = config.GetConnectionString("Default")!;
    }

    /// <summary>List all active departments for the dashboard filter dropdown.</summary>
    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        await using var conn = new SqlConnection(_connStr);
        await conn.OpenAsync();
        var depts = (await conn.QueryAsync<DeptNameRow>(
            "SELECT Id, Name FROM Department WHERE IsActive = 1 ORDER BY Name")).ToList();
        return Ok(depts);
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int year = 2026,
        [FromQuery] string? buSu = null,
        [FromQuery] int? month = null,
        [FromQuery] int? departmentId = null)
    {
        await using var conn = new SqlConnection(_connStr);
        await conn.OpenAsync();

        var bucketFilter = string.IsNullOrEmpty(buSu) ? "" : "AND bt.Name = @B";
        var bucketParam = string.IsNullOrEmpty(buSu) ? null : buSu;

        // ── 1. Raw rows: Actuals + Budget-only ──────────────────────────
        var deptFilter = departmentId.HasValue ? "AND a.DepartmentId = @D" : "";
        var budgetDeptFilter = departmentId.HasValue ? "AND b.DepartmentId = @D" : "";

        var rows = (await conn.QueryAsync<CellRow>(
            $@"SELECT DepartmentId, AccountId, SUM(Execution) AS Execution, AccountName,
                     FinancialGroupId, ClassificationId, OdooAccountType, FgName, ClName,
                     SUM(Forecast) AS Forecast
            FROM (
              SELECT a.DepartmentId, a.AccountId, SUM(a.Amount) AS Execution, 0 AS Forecast,
                     c.Name AS AccountName, c.FinancialGroupId, c.ClassificationId, c.OdooAccountType,
                     fg.Name AS FgName, cl.Name AS ClName
              FROM Actuals a
              JOIN Account c ON c.Id = a.AccountId
              JOIN FinancialGroup fg ON fg.Id = c.FinancialGroupId
              LEFT JOIN Classification cl ON cl.Id = c.ClassificationId
              WHERE a.Year = @Y AND (@M IS NULL OR a.Month <= @M) {deptFilter}
              GROUP BY a.DepartmentId, a.AccountId, c.Name, c.FinancialGroupId, c.ClassificationId, c.OdooAccountType, fg.Name, cl.Name

              UNION ALL

              SELECT b.DepartmentId, b.AccountId, 0 AS Execution, b.ForecastAmount AS Forecast,
                     c.Name AS AccountName, c.FinancialGroupId, c.ClassificationId, c.OdooAccountType,
                     fg.Name AS FgName, cl.Name AS ClName
              FROM Budget b
              JOIN Account c ON c.Id = b.AccountId
              JOIN FinancialGroup fg ON fg.Id = c.FinancialGroupId
              LEFT JOIN Classification cl ON cl.Id = c.ClassificationId
              WHERE b.Year = @Y AND b.IsActive = 1 {budgetDeptFilter}
            ) AS combined
            GROUP BY DepartmentId, AccountId, AccountName, FinancialGroupId, ClassificationId, OdooAccountType, FgName, ClName",
            new { Y = year, B = bucketParam, M = month, D = departmentId })).ToList();

        // Filter by bucket type if specified
        if (!string.IsNullOrEmpty(buSu))
        {
            var validDeptIds = (await conn.QueryAsync<int>(
                @"SELECT d.Id FROM Department d
                  JOIN DepartmentGroup dg ON dg.Id = d.DepartmentGroupId
                  JOIN BucketType bt ON bt.Id = dg.BucketTypeId
                  WHERE bt.Name = @B", new { B = buSu })).ToHashSet();
            rows = rows.Where(r => validDeptIds.Contains(r.DepartmentId)).ToList();
        }

        if (rows.Count == 0)
            return Ok(new DashboardResponse());

        // ── 2. Department names ──────────────────────────────────────────
        var deptIds = rows.Select(r => r.DepartmentId).Distinct().ToList();
        var deptNames = (await conn.QueryAsync<DeptNameRow>(
            "SELECT Id, Name FROM Department WHERE Id IN @Ids", new { Ids = deptIds }))
            .ToDictionary(d => d.Id, d => d.Name);

        // ── Section mapping helpers ──────────────────────────────────────
        string MapSection(string? odooType, string fgName) => odooType switch
        {
            "income" or "income_other" => "REVENUES",
            "expense_direct_cost" => "COS",
            "expense" when fgName == "Fixed Costs" => "FIXED_COSTS",
            "expense" when fgName == "Variables Costs" => "VARIABLE_COSTS",
            _ => "VARIABLE_COSTS"
        };

        // ── 3. KPI cards ─────────────────────────────────────────────────
        // Revenue (positive), Expenses/COS (negative in DB — use ABS for display)
        var revF = rows.Where(r => MapSection(r.OdooAccountType, r.FgName) == "REVENUES").Sum(r => r.Forecast);
        var revE = rows.Where(r => MapSection(r.OdooAccountType, r.FgName) == "REVENUES").Sum(r => r.Execution);
        var cosF = rows.Where(r => MapSection(r.OdooAccountType, r.FgName) == "COS").Sum(r => r.Forecast);
        var cosE = Math.Abs(rows.Where(r => MapSection(r.OdooAccountType, r.FgName) == "COS").Sum(r => r.Execution));
        var fixF = rows.Where(r => MapSection(r.OdooAccountType, r.FgName) == "FIXED_COSTS").Sum(r => r.Forecast);
        var fixE = Math.Abs(rows.Where(r => MapSection(r.OdooAccountType, r.FgName) == "FIXED_COSTS").Sum(r => r.Execution));
        var varF = rows.Where(r => MapSection(r.OdooAccountType, r.FgName) == "VARIABLE_COSTS").Sum(r => r.Forecast);
        var varE = Math.Abs(rows.Where(r => MapSection(r.OdooAccountType, r.FgName) == "VARIABLE_COSTS").Sum(r => r.Execution));

        // Total spending budget = expense forecasts only (COS + Fixed + Variable)
        var totalBudget = cosF + fixF + varF;
        var totalSpent = cosE + fixE + varE;
        var opexF = fixF + varF; var opexE = fixE + varE;

        // EBIT = Revenue - COS - OPEX (using ABS for expense execution)
        var ebitF = revF - cosF - opexF;
        var ebitE = revE - cosE - opexE;

        var kpis = new KpiDto
        {
            TotalBudget = totalBudget,
            TotalSpent = totalSpent,
            Remaining = totalBudget - totalSpent,
            Ebit = ebitE
        };

        // ── 4. Monthly bars (revenue + opex by month, respecting filters) ─
        var monthlyBars = new List<MonthlyBarDto>();
        var deptCondition = departmentId.HasValue ? "AND a.DepartmentId = @D" : "";
        var buCondition = string.IsNullOrEmpty(buSu) ? "" :
            @"AND EXISTS (SELECT 1 FROM Department d JOIN DepartmentGroup dg ON dg.Id = d.DepartmentGroupId JOIN BucketType bt ON bt.Id = dg.BucketTypeId WHERE d.Id = a.DepartmentId AND bt.Name = @B)";

        for (int m = 1; m <= 12; m++)
        {
            var mRev = (await conn.QueryAsync<decimal>(
                $@"SELECT ISNULL(SUM(a.Amount), 0) FROM Actuals a
                  JOIN Account c ON c.Id = a.AccountId
                  WHERE a.Year = @Y AND a.Month = @M
                    AND (c.OdooAccountType = 'income' OR c.OdooAccountType = 'income_other')
                    {deptCondition} {buCondition}",
                new { Y = year, M = m, D = departmentId, B = bucketParam })).Single();

            var mOpex = (await conn.QueryAsync<decimal>(
                $@"SELECT ISNULL(ABS(SUM(a.Amount)), 0) FROM Actuals a
                  JOIN Account c ON c.Id = a.AccountId
                  WHERE a.Year = @Y AND a.Month = @M
                    AND (c.OdooAccountType = 'expense' OR c.OdooAccountType = 'expense_direct_cost')
                    {deptCondition} {buCondition}",
                new { Y = year, M = m, D = departmentId, B = bucketParam })).Single();

            monthlyBars.Add(new MonthlyBarDto
            {
                Month = new DateTime(year, m, 1).ToString("MMM"),
                Revenue = mRev,
                Opex = mOpex
            });
        }

        // ── 5. Cost breakdown donut ──────────────────────────────────────
        var costBreakdown = new List<PieSliceDto>
        {
            new() { Name = "Fixed", Value = fixE },
            new() { Name = "Variable", Value = varE },
            new() { Name = "Cost of Sales", Value = cosE }
        };

        // ── 6. Overspent categories (expenses only, execution > forecast, top 10)
        var overspent = rows
            .Where(r => r.OdooAccountType != "income" && r.OdooAccountType != "income_other")
            .Where(r => Math.Abs(r.Execution) > r.Forecast)
            .Select(r => new OverspentDto
            {
                Account = r.AccountName,
                Department = deptNames.GetValueOrDefault(r.DepartmentId, $"Dept #{r.DepartmentId}"),
                Budget = r.Forecast,
                Spent = Math.Abs(r.Execution)
            })
            .OrderByDescending(o => o.Spent - o.Budget)
            .Take(10)
            .ToList();

        // ── 7. Yearly budget performance (P&L hierarchy) ─────────────────
        var yearlyPerformance = BuildPnl(rows, MapSection, year);

        // ── 8. Costs analysis bars ───────────────────────────────────────
        // Todate = prorated forecast (not execution)
        var costRatio = year < DateTime.Now.Year ? 1m
                      : year > DateTime.Now.Year ? 0m
                      : (decimal)DateTime.Now.Month / 12m;
        var cosTD2 = Math.Round(cosF * costRatio, 2);
        var fixTD2 = Math.Round(fixF * costRatio, 2);
        var varTD2 = Math.Round(varF * costRatio, 2);
        var opexTD2 = Math.Round(opexF * costRatio, 2);

        var costsAnalysis = new List<CostGroupDto>
        {
            new() { Name = "Cost of Sales",        Todate = cosTD2,  Execution = cosE },
            new() { Name = "Total Fixed Costs",    Todate = fixTD2,  Execution = fixE },
            new() { Name = "Total Variable Costs", Todate = varTD2,  Execution = varE },
            new() { Name = "Total OPEX",           Todate = opexTD2, Execution = opexE }
        };

        // ── 9. Cost by department (expenses only) ──────────────────────────
        var costByDept = rows
            .Where(r => r.OdooAccountType != "income" && r.OdooAccountType != "income_other")
            .GroupBy(r => r.DepartmentId)
            .Select(g =>
            {
                var f = g.Sum(r => r.Forecast);
                var e = Math.Abs(g.Sum(r => r.Execution));
                var td = Math.Round(f * costRatio, 2);
                return new DeptCostDto
                {
                    Department = deptNames.GetValueOrDefault(g.Key, $"Dept #{g.Key}"),
                    Forecast = f,
                    Todate = td,
                    Execution = e,
                    Pct = td == 0 ? 0 : (int)Math.Round(e / td * 100)
                };
            })
            .OrderByDescending(d => d.Forecast)
            .ToList();

        return Ok(new DashboardResponse
        {
            Kpis = kpis,
            MonthlyBars = monthlyBars,
            CostBreakdown = costBreakdown,
            Overspent = overspent,
            YearlyPerformance = yearlyPerformance,
            CostsAnalysis = costsAnalysis,
            CostByDept = costByDept
        });
    }

    // ─── P&L builder ────────────────────────────────────────────────────────

    private static List<BudgetLineDto> BuildPnl(List<CellRow> rows, Func<string?, string, string> mapSection, int year)
    {
        static decimal SumF(IEnumerable<CellRow> r) => r.Sum(x => x.Forecast);
        static decimal SumE(IEnumerable<CellRow> r) => Math.Abs(r.Sum(x => x.Execution));

        // Proration ratio: how much of the year has passed
        // Past years = 100%, future years = 0%, current year = month/12
        decimal ratio = year < DateTime.Now.Year ? 1m
                      : year > DateTime.Now.Year ? 0m
                      : (decimal)DateTime.Now.Month / 12m;

        var revRows = rows.Where(r => mapSection(r.OdooAccountType, r.FgName) == "REVENUES").ToList();
        var cosRows = rows.Where(r => mapSection(r.OdooAccountType, r.FgName) == "COS").ToList();
        var fixRows = rows.Where(r => mapSection(r.OdooAccountType, r.FgName) == "FIXED_COSTS").ToList();
        var varRows = rows.Where(r => mapSection(r.OdooAccountType, r.FgName) == "VARIABLE_COSTS").ToList();

        decimal revF = SumF(revRows);
        decimal revExec = revRows.Sum(r => r.Execution); // revenue stays signed
        decimal revTD = Math.Round(revF * ratio, 2);
        decimal cosF = SumF(cosRows), cosE = SumE(cosRows);
        decimal cosTD = Math.Round(cosF * ratio, 2);
        decimal fixF = SumF(fixRows), fixE = SumE(fixRows);
        decimal fixTD = Math.Round(fixF * ratio, 2);
        decimal varF = SumF(varRows), varE = SumE(varRows);
        decimal varTD = Math.Round(varF * ratio, 2);

        decimal gpF = revF - cosF, gpE = revExec - cosE;
        decimal gpTD = Math.Round(gpF * ratio, 2);
        decimal opexF = fixF + varF, opexE = fixE + varE;
        decimal opexTD = Math.Round(opexF * ratio, 2);
        decimal ebitF = gpF - opexF, ebitE = gpE - opexE;
        decimal ebitTD = Math.Round(ebitF * ratio, 2);

        // Pct = execution vs prorated todate target
        static int Pct(decimal td, decimal e) => td == 0 ? 0 : (int)Math.Round(e / td * 100);

        return new List<BudgetLineDto>
        {
            new() { Label = "Revenues",            Forecast = revF,   Todate = revTD,  Execution = revExec, Pct = Pct(revTD, revExec) },
            new() { Label = "Cost of Sales",       Forecast = cosF,   Todate = cosTD,  Execution = cosE,    Pct = Pct(cosTD, cosE) },
            new() { Label = "Gross Profit",        Forecast = gpF,    Todate = gpTD,   Execution = gpE,     Pct = Pct(gpTD, gpE),  Emphasis = true },
            new() { Label = "Total Fixed Costs",   Forecast = fixF,   Todate = fixTD,  Execution = fixE,    Pct = Pct(fixTD, fixE), Emphasis = true },
            new() { Label = "Total Variable Costs",Forecast = varF,   Todate = varTD,  Execution = varE,    Pct = Pct(varTD, varE), Emphasis = true },
            new() { Label = "Total OPEX",          Forecast = opexF,  Todate = opexTD, Execution = opexE,   Pct = Pct(opexTD, opexE), Emphasis = true },
            new() { Label = "EBIT",                Forecast = ebitF,  Todate = ebitTD, Execution = ebitE,   Pct = Pct(ebitTD, ebitE), Emphasis = true },
        };
    }

    // ─── DTOs ────────────────────────────────────────────────────────────────

    private sealed class CellRow
    {
        public int DepartmentId { get; set; }
        public int AccountId { get; set; }
        public decimal Execution { get; set; }
        public decimal Forecast { get; set; }
        public string AccountName { get; set; } = "";
        public int FinancialGroupId { get; set; }
        public int? ClassificationId { get; set; }
        public string? OdooAccountType { get; set; }
        public string FgName { get; set; } = "";
        public string? ClName { get; set; }
    }

    private sealed class DeptNameRow { public int Id { get; set; } public string Name { get; set; } = ""; }

    public sealed class DashboardResponse
    {
        public KpiDto Kpis { get; set; } = new();
        public List<MonthlyBarDto> MonthlyBars { get; set; } = new();
        public List<PieSliceDto> CostBreakdown { get; set; } = new();
        public List<OverspentDto> Overspent { get; set; } = new();
        public List<BudgetLineDto> YearlyPerformance { get; set; } = new();
        public List<CostGroupDto> CostsAnalysis { get; set; } = new();
        public List<DeptCostDto> CostByDept { get; set; } = new();
    }

    public sealed class KpiDto
    {
        public decimal TotalBudget { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal Remaining { get; set; }
        public decimal Ebit { get; set; }
    }

    public sealed class MonthlyBarDto
    {
        public string Month { get; set; } = "";
        public decimal Revenue { get; set; }
        public decimal Opex { get; set; }
    }

    public sealed class PieSliceDto
    {
        public string Name { get; set; } = "";
        public decimal Value { get; set; }
    }

    public sealed class OverspentDto
    {
        public string Account { get; set; } = "";
        public string Department { get; set; } = "";
        public decimal Budget { get; set; }
        public decimal Spent { get; set; }
    }

    public sealed class BudgetLineDto
    {
        public string Label { get; set; } = "";
        public decimal Forecast { get; set; }
        public decimal Todate { get; set; }
        public decimal Execution { get; set; }
        public int Pct { get; set; }
        public bool Emphasis { get; set; }
    }

    public sealed class CostGroupDto
    {
        public string Name { get; set; } = "";
        public decimal Todate { get; set; }
        public decimal Execution { get; set; }
    }

    public sealed class DeptCostDto
    {
        public string Department { get; set; } = "";
        public decimal Forecast { get; set; }
        public decimal Todate { get; set; }
        public decimal Execution { get; set; }
        public int Pct { get; set; }
    }
}
