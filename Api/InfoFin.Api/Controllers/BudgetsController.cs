using System.Data;
using Dapper;
using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _service;
    private readonly string _connStr;

    public BudgetsController(IBudgetService service, IConfiguration config)
    {
        _service = service;
        _connStr = config.GetConnectionString("Default")!;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? departmentId,
        [FromQuery] int? categoryId,
        [FromQuery] int? currencyId,
        [FromQuery] bool? isActive,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetBudgetByIds(departmentId, categoryId, currencyId, isActive, sortDirection));
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? departmentId,
        [FromQuery] int? categoryId,
        [FromQuery] int? currencyId,
        [FromQuery] bool? isActive,
        [FromQuery] int? pageNumber = 1,
        [FromQuery] int? pageSize = 50,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetBudgetByIdsPaging(departmentId, categoryId, currencyId, isActive, pageNumber, pageSize, sortDirection));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetBudgetById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Budget payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdBudget(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] Budget payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdBudget(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelBudgetHrd(id);
        }
        else
        {
            await _service.DelBudgetSft(id);
        }

        return NoContent();
    }

    // ─── Budget Grid (Phase 11 — real data) ──────────────────────────────────

    [HttpGet("grid/{year:int}")]
    public async Task<IActionResult> GetGrid(int year, [FromQuery] string buSu = "BU")
    {
        await using var conn = new SqlConnection(_connStr);
        await conn.OpenAsync();

        // Get departments that have actuals for this year, filtered by bucket type
        var depts = (await conn.QueryAsync<DeptDto>(
            @"SELECT DISTINCT d.Id, d.Name FROM Department d 
              INNER JOIN Actuals a ON a.DepartmentId = d.Id 
              INNER JOIN DepartmentGroup dg ON dg.Id = d.DepartmentGroupId
              INNER JOIN BucketType bt ON bt.Id = dg.BucketTypeId
              WHERE a.Year = @Y AND d.IsActive = 1 AND bt.Name = @B", new { Y = year, B = buSu })).ToList();

        if (depts.Count == 0)
            return Ok(Array.Empty<object>());

        // Get all actuals aggregated by department + category for this year
        var rows = (await conn.QueryAsync<CellDto>(
            @"SELECT a.DepartmentId, a.CategoryId, SUM(a.Amount) AS Execution,
                   c.Name AS CatName, c.FinancialGroupId, c.ClassificationId, c.OdooAccountType,
                   fg.Name AS FgName, cl.Name AS ClName
            FROM Actuals a
            JOIN Category c ON c.Id = a.CategoryId
            JOIN FinancialGroup fg ON fg.Id = c.FinancialGroupId
            LEFT JOIN Classification cl ON cl.Id = c.ClassificationId
            WHERE a.Year = @Y
              AND EXISTS (SELECT 1 FROM Department d JOIN DepartmentGroup dg ON dg.Id = d.DepartmentGroupId JOIN BucketType bt ON bt.Id = dg.BucketTypeId WHERE d.Id = a.DepartmentId AND bt.Name = @B)
            GROUP BY a.DepartmentId, a.CategoryId, c.Name, c.FinancialGroupId, c.ClassificationId, c.OdooAccountType, fg.Name, cl.Name
            ORDER BY c.FinancialGroupId, cl.Name, c.Name", new { Y = year, B = buSu })).ToList();

        // Get budget targets
        var targets = (await conn.QueryAsync<TargetDto>(
            "SELECT DepartmentId, CategoryId, ForecastAmount FROM Budget WHERE Year = @Y",
            new { Y = year }))
            .ToDictionary(t => (t.DepartmentId, t.CategoryId), t => t.ForecastAmount);

        // Determine section type from Odoo type + FinancialGroup name (not ID)
        string MapSection(string? odooType, string fgName) => odooType switch
        {
            "income" or "income_other" => "REVENUES",
            "expense_direct_cost" => "COS",
            "expense" when string.Equals(fgName, "Fixed Costs", StringComparison.OrdinalIgnoreCase) => "FIXED_COSTS",
            "expense" when string.Equals(fgName, "Variables Costs", StringComparison.OrdinalIgnoreCase) => "VARIABLE_COSTS",
            _ => "VARIABLE_COSTS"
        };

        // Map classification by ID (not string match)
        string MapCls(int? clsId) => clsId switch
        {
            1 => "ADMIN_FIN",        // Admin & Finances
            2 => "TECH_OPS",         // Technical & Operations
            3 => "MKT_SALES",        // Marketing & Sales
            _ => "ADMIN_FIN"
        };

        // Build response: Department[] with sections
        var result = depts.Select(d => new DeptOut
        {
            Id = d.Id.ToString(),
            Name = d.Name,
            Sections = BuildSections(d.Id, rows, targets, MapSection, MapCls)
        }).ToList();

        return Ok(result);
    }

    // ─── Navigator (Phase 3 — real group/department summaries) ──────────────

    [HttpGet("navigator/{year:int}")]
    public async Task<IActionResult> GetNavigator(int year, [FromQuery] string? buSu = null)
    {
        await using var conn = new SqlConnection(_connStr);
        await conn.OpenAsync();

        var rows = (await conn.QueryAsync<NavRow>(
            @"SELECT dg.Id AS GroupId, dg.Name AS GroupName, bt.Name AS BucketType,
                   d.Id AS DeptId, d.Name AS DeptName,
                   ISNULL(SUM(b.ForecastAmount), 0) AS Forecast,
                   ISNULL(SUM(a.Amount), 0) AS Execution
            FROM DepartmentGroup dg
            JOIN BucketType bt ON bt.Id = dg.BucketTypeId
            JOIN Department d ON d.DepartmentGroupId = dg.Id AND d.IsActive = 1
            LEFT JOIN Budget b ON b.DepartmentId = d.Id AND b.Year = @Y
            LEFT JOIN Actuals a ON a.DepartmentId = d.Id AND a.Year = @Y
            WHERE (@B IS NULL OR bt.Name = @B)
            GROUP BY dg.Id, dg.Name, bt.Name, d.Id, d.Name
            ORDER BY dg.Id, d.Id", new { Y = year, B = buSu })).ToList();

        var groups = rows.GroupBy(r => new { r.GroupId, r.GroupName, r.BucketType })
            .Select(g => new NavGroupOut
            {
                Id = g.Key.GroupId.ToString(),
                Name = g.Key.GroupName,
                BucketType = g.Key.BucketType,
                Forecast = g.Sum(r => r.Forecast),
                Execution = g.Sum(r => r.Execution),
                Departments = g.Select(d => new NavDeptOut
                {
                    Id = d.DeptId.ToString(),
                    Name = d.DeptName,
                    Forecast = d.Forecast,
                    Execution = d.Execution
                }).ToList()
            }).ToList();

        return Ok(groups);
    }

    private static List<SectionOut> BuildSections(int deptId, List<CellDto> rows,
        Dictionary<(int, int), decimal> targets,
        Func<string?, string, string> mapSection, Func<int?, string> mapCls)
    {
        var deptRows = rows.Where(r => r.DepartmentId == deptId).ToList();
        var sectionOrder = new[] { "REVENUES", "COS", "FIXED_COSTS", "VARIABLE_COSTS" };

        return sectionOrder.Select(sectionType =>
        {
            var secRows = deptRows.Where(r => mapSection(r.OdooAccountType, r.FgName) == sectionType).ToList();
            if (secRows.Count == 0) return null;

            if (sectionType is "REVENUES" or "COS")
            {
                return new SectionOut
                {
                    Type = sectionType,
                    Items = secRows.Select(r => MakeItem(r, deptId, targets)).ToList()
                };
            }
            else
            {
                var clsGroups = secRows.GroupBy(r => mapCls(r.ClassificationId)).Select(g => new ClassificationOut
                {
                    Type = g.Key,
                    Items = g.Select(r => MakeItem(r, deptId, targets)).ToList()
                }).ToList();
                return new SectionOut { Type = sectionType, Classifications = clsGroups };
            }
        }).Where(s => s != null).Cast<SectionOut>().ToList();
    }

    private static ItemOut MakeItem(CellDto r, int deptId, Dictionary<(int, int), decimal> targets)
    {
        targets.TryGetValue((deptId, r.CategoryId), out var forecast);
        return new ItemOut
        {
            Id = $"{deptId}-{r.CategoryId}",
            Label = r.CatName,
            Forecast = forecast,
            Execution = r.Execution
        };
    }

    // DTOs
    private sealed class DeptDto { public int Id { get; set; } public string Name { get; set; } = ""; }
    private sealed class CellDto
    {
        public int DepartmentId { get; set; }
        public int CategoryId { get; set; }
        public decimal Execution { get; set; }
        public string CatName { get; set; } = "";
        public int FinancialGroupId { get; set; }
        public int? ClassificationId { get; set; }
        public string? OdooAccountType { get; set; }
        public string FgName { get; set; } = "";
        public string? ClName { get; set; }
    }
    private sealed class TargetDto { public int DepartmentId { get; set; } public int CategoryId { get; set; } public decimal ForecastAmount { get; set; } }

    public sealed class DeptOut
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public List<SectionOut> Sections { get; set; } = new();
    }
    public sealed class SectionOut
    {
        public string Type { get; set; } = "";
        public List<ItemOut>? Items { get; set; }
        public List<ClassificationOut>? Classifications { get; set; }
    }
    public sealed class ClassificationOut
    {
        public string Type { get; set; } = "";
        public List<ItemOut> Items { get; set; } = new();
    }
    public sealed class ItemOut
    {
        public string Id { get; set; } = "";
        public string Label { get; set; } = "";
        public decimal Forecast { get; set; }
        public decimal Execution { get; set; }
    }

    // Navigator DTOs
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
    public sealed class NavGroupOut
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string BucketType { get; set; } = "";
        public decimal Forecast { get; set; }
        public decimal Execution { get; set; }
        public List<NavDeptOut> Departments { get; set; } = new();
    }
    public sealed class NavDeptOut
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public decimal Forecast { get; set; }
        public decimal Execution { get; set; }
    }
}
