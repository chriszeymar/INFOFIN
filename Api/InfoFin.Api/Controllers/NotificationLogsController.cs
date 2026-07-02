using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class NotificationLogsController : ControllerBase
{
    private readonly INotificationLogService _service;

    public NotificationLogsController(INotificationLogService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? spendRequestId,
        [FromQuery] int? recipientUserId,
        [FromQuery] bool? isActive,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetNotificationLogByIds(spendRequestId, recipientUserId, isActive, sortDirection));
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? spendRequestId,
        [FromQuery] int? recipientUserId,
        [FromQuery] bool? isActive,
        [FromQuery] int? pageNumber = 1,
        [FromQuery] int? pageSize = 50,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetNotificationLogByIdsPaging(spendRequestId, recipientUserId, isActive, pageNumber, pageSize, sortDirection));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetNotificationLogById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] NotificationLog payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdNotificationLog(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] NotificationLog payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdNotificationLog(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelNotificationLogHrd(id);
        }
        else
        {
            await _service.DelNotificationLogSft(id);
        }

        return NoContent();
    }
}
