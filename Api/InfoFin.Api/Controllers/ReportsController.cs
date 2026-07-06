using InfoFin.Api.Security;
using InfoFin.Domain.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.FpaOrAdmin)]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ISpendRequestService _spendRequestService;
    private readonly IBudgetService _budgetService;

    public ReportsController(ISpendRequestService spendRequestService, IBudgetService budgetService)
    {
        _spendRequestService = spendRequestService;
        _budgetService = budgetService;
    }

    [HttpGet("approval-cycle-time")]
    public async Task<IActionResult> ApprovalCycleTime()
    {
        var requests = await _spendRequestService.GetSpendRequestByIds(null, null, null, null, null, null, null);

        var approved = requests
            .Where(x => string.Equals(x.Status, "Approved", StringComparison.OrdinalIgnoreCase))
            .ToList();

        var avgHours = approved.Count == 0
            ? 0
            : approved.Average(x => ((x.UpdateDT ?? x.CreateDT ?? DateTime.MinValue) - (x.CreateDT ?? DateTime.MinValue)).TotalHours);

        return Ok(new
        {
            totalApproved = approved.Count,
            averageHours = Math.Round(avgHours, 2)
        });
    }

    [HttpGet("budget-vs-actual")]
    public async Task<IActionResult> BudgetVsActual([FromQuery] int? year)
    {
        var budgets = await _budgetService.GetBudgetByIds(null, null, null, true, "ASC");
        if (year.HasValue)
        {
            budgets = budgets.Where(x => x.Year == year.Value).ToList();
        }

        var requests = await _spendRequestService.GetSpendRequestByIds(null, null, null, null, null, null, null);
        var approvedSpend = requests
            .Where(x => string.Equals(x.Status, "Approved", StringComparison.OrdinalIgnoreCase))
            .Sum(x => x.Amount);

        var forecast = budgets.Sum(x => x.ForecastAmount);

        return Ok(new
        {
            year,
            forecastAmount = forecast,
            approvedSpendAmount = approvedSpend,
            variance = forecast - approvedSpend
        });
    }

    [HttpGet("spend-by-bu-su")]
    public async Task<IActionResult> SpendByBuSu()
    {
        var requests = await _spendRequestService.GetSpendRequestByIds(null, null, null, null, null, null, null);

        var grouped = requests
            .Where(x => string.Equals(x.Status, "Approved", StringComparison.OrdinalIgnoreCase))
            .GroupBy(x => x.DepartmentId)
            .Select(g => new
            {
                departmentId = g.Key,
                approvedSpend = g.Sum(x => x.Amount),
                requestCount = g.Count()
            })
            .OrderByDescending(x => x.approvedSpend)
            .ToList();

        return Ok(grouped);
    }
}
