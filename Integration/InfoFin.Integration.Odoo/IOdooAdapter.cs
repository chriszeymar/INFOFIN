namespace InfoFin.Integration.Odoo;

public interface IOdooAdapter
{
    Task<bool> HealthCheckAsync(CancellationToken ct = default);
    Task<List<OdooCompany>> FetchCompaniesAsync(CancellationToken ct = default);
    Task<List<ChartAccount>> FetchChartOfAccountsAsync(CancellationToken ct = default);
    Task<List<ErpPartner>> FetchPartnersAsync(CancellationToken ct = default);
    Task<List<OdooJournalLine>> FetchJournalLinesAsync(int year, DateTime? since = null, CancellationToken ct = default);
}
