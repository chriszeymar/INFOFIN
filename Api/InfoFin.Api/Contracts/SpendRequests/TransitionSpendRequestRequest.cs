namespace InfoFin.Api.Contracts.SpendRequests;

public sealed class TransitionSpendRequestRequest
{
    public string NewStatus { get; set; } = string.Empty;
    public string? Comments { get; set; }
}
