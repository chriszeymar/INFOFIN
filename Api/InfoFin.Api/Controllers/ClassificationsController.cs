using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ClassificationsController : ControllerBase
{
    private readonly IClassificationService _service;

    public ClassificationsController(IClassificationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] List<int>? ids)
    {
        if (ids is { Count: > 0 })
        {
            return Ok(await _service.GetClassificationByIds(ids));
        }

        return Ok(await _service.GetClassificationById(null, true));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetClassificationById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Classification payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdClassification(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] Classification payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdClassification(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelClassificationHrd(id);
        }
        else
        {
            await _service.DelClassificationSft(id);
        }

        return NoContent();
    }
}
