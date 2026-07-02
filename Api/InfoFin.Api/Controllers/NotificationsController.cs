using InfoFin.Domain.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationLogService _service;

    public NotificationsController(INotificationLogService service)
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

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetNotificationLogById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }
}
