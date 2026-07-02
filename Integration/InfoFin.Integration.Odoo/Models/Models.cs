namespace InfoFin.Integration.Odoo;

/// <summary>
/// Actual spending/revenue total for one account code in one period.
/// </summary>
public sealed class AccountActual
{
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public decimal Balance => Debit - Credit;
}

/// <summary>
/// A single account from the ERP chart of accounts.
/// </summary>
public sealed class ChartAccount
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}

/// <summary>
/// A vendor/partner from the ERP.
/// </summary>
public sealed class ErpPartner
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
}
