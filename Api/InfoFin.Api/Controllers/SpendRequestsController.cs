using System.Security.Claims;
using InfoFin.Api.Contracts.SpendRequests;
using InfoFin.Domain.Interface;
using InfoFin.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfoFin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SpendRequestsController : ControllerBase
{
    private const string StatusPosted = "Posted";
    private const string StatusUnderReview = "UnderReview";
    private const string StatusApproved = "Approved";
    private const string StatusCompleted = "Completed";
    private const string StatusDeclined = "Declined";

    private readonly ISpendRequestService _spendRequestService;
    private readonly ISpendRequestHistoryService _spendRequestHistoryService;
    private readonly INotificationLogService _notificationLogService;
    private readonly IUserService _userService;
    private readonly IRoleService _roleService;
    private readonly IDepartmentService _departmentService;
    private readonly ICurrencyService _currencyService;

    public SpendRequestsController(
        ISpendRequestService spendRequestService,
        ISpendRequestHistoryService spendRequestHistoryService,
        INotificationLogService notificationLogService,
        IUserService userService,
        IRoleService roleService,
        IDepartmentService departmentService,
        ICurrencyService currencyService)
    {
        _spendRequestService = spendRequestService;
        _spendRequestHistoryService = spendRequestHistoryService;
        _notificationLogService = notificationLogService;
        _userService = userService;
        _roleService = roleService;
        _departmentService = departmentService;
        _currencyService = currencyService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<SpendRequest>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] string? status)
    {
        var context = await BuildUserContext();
        if (context is null)
        {
            return Unauthorized();
        }

        var requests = await _spendRequestService.GetSpendRequestByIds(null, null, null, null, null, null, null);
        requests = await FilterByScope(requests, context);

        if (!string.IsNullOrWhiteSpace(status))
        {
            requests = requests
                .Where(x => string.Equals(x.Status, status, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        return Ok(requests.OrderByDescending(x => x.UpdateDT));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SpendRequest), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var context = await BuildUserContext();
        if (context is null)
        {
            return Unauthorized();
        }

        var request = (await _spendRequestService.GetSpendRequestById(id, true)).FirstOrDefault();
        if (request is null)
        {
            return NotFound();
        }

        if (!await CanAccessRequest(request, context))
        {
            return Forbid();
        }

        return Ok(request);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SpendRequest), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateSpendRequestRequest request)
    {
        var context = await BuildUserContext();
        if (context is null)
        {
            return Unauthorized();
        }

        if (!(context.IsAnalyst || context.IsAdmin))
        {
            return Forbid();
        }

        if (request.Amount <= 0)
        {
            return BadRequest(new { message = "Amount must be greater than zero." });
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest(new { message = "Description is required." });
        }

        if (context.IsAnalyst && context.DepartmentId != request.DepartmentId)
        {
            return Forbid();
        }

        var currency = (await _currencyService.GetCurrencyById(request.CurrencyId, true)).FirstOrDefault();
        if (currency is null)
        {
            return BadRequest(new { message = "Invalid currency." });
        }

        var spendRequest = new SpendRequest
        {
            ReferenceNumber = GenerateReferenceNumber(),
            DepartmentId = request.DepartmentId,
            CategoryId = request.CategoryId,
            EncoderId = context.UserId,
            AssignedToUserId = request.AssignedToUserId,
            Amount = request.Amount,
            CurrencyId = request.CurrencyId,
            LockedExchangeRate = currency.ExchangeRateToUSD,
            VendorId = request.VendorId,
            Description = request.Description.Trim(),
            Status = StatusPosted
        };

        var created = await _spendRequestService.InsUpdSpendRequest(spendRequest);

        await _spendRequestHistoryService.InsUpdSpendRequestHistory(new SpendRequestHistory
        {
            SpendRequestId = created.Id!.Value,
            ActionById = context.UserId,
            OldStatus = "Draft",
            NewStatus = created.Status ?? StatusPosted,
            Comments = "Spend request created"
        });

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("{id:int}/transition")]
    [ProducesResponseType(typeof(SpendRequest), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Transition(int id, [FromBody] TransitionSpendRequestRequest request)
    {
        var context = await BuildUserContext();
        if (context is null)
        {
            return Unauthorized();
        }

        var spendRequest = (await _spendRequestService.GetSpendRequestById(id, true)).FirstOrDefault();
        if (spendRequest is null)
        {
            return NotFound();
        }

        if (!await CanAccessRequest(spendRequest, context))
        {
            return Forbid();
        }

        var targetStatus = NormalizeStatus(request.NewStatus);
        if (targetStatus is null)
        {
            return BadRequest(new { message = "Unsupported target status." });
        }

        if (!CanTransition(spendRequest.Status, targetStatus, context))
        {
            return BadRequest(new
            {
                message = $"Transition from '{spendRequest.Status}' to '{targetStatus}' is not allowed for role '{context.RoleName}'."
            });
        }

        var oldStatus = spendRequest.Status ?? "Unknown";
        spendRequest.Status = targetStatus;

        var updated = await _spendRequestService.InsUpdSpendRequest(spendRequest);

        await _spendRequestHistoryService.InsUpdSpendRequestHistory(new SpendRequestHistory
        {
            SpendRequestId = updated.Id!.Value,
            ActionById = context.UserId,
            OldStatus = oldStatus,
            NewStatus = targetStatus,
            Comments = string.IsNullOrWhiteSpace(request.Comments) ? "Status transition" : request.Comments.Trim()
        });

        await _notificationLogService.InsUpdNotificationLog(new NotificationLog
        {
            SpendRequestId = updated.Id.Value,
            RecipientUserId = updated.EncoderId,
            TriggerStatus = targetStatus,
            IsSuccessful = true
        });

        return Ok(updated);
    }

    private async Task<UserContext?> BuildUserContext()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        var user = (await _userService.GetUserById(userId, true)).FirstOrDefault();
        if (user is null || user.Id is null)
        {
            return null;
        }

        var role = (await _roleService.GetRoleById(user.RoleId, true)).FirstOrDefault();
        var roleName = role?.Name ?? string.Empty;

        return new UserContext
        {
            UserId = user.Id.Value,
            DepartmentId = user.DepartmentId,
            RoleName = roleName,
            IsAnalyst = RoleContains(roleName, "ANALYST"),
            IsReviewer = RoleContains(roleName, "REVIEWER"),
            IsApprover = RoleContains(roleName, "APPROVER"),
            IsAdmin = RoleContains(roleName, "ADMIN")
        };
    }

    private async Task<List<SpendRequest>> FilterByScope(List<SpendRequest> requests, UserContext context)
    {
        if (context.IsAdmin || context.IsReviewer || context.IsApprover)
        {
            return requests;
        }

        if (context.IsAnalyst)
        {
            if (!context.DepartmentId.HasValue)
            {
                return new List<SpendRequest>();
            }

            return requests.Where(x => x.DepartmentId == context.DepartmentId.Value).ToList();
        }

        return new List<SpendRequest>();
    }

    private async Task<bool> CanAccessRequest(SpendRequest request, UserContext context)
    {
        if (context.IsAdmin || context.IsReviewer || context.IsApprover)
        {
            return true;
        }

        if (context.IsAnalyst)
        {
            return context.DepartmentId.HasValue && request.DepartmentId == context.DepartmentId.Value;
        }

        return false;
    }

    private static bool CanTransition(string? currentStatus, string targetStatus, UserContext context)
    {
        if (context.IsAdmin)
        {
            return currentStatus is not (StatusApproved or StatusDeclined);
        }

        return currentStatus switch
        {
            StatusPosted => context.IsReviewer && (targetStatus == StatusUnderReview || targetStatus == StatusDeclined),
            StatusUnderReview => context.IsApprover && (targetStatus == StatusApproved || targetStatus == StatusDeclined),
            StatusApproved => context.IsAnalyst && targetStatus == StatusCompleted,
            _ => false
        };
    }

    private static string? NormalizeStatus(string? rawStatus)
    {
        if (string.IsNullOrWhiteSpace(rawStatus))
        {
            return null;
        }

        var normalized = rawStatus.Trim().Replace(" ", string.Empty, StringComparison.Ordinal).ToUpperInvariant();
        return normalized switch
        {
            "POSTED" => StatusPosted,
            "UNDERREVIEW" => StatusUnderReview,
            "APPROVED" => StatusApproved,
            "COMPLETED" => StatusCompleted,
            "DECLINED" => StatusDeclined,
            _ => null
        };
    }

    private static string GenerateReferenceNumber()
    {
        return $"SR-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
    }

    private static bool RoleContains(string roleName, string token)
    {
        return roleName.Contains(token, StringComparison.OrdinalIgnoreCase);
    }

    private sealed class UserContext
    {
        public int UserId { get; init; }
        public int? DepartmentId { get; init; }
        public string RoleName { get; init; } = string.Empty;
        public bool IsAnalyst { get; init; }
        public bool IsReviewer { get; init; }
        public bool IsApprover { get; init; }
        public bool IsAdmin { get; init; }
    }
}
