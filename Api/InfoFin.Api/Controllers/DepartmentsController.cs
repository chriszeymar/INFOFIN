using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _service;

    public DepartmentsController(IDepartmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? departmentGroupId,
        [FromQuery] bool? isActive,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetDepartmentByIds(departmentGroupId, isActive, sortDirection));
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? departmentGroupId,
        [FromQuery] bool? isActive,
        [FromQuery] int? pageNumber = 1,
        [FromQuery] int? pageSize = 50,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetDepartmentByIdsPaging(departmentGroupId, isActive, pageNumber, pageSize, sortDirection));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetDepartmentById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Department payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdDepartment(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] Department payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdDepartment(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelDepartmentHrd(id);
        }
        else
        {
            await _service.DelDepartmentSft(id);
        }

        return NoContent();
    }
}
