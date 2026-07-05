namespace InfoFin.Integration.Odoo;

public sealed class OdooCompany
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? CurrencyId { get; set; }
}

public sealed class ChartAccount
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
}

public sealed class ErpPartner
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

public sealed class OdooJournalLine
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string? Label { get; set; }
    public string? State { get; set; }
    public DateTime? WriteDate { get; set; }
}
