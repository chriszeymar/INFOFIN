using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly string _connStr;

    public BudgetsController(IConfiguration config)
    {
        _connStr = config.GetConnectionString("Default")!;
    }

    // ─── Grid (flat rows: one per account per department) ─────────────

    [HttpGet("grid/{year:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGrid(int year, [FromQuery] string? buSu = null, [FromQuery] int? month = null)
    {
        await using var conn = new SqlConnection(_connStr);
        await conn.OpenAsync();

        var bucketFilter = string.IsNullOrEmpty(buSu) ? "" :
            @"AND EXISTS (SELECT 1 FROM Department d2
              JOIN DepartmentGroup dg2 ON dg2.Id = d2.DepartmentGroupId
              JOIN BucketType bt2 ON bt2.Id = dg2.BucketTypeId
              WHERE d2.Id = b.DepartmentId AND bt2.Name = @B)";

        var rows = (await conn.QueryAsync<GridRow>(
            $@"SELECT d.Id AS DepartmentId, d.Name AS DepartmentName, a.Name AS AccountName,
                   fg.Name AS FinancialGroup, a.OdooAccountType,
                   ISNULL(b.ForecastAmount, 0) AS Forecast,
                   ISNULL(act.Execution, 0) AS Execution,
                   ISNULL(b.ForecastAmount, 0) - ISNULL(act.Execution, 0) AS Variance
            FROM (
                -- All department+account combos that have budget OR actuals
                SELECT DepartmentId, AccountId FROM Budget WHERE Year = @Y AND IsActive = 1
                UNION
                SELECT DepartmentId, AccountId FROM Actuals WHERE Year = @Y AND (@M IS NULL OR Month <= @M)
            ) combos
            JOIN Department d ON d.Id = combos.DepartmentId AND d.IsActive = 1
            JOIN Account a ON a.Id = combos.AccountId AND a.IsActive = 1
            JOIN FinancialGroup fg ON fg.Id = a.FinancialGroupId
            LEFT JOIN Budget b ON b.DepartmentId = combos.DepartmentId 
                AND b.AccountId = combos.AccountId AND b.Year = @Y AND b.IsActive = 1
            LEFT JOIN (
                SELECT DepartmentId, AccountId, SUM(Amount) AS Execution
                FROM Actuals WHERE Year = @Y AND (@M IS NULL OR Month <= @M)
                GROUP BY DepartmentId, AccountId
            ) act ON act.DepartmentId = combos.DepartmentId AND act.AccountId = combos.AccountId
            WHERE (@B IS NULL OR EXISTS (
                SELECT 1 FROM Department d2
                JOIN DepartmentGroup dg2 ON dg2.Id = d2.DepartmentGroupId
                JOIN BucketType bt2 ON bt2.Id = dg2.BucketTypeId
                WHERE d2.Id = combos.DepartmentId AND bt2.Name = @B))
            ORDER BY d.Name, fg.Name, a.Name",
            new { Y = year, B = buSu, M = month })).ToList();

        return Ok(rows);
    }

    [HttpGet("grid/{year:int}/months")]
    public async Task<IActionResult> GetMonths(int year)
    {
        await using var conn = new SqlConnection(_connStr);
        var months = await conn.QueryAsync<int>(
            "SELECT DISTINCT Month FROM Actuals WHERE Year = @Y ORDER BY Month", new { Y = year });
        return Ok(months);
    }

    // ─── Navigator (group → department summary) ──────────────────────

    [HttpGet("navigator/{year:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetNavigator(int year, [FromQuery] string? buSu = null, [FromQuery] int? month = null)
    {
        await using var conn = new SqlConnection(_connStr);
        await conn.OpenAsync();

        var rows = (await conn.QueryAsync<NavRow>(
            @"SELECT dg.Id AS GroupId, dg.Name AS GroupName, bt.Name AS BucketType,
                   d.Id AS DeptId, d.Name AS DeptName,
                   ISNULL(bf.Forecast, 0) AS Forecast,
                   ISNULL(ae.Execution, 0) AS Execution
            FROM DepartmentGroup dg
            JOIN BucketType bt ON bt.Id = dg.BucketTypeId
            JOIN Department d ON d.DepartmentGroupId = dg.Id AND d.IsActive = 1
            LEFT JOIN (
                SELECT DepartmentId, SUM(ForecastAmount) AS Forecast
                FROM Budget WHERE Year = @Y AND IsActive = 1
                GROUP BY DepartmentId
            ) bf ON bf.DepartmentId = d.Id
            LEFT JOIN (
                SELECT DepartmentId, SUM(Amount) AS Execution
                FROM Actuals WHERE Year = @Y AND (@M IS NULL OR Month <= @M)
                GROUP BY DepartmentId
            ) ae ON ae.DepartmentId = d.Id
            WHERE (@B IS NULL OR bt.Name = @B)
            ORDER BY dg.Id, d.Id",
            new { Y = year, B = buSu, M = month })).ToList();

        var groups = rows.GroupBy(r => new { r.GroupId, r.GroupName, r.BucketType })
            .Select(g => new
            {
                id = g.Key.GroupId.ToString(),
                name = g.Key.GroupName,
                bucketType = g.Key.BucketType,
                forecast = g.Sum(r => r.Forecast),
                execution = g.Sum(r => r.Execution),
                departments = g.Select(d => new
                {
                    id = d.DeptId.ToString(),
                    name = d.DeptName,
                    forecast = d.Forecast,
                    execution = d.Execution
                })
            });

        return Ok(groups);
    }

    // ─── DTOs ────────────────────────────────────────────────────────

    public sealed class GridRow
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = "";
        public string AccountName { get; set; } = "";
        public string FinancialGroup { get; set; } = "";
        public string? OdooAccountType { get; set; }
        public decimal Forecast { get; set; }
        public decimal Execution { get; set; }
        public decimal Variance { get; set; }
    }

    private sealed class NavRow
    {
        public int GroupId { get; set; }
        public string GroupName { get; set; } = "";
        public string BucketType { get; set; } = "";
        public int DeptId { get; set; }
        public string DeptName { get; set; } = "";
        public decimal Forecast { get; set; }
        public decimal Execution { get; set; }
    }
}
