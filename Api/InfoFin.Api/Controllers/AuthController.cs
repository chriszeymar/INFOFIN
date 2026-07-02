using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InfoFin.Api.Contracts.Auth;
using InfoFin.Api.Security;
using InfoFin.Domain.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace InfoFin.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IRoleService _roleService;
    private readonly JwtOptions _jwtOptions;

    public AuthController(IUserService userService, IRoleService roleService, IOptions<JwtOptions> jwtOptions)
    {
        _userService = userService;
        _roleService = roleService;
        _jwtOptions = jwtOptions.Value;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var users = await _userService.GetUserByIds(null, null, true);
        var user = users.FirstOrDefault(u =>
            !string.IsNullOrWhiteSpace(u.Email) &&
            string.Equals(u.Email, request.Email, StringComparison.OrdinalIgnoreCase));

        if (user is null || user.Id is null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        if (!VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var role = (await _roleService.GetRoleById(user.RoleId, true)).FirstOrDefault();
        var roleName = role?.Name ?? "Unknown";

        var token = BuildToken(user, roleName, out var expiresInSeconds);

        return Ok(new LoginResponse
        {
            AccessToken = token,
            ExpiresInSeconds = expiresInSeconds,
            UserId = user.Id.Value,
            Role = roleName,
            DepartmentId = user.DepartmentId
        });
    }

    private string BuildToken(InfoFin.Model.User user, string roleName, out int expiresInSeconds)
    {
        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(_jwtOptions.ExpiryMinutes);
        expiresInSeconds = (int)TimeSpan.FromMinutes(_jwtOptions.ExpiryMinutes).TotalSeconds;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id!.Value.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.Value.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Role, roleName),
            new("roleId", user.RoleId.ToString())
        };

        if (user.DepartmentId.HasValue)
        {
            claims.Add(new Claim("departmentId", user.DepartmentId.Value.ToString()));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }

    private static bool VerifyPassword(string providedPassword, string? storedPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(storedPasswordHash))
        {
            return false;
        }

        if (storedPasswordHash.StartsWith("$2", StringComparison.Ordinal))
        {
            return BCrypt.Net.BCrypt.Verify(providedPassword, storedPasswordHash);
        }

        return string.Equals(providedPassword, storedPasswordHash, StringComparison.Ordinal);
    }
}
