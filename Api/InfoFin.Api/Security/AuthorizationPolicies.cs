namespace InfoFin.Api.Security;

public static class AuthorizationPolicies
{
    public const string AdminOnly = "AdminOnly";
    public const string FpaOrAdmin = "FpaOrAdmin";
    public const string ApproverOrAdmin = "ApproverOrAdmin";
}
