namespace InfoFin.Api.Contracts.SpendRequests;

public sealed class CreateSpendRequestRequest
{
    public int DepartmentId { get; set; }
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
    public int CurrencyId { get; set; }
    public int? VendorId { get; set; }
    public int? AssignedToUserId { get; set; }
    public string Description { get; set; } = string.Empty;
}
