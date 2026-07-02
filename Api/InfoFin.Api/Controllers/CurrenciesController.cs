using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CurrenciesController : ControllerBase
{
    private readonly ICurrencyService _service;

    public CurrenciesController(ICurrencyService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] List<int>? ids)
    {
        if (ids is { Count: > 0 })
        {
            return Ok(await _service.GetCurrencyByIds(ids));
        }

        return Ok(await _service.GetCurrencyById(null, true));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetCurrencyById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Currency payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdCurrency(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] Currency payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdCurrency(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelCurrencyHrd(id);
        }
        else
        {
            await _service.DelCurrencySft(id);
        }

        return NoContent();
    }
}
