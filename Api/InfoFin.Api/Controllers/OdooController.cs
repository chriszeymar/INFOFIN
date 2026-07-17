using System.Data;
using Dapper;
using InfoFin.Api.Services;
using InfoFin.Integration.Odoo;
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
    private readonly OdooSyncService _sync;
    private readonly string _connStr;

    public OdooController(IOdooAdapter odoo, OdooSyncService sync, IConfiguration config)
    {
        _odoo = odoo;
        _sync = sync;
        _connStr = config.GetConnectionString("Default")!;
    }

    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<IActionResult> Health()
    {
        var ok = await _odoo.HealthCheckAsync();
        return Ok(new { connected = ok });
    }

    [HttpGet("status")]
    [AllowAnonymous]
    public async Task<IActionResult> Status()
    {
        await using var conn = new SqlConnection(_connStr);
        var budgetRows = await conn.QuerySingleOrDefaultAsync<int>("SELECT COUNT(*) FROM Budget WHERE IsActive = 1");
        var actualsRows = await conn.QuerySingleOrDefaultAsync<int>("SELECT COUNT(*) FROM Actuals");
        return Ok(new { budgetRows, actualsRows });
    }

    [HttpPost("sync")]
    [AllowAnonymous]
    public async Task<IActionResult> Sync([FromQuery] int year = 0)
    {
        try
        {
            var y = year > 0 ? year : DateTime.UtcNow.Year;
            var result = await _sync.SyncAsync(y);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { error = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpGet("last-sync")]
    public async Task<IActionResult> GetLastSync()
    {
        var result = await _sync.LoadLastResult();
        if (result == null)
            return Ok(new { hasData = false });
        return Ok(result);
    }

    [HttpGet("budget-rows")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBudgetRows([FromQuery] int year = 0)
    {
        var y = year > 0 ? year : DateTime.UtcNow.Year;
        await using var conn = new SqlConnection(_connStr);
        var rows = await conn.QueryAsync(@"
            SELECT d.Name AS Department, a.Name AS Account, fg.Name AS FinancialGroup,
                   b.ForecastAmount, b.Year
            FROM Budget b
            JOIN Department d ON d.Id = b.DepartmentId
            JOIN Account a ON a.Id = b.AccountId
            JOIN FinancialGroup fg ON fg.Id = a.FinancialGroupId
            WHERE b.Year = @Y AND b.IsActive = 1
            ORDER BY d.Name, fg.Name, a.Name", new { Y = y });
        return Ok(rows);
    }

    [HttpGet("actuals-rows")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActualsRows([FromQuery] int year = 0)
    {
        var y = year > 0 ? year : DateTime.UtcNow.Year;
        await using var conn = new SqlConnection(_connStr);
        var rows = await conn.QueryAsync(@"
            SELECT d.Name AS Department, a.Name AS Account, fg.Name AS FinancialGroup,
                   act.Amount, act.Year, act.Month
            FROM Actuals act
            JOIN Department d ON d.Id = act.DepartmentId
            JOIN Account a ON a.Id = act.AccountId
            JOIN FinancialGroup fg ON fg.Id = a.FinancialGroupId
            WHERE act.Year = @Y
            ORDER BY d.Name, a.Name, act.Month", new { Y = y });
        return Ok(rows);
    }
}
