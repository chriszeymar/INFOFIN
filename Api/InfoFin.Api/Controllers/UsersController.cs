using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;
    private readonly IDepartmentService _deptService;
    private readonly IRoleService _roleService;

    public UsersController(IUserService service, IDepartmentService deptService, IRoleService roleService)
    {
        _service = service;
        _deptService = deptService;
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? roleId,
        [FromQuery] int? departmentId,
        [FromQuery] bool? isActive,
        [FromQuery] string sortDirection = "ASC")
    {
        var users = await _service.GetUserByIds(roleId, departmentId, isActive, sortDirection);
        await PopulateNavigationAsync(users);
        return Ok(users);
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? roleId,
        [FromQuery] int? departmentId,
        [FromQuery] bool? isActive,
        [FromQuery] int? pageNumber = 1,
        [FromQuery] int? pageSize = 50,
        [FromQuery] string sortDirection = "ASC")
    {
        var users = await _service.GetUserByIdsPaging(roleId, departmentId, isActive, pageNumber, pageSize, sortDirection);
        await PopulateNavigationAsync(users);
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetUserById(id, true)).FirstOrDefault();
        if (item is null) return NotFound();
        await PopulateNavigationAsync(new List<User> { item });
        return Ok(item);
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

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelUserHrd(id);
        }
        else
        {
            await _service.DelUserSft(id);
        }

        return NoContent();
    }

    // ─── Navigation population ────────────────────────────────────────────

    private async Task PopulateNavigationAsync(List<User> users)
    {
        if (users.Count == 0) return;

        var departments = (await _deptService.GetDepartmentById(null, null))
            .ToDictionary(d => d.Id!.Value);
        var roles = (await _roleService.GetRoleById(null, null))
            .ToDictionary(r => r.Id!.Value);

        foreach (var u in users)
        {
            if (u.DepartmentId.HasValue)
                u.Department = departments.GetValueOrDefault(u.DepartmentId.Value);
            u.Role = roles.GetValueOrDefault(u.RoleId);
        }
    }
}
