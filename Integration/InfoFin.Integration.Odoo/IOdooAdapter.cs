namespace InfoFin.Integration.Odoo;

/// <summary>
/// Contract for ERP data adapters. Implementations can target Odoo, Sage, SAP, etc.
/// </summary>
public interface IOdooAdapter
{
    /// <summary>
    /// Pull actual journal entry totals from the ERP, grouped by account code, for a given year/month.
    /// </summary>
    Task<List<AccountActual>> FetchActualsAsync(int year, int month, CancellationToken ct = default);

    /// <summary>
    /// Pull the chart of accounts from the ERP.
    /// </summary>
    Task<List<ChartAccount>> FetchChartOfAccountsAsync(CancellationToken ct = default);

    /// <summary>
    /// Pull vendor/partner data from the ERP.
    /// </summary>
    Task<List<ErpPartner>> FetchPartnersAsync(CancellationToken ct = default);

    /// <summary>
    /// Verify connectivity to the ERP.
    /// </summary>
    Task<bool> HealthCheckAsync(CancellationToken ct = default);
}
