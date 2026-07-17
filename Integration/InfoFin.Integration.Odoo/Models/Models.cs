namespace InfoFin.Integration.Odoo;

public sealed class OdooBudgetLine
{
    public int Id { get; set; }
    public int BudgetPostId { get; set; }
    public string BudgetPostName { get; set; } = string.Empty;
    public int AnalyticAccountId { get; set; }
    public string AnalyticAccountName { get; set; } = string.Empty;
    public DateOnly DateFrom { get; set; }
    public DateOnly DateTo { get; set; }
    public decimal PlannedAmount { get; set; }
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
}

public sealed class OdooBudgetPost
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<int> AccountIds { get; set; } = new();
}

public sealed class OdooAnalyticLine
{
    public int Id { get; set; }
    public int AnalyticAccountId { get; set; }
    public string AnalyticAccountName { get; set; } = string.Empty;
    public int GeneralAccountId { get; set; }
    public string GeneralAccountCode { get; set; } = string.Empty;
    public string GeneralAccountName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
}
