namespace InfoFin.Api.Contracts.Auth;

public sealed class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public int ExpiresInSeconds { get; set; }
    public int UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
}
