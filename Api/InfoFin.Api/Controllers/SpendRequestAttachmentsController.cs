using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SpendRequestAttachmentsController : ControllerBase
{
    private readonly ISpendRequestAttachmentService _service;

    public SpendRequestAttachmentsController(ISpendRequestAttachmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? spendRequestId,
        [FromQuery] int? uploadedByUserId,
        [FromQuery] bool? isActive,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetSpendRequestAttachmentByIds(spendRequestId, uploadedByUserId, isActive, sortDirection));
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? spendRequestId,
        [FromQuery] int? uploadedByUserId,
        [FromQuery] bool? isActive,
        [FromQuery] int? pageNumber = 1,
        [FromQuery] int? pageSize = 50,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetSpendRequestAttachmentByIdsPaging(spendRequestId, uploadedByUserId, isActive, pageNumber, pageSize, sortDirection));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetSpendRequestAttachmentById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] SpendRequestAttachment payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdSpendRequestAttachment(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] SpendRequestAttachment payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdSpendRequestAttachment(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelSpendRequestAttachmentHrd(id);
        }
        else
        {
            await _service.DelSpendRequestAttachmentSft(id);
        }

        return NoContent();
    }
}
