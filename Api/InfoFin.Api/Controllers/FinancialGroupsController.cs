using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class FinancialGroupsController : ControllerBase
{
    private readonly IFinancialGroupService _service;

    public FinancialGroupsController(IFinancialGroupService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] List<int>? ids)
    {
        if (ids is { Count: > 0 })
        {
            return Ok(await _service.GetFinancialGroupByIds(ids));
        }

        return Ok(await _service.GetFinancialGroupById(null, true));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetFinancialGroupById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] FinancialGroup payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdFinancialGroup(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] FinancialGroup payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdFinancialGroup(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelFinancialGroupHrd(id);
        }
        else
        {
            await _service.DelFinancialGroupSft(id);
        }

        return NoContent();
    }
}
