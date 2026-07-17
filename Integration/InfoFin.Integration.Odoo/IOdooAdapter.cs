namespace InfoFin.Integration.Odoo;

public interface IOdooAdapter
{
    Task<bool> HealthCheckAsync(CancellationToken ct = default);
    Task<List<OdooBudgetLine>> FetchBudgetLinesAsync(int? year = null, CancellationToken ct = default);
    Task<List<OdooBudgetPost>> FetchBudgetPostsAsync(List<int> postIds, CancellationToken ct = default);
    Task<List<OdooAnalyticLine>> FetchAnalyticLinesAsync(int year, CancellationToken ct = default);
}
