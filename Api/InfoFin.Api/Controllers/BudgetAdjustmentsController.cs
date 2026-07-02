using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class BudgetAdjustmentsController : ControllerBase
{
    private readonly IBudgetAdjustmentService _service;

    public BudgetAdjustmentsController(IBudgetAdjustmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? budgetId,
        [FromQuery] int? adjustedByUserId,
        [FromQuery] bool? isActive,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetBudgetAdjustmentByIds(budgetId, adjustedByUserId, isActive, sortDirection));
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? budgetId,
        [FromQuery] int? adjustedByUserId,
        [FromQuery] bool? isActive,
        [FromQuery] int? pageNumber = 1,
        [FromQuery] int? pageSize = 50,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetBudgetAdjustmentByIdsPaging(budgetId, adjustedByUserId, isActive, pageNumber, pageSize, sortDirection));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetBudgetAdjustmentById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] BudgetAdjustment payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdBudgetAdjustment(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] BudgetAdjustment payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdBudgetAdjustment(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelBudgetAdjustmentHrd(id);
        }
        else
        {
            await _service.DelBudgetAdjustmentSft(id);
        }

        return NoContent();
    }
}
