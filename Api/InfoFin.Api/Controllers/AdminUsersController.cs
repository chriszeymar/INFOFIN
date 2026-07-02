using InfoFin.Api.Security;
using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly IUserService _service;

    public AdminUsersController(IUserService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? roleId,
        [FromQuery] int? departmentId,
        [FromQuery] bool? isActive,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetUserByIds(roleId, departmentId, isActive, sortDirection));
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] User payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdUser(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] User payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdUser(payload);
        return Ok(updated);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetUserById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }
}
