using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SpendRequestHistoriesController : ControllerBase
{
    private readonly ISpendRequestHistoryService _service;

    public SpendRequestHistoriesController(ISpendRequestHistoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? spendRequestId,
        [FromQuery] int? actionById,
        [FromQuery] bool? isActive,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetSpendRequestHistoryByIds(spendRequestId, actionById, isActive, sortDirection));
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? spendRequestId,
        [FromQuery] int? actionById,
        [FromQuery] bool? isActive,
        [FromQuery] int? pageNumber = 1,
        [FromQuery] int? pageSize = 50,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetSpendRequestHistoryByIdsPaging(spendRequestId, actionById, isActive, pageNumber, pageSize, sortDirection));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetSpendRequestHistoryById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] SpendRequestHistory payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdSpendRequestHistory(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] SpendRequestHistory payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdSpendRequestHistory(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelSpendRequestHistoryHrd(id);
        }
        else
        {
            await _service.DelSpendRequestHistorySft(id);
        }

        return NoContent();
    }
}
