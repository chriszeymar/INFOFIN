using System.Data;
using Dapper;
using InfoFin.Domain.Interface;
using InfoFin.Integration.Odoo;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OdooController : ControllerBase
{
    private readonly IOdooAdapter _odoo;
    private readonly IDepartmentService _dept;
    private readonly ICategoryService _cat;
    private readonly string _connStr;

    private static readonly HashSet<string> PnlTypes = new(StringComparer.OrdinalIgnoreCase)
        { "income", "income_other", "expense", "expense_direct_cost" };

    private static readonly Dictionary<string, int> TypeToFg = new(StringComparer.OrdinalIgnoreCase)
    {
        ["income"] = 1, ["income_other"] = 1,
        ["expense_direct_cost"] = 2,
        ["expense"] = 4
    };

    public OdooController(IOdooAdapter odoo, IDepartmentService dept, ICategoryService cat, IConfiguration config)
    {
        _odoo = odoo;
        _dept = dept;
        _cat = cat;
        _connStr = config.GetConnectionString("Default")!;
    }

    [HttpGet("health")]
    public async Task<IActionResult> Health()
    {
        var ok = await _odoo.HealthCheckAsync();
        return Ok(new { connected = ok });
    }

    [HttpPost("sync")]
    public async Task<IActionResult> Sync()
    {
        var result = new SyncResult();
        try
        {
            // Step 1+2: Sync master data
            var companies = await _odoo.FetchCompaniesAsync();
            result.Companies = await SyncCompanies(companies);

            var accounts = await _odoo.FetchChartOfAccountsAsync();
            int catsCreated = 0, catsUpdated = 0;
            foreach (var acct in accounts.Where(a => PnlTypes.Contains(a.Type)))
            {
                if (await UpsertCategory(acct))
                    catsCreated++;
                else
                    catsUpdated++;
            }
            result.CategoriesCreated = catsCreated;
            result.CategoriesUpdated = catsUpdated;

            // Step 3: Sync journal lines (current year)
            var year = DateTime.UtcNow.Year;
            var lines = await _odoo.FetchJournalLinesAsync(year);
            await StoreJournalLines(lines);
            result.JournalLines = lines.Count;

            // Step 4: Aggregate to Actuals
            result.ActualsRows = await AggregateToActuals(year);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { error = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    private async Task<int> SyncCompanies(List<OdooCompany> companies)
    {
        int count = 0;
        var allDepts = await _dept.GetDepartmentByIds(null, null, "ASC");
        await using var conn = new SqlConnection(_connStr);
        foreach (var c in companies)
        {
            var existing = allDepts.FirstOrDefault(d => d.OdooCompanyId == c.Id)
                        ?? allDepts.FirstOrDefault(d => d.OdooCompanyId == null && string.Equals(d.Name, c.Name, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
            {
                await conn.ExecuteAsync("UPDATE Department SET Name=@Name, OdooCompanyId=@OdooCompanyId WHERE Id=@Id",
                    new { c.Name, OdooCompanyId = c.Id, existing.Id });
            }
            else
            {
                await _dept.InsUpdDepartment(new Department { Name = c.Name, DepartmentGroupId = 1 });
                var newId = (await _dept.GetDepartmentByIds(null, null, "ASC")).Max(d => d.Id);
                await conn.ExecuteAsync("UPDATE Department SET OdooCompanyId=@OdooCompanyId WHERE Id=@Id",
                    new { OdooCompanyId = c.Id, Id = newId });
                count++;
            }
        }
        return count;
    }

    private async Task<bool> UpsertCategory(ChartAccount acct)
    {
        var allCats = await _cat.GetCategoryByIds(null, null, null, "ASC");
        var existing = allCats.FirstOrDefault(c => c.OdooAccountId == acct.Id)
                    ?? allCats.FirstOrDefault(c => c.OdooAccountId == null && string.Equals(c.Name, acct.Name, StringComparison.OrdinalIgnoreCase));
        await using var conn = new SqlConnection(_connStr);
        if (existing != null)
        {
            await conn.ExecuteAsync(
                "UPDATE Category SET Name=@Name, OdooAccountId=@OdooAccountId, OdooAccountCode=@Code, OdooAccountType=@Type WHERE Id=@Id",
                new { acct.Name, OdooAccountId = acct.Id, Code = acct.Code, Type = acct.Type, existing.Id });
            return false;
        }
        else
        {
            await _cat.InsUpdCategory(new Category { Name = acct.Name, FinancialGroupId = TypeToFg.GetValueOrDefault(acct.Type, 4) });
            var newId = (await _cat.GetCategoryByIds(null, null, null, "ASC")).Max(c => c.Id);
            await conn.ExecuteAsync(
                "UPDATE Category SET OdooAccountId=@OdooAccountId, OdooAccountCode=@Code, OdooAccountType=@Type WHERE Id=@Id",
                new { OdooAccountId = acct.Id, Code = acct.Code, Type = acct.Type, Id = newId });
            return true;
        }
    }

    private async Task StoreJournalLines(List<OdooJournalLine> lines)
    {
        await using var conn = new SqlConnection(_connStr);
        const string sql = """
            MERGE OdooJournalLine AS t
            USING (SELECT @OdooLineId AS OdooLineId) AS s ON t.OdooLineId = s.OdooLineId
            WHEN MATCHED THEN UPDATE SET
                OdooCompanyId=@OdooCompanyId, OdooCompanyName=@OdooCompanyName,
                OdooAccountId=@OdooAccountId, OdooAccountCode=@OdooAccountCode, OdooAccountName=@OdooAccountName,
                Date=@Date, Debit=@Debit, Credit=@Credit, State='posted', OdooWriteDate=@OdooWriteDate, ImportedAt=GETDATE()
            WHEN NOT MATCHED THEN INSERT (OdooLineId, OdooCompanyId, OdooCompanyName, OdooAccountId, OdooAccountCode, OdooAccountName, Date, Debit, Credit, State, OdooWriteDate)
            VALUES (@OdooLineId, @OdooCompanyId, @OdooCompanyName, @OdooAccountId, @OdooAccountCode, @OdooAccountName, @Date, @Debit, @Credit, 'posted', @OdooWriteDate);
            """;
        foreach (var l in lines)
            await conn.ExecuteAsync(sql, new
            {
                l.Id, OdooLineId = l.Id, OdooCompanyId = l.CompanyId, OdooCompanyName = l.CompanyName,
                OdooAccountId = l.AccountId, OdooAccountCode = l.AccountCode, OdooAccountName = l.AccountName,
                Date = l.Date.ToDateTime(TimeOnly.MinValue), l.Debit, l.Credit, OdooWriteDate = l.WriteDate
            });
    }

    private async Task<int> AggregateToActuals(int year)
    {
        await using var conn = new SqlConnection(_connStr);
        const string sql = """
            MERGE Actuals AS t
            USING (
                SELECT d.Id AS DeptId, c.Id AS CatId, jl.Year, jl.Month, SUM(jl.NetAmount) AS Amt
                FROM OdooJournalLine jl
                JOIN Department d ON d.OdooCompanyId = jl.OdooCompanyId
                JOIN Category c ON c.OdooAccountId = jl.OdooAccountId
                WHERE jl.Year = @Year
                GROUP BY d.Id, c.Id, jl.Year, jl.Month
            ) AS s ON t.DepartmentId = s.DeptId AND t.CategoryId = s.CatId AND t.Year = s.Year AND (t.Month = s.Month OR (t.Month IS NULL AND s.Month IS NULL))
            WHEN MATCHED THEN UPDATE SET Amount = s.Amt
            WHEN NOT MATCHED THEN INSERT (DepartmentId, CategoryId, Year, Month, Amount)
            VALUES (s.DeptId, s.CatId, s.Year, s.Month, s.Amt);
            """;
        return await conn.ExecuteAsync(sql, new { Year = year });
    }

    public sealed class SyncResult
    {
        public int Companies { get; set; }
        public int CategoriesCreated { get; set; }
        public int CategoriesUpdated { get; set; }
        public int JournalLines { get; set; }
        public int ActualsRows { get; set; }
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        await using var conn = new SqlConnection(_connStr);
        var companies = await conn.QuerySingleOrDefaultAsync<int>("SELECT COUNT(*) FROM Department WHERE OdooCompanyId IS NOT NULL");
        var categories = await conn.QuerySingleOrDefaultAsync<int>("SELECT COUNT(*) FROM Category WHERE OdooAccountId IS NOT NULL");
        var journalLines = await conn.QuerySingleOrDefaultAsync<int>("SELECT COUNT(*) FROM OdooJournalLine");
        var actualsRows = await conn.QuerySingleOrDefaultAsync<int>("SELECT COUNT(*) FROM Actuals");
        var lastSync = await conn.QuerySingleOrDefaultAsync<DateTime?>(
            "SELECT MAX(ImportedAt) FROM OdooJournalLine");
        var years = (await conn.QueryAsync<int>("SELECT DISTINCT Year FROM Actuals ORDER BY Year")).ToList();

        return Ok(new
        {
            companies,
            categories,
            journalLines,
            actualsRows,
            lastSync,
            availableYears = years
        });
    }
}
