using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class DepartmentGroupsController : ControllerBase
{
    private readonly IDepartmentGroupService _service;

    public DepartmentGroupsController(IDepartmentGroupService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? bucketTypeId,
        [FromQuery] bool? isActive,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetDepartmentGroupByIds(bucketTypeId, isActive, sortDirection));
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? bucketTypeId,
        [FromQuery] bool? isActive,
        [FromQuery] int? pageNumber = 1,
        [FromQuery] int? pageSize = 50,
        [FromQuery] string sortDirection = "ASC")
    {
        return Ok(await _service.GetDepartmentGroupByIdsPaging(bucketTypeId, isActive, pageNumber, pageSize, sortDirection));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = (await _service.GetDepartmentGroupById(id, true)).FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] DepartmentGroup payload)
    {
        payload.Id = null;
        var created = await _service.InsUpdDepartmentGroup(payload);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] DepartmentGroup payload)
    {
        payload.Id = id;
        var updated = await _service.InsUpdDepartmentGroup(payload);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        if (hardDelete)
        {
            await _service.DelDepartmentGroupHrd(id);
        }
        else
        {
            await _service.DelDepartmentGroupSft(id);
        }

        return NoContent();
    }
}
