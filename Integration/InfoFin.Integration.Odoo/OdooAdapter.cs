using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace InfoFin.Integration.Odoo;

public sealed class OdooAdapter : IOdooAdapter
{
    private readonly HttpClient _http;
    private readonly OdooOptions _options;

    public OdooAdapter(HttpClient http, IOptions<OdooOptions> options)
    {
        _http = http;
        _options = options.Value;
        _http.BaseAddress = new Uri(_options.Url.TrimEnd('/') + "/");
        _http.Timeout = TimeSpan.FromSeconds(30);
    }

    // ── Health ─────────────────────────────────────────────────────

    public async Task<bool> HealthCheckAsync(CancellationToken ct = default)
    {
        try { var uid = await AuthenticateAsync(ct); return uid > 0; }
        catch { return false; }
    }

    // ── Budget / Forecast ──────────────────────────────────────────

    public async Task<List<OdooBudgetLine>> FetchBudgetLinesAsync(int? year = null, CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);
        var domain = new List<object>();
        if (year.HasValue)
        {
            domain.Add(new object[] { "date_from", ">=", $"{year}-01-01" });
            domain.Add(new object[] { "date_from", "<", $"{year + 1}-01-01" });
        }

        var results = await ExecuteKwAsync<JsonElement[]>(uid,
            "crossovered.budget.lines", "search_read",
            new object[] { domain.ToArray() },
            new Dictionary<string, object>
            {
                ["fields"] = new[] { "id", "general_budget_id", "analytic_account_id",
                                     "date_from", "date_to", "planned_amount", "company_id" }
            }, ct);

        return results.Select(r => new OdooBudgetLine
        {
            Id = r.GetProperty("id").GetInt32(),
            BudgetPostId = TupleId(TryGet(r, "general_budget_id")),
            BudgetPostName = TupleName(TryGet(r, "general_budget_id")),
            AnalyticAccountId = TupleId(TryGet(r, "analytic_account_id")),
            AnalyticAccountName = TupleName(TryGet(r, "analytic_account_id")),
            DateFrom = ParseDate(TryGet(r, "date_from")),
            DateTo = ParseDate(TryGet(r, "date_to")),
            PlannedAmount = TryGet(r, "planned_amount") is var pa && pa.ValueKind == JsonValueKind.Number
                ? pa.GetDecimal() : 0,
            CompanyId = TupleId(TryGet(r, "company_id")),
            CompanyName = TupleName(TryGet(r, "company_id"))
        }).ToList();
    }

    public async Task<List<OdooBudgetPost>> FetchBudgetPostsAsync(List<int> postIds, CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);
        var domain = new object[] { new object[] { "id", "in", postIds.ToArray() } };

        var results = await ExecuteKwAsync<JsonElement[]>(uid,
            "account.budget.post", "search_read",
            new object[] { domain },
            new Dictionary<string, object> { ["fields"] = new[] { "id", "name", "account_ids" } }, ct);

        return results.Select(r => new OdooBudgetPost
        {
            Id = r.GetProperty("id").GetInt32(),
            Name = SafeString(TryGet(r, "name")),
            AccountIds = ParseIntArray(TryGet(r, "account_ids"))
        }).ToList();
    }

    // ── Budget Execution ───────────────────────────────────────────

    public async Task<List<OdooAnalyticLine>> FetchAnalyticLinesAsync(int year, CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);
        var domain = new List<object>
        {
            new object[] { "date", ">=", $"{year}-01-01" },
            new object[] { "date", "<", $"{year + 1}-01-01" }
        };

        var fields = new[] { "id", "account_id", "general_account_id", "amount", "date", "company_id" };
        var results = await ExecuteKwAsync<JsonElement[]>(uid,
            "account.analytic.line", "search_read",
            new object[] { domain.ToArray() },
            new Dictionary<string, object> { ["fields"] = fields }, ct);

        return results.Select(r =>
        {
            var analyticAcct = TryGet(r, "account_id");
            var generalAcct = TryGet(r, "general_account_id");
            var comp = TryGet(r, "company_id");
            var dt = TryGet(r, "date");
            return new OdooAnalyticLine
            {
                Id = r.GetProperty("id").GetInt32(),
                AnalyticAccountId = TupleId(analyticAcct),
                AnalyticAccountName = TupleName(analyticAcct),
                GeneralAccountId = TupleId(generalAcct),
                GeneralAccountName = TupleName(generalAcct),
                Amount = TryGet(r, "amount") is var amt && amt.ValueKind == JsonValueKind.Number ? amt.GetDecimal() : 0,
                Date = dt.ValueKind == JsonValueKind.String && DateOnly.TryParse(dt.GetString()?[..10], out var d) ? d : DateOnly.MinValue,
                CompanyId = TupleId(comp),
                CompanyName = TupleName(comp)
            };
        }).ToList();
    }

    // ── XML-RPC helpers ────────────────────────────────────────────

    private async Task<int> AuthenticateAsync(CancellationToken ct)
    {
        var payload = new
        {
            jsonrpc = "2.0", method = "call",
            @params = new
            {
                service = "common", method = "authenticate",
                args = new object[] { _options.Database, _options.Username, _options.ApiKey, new Dictionary<string, object>() }
            }
        };
        var response = await PostRpcAsync(payload, ct);
        return response.RootElement.GetProperty("result").GetInt32();
    }

    private async Task<T> ExecuteKwAsync<T>(int uid, string model, string method, object[] args,
        Dictionary<string, object>? kwargs = null, CancellationToken ct = default)
    {
        var fullArgs = new object[] { _options.Database, uid, _options.ApiKey, model, method, args, kwargs ?? new Dictionary<string, object>() };
        var payload = new { jsonrpc = "2.0", method = "call", @params = new { service = "object", method = "execute_kw", args = fullArgs } };
        var response = await PostRpcAsync(payload, ct);
        return JsonSerializer.Deserialize<T>(response.RootElement.GetProperty("result").GetRawText())!;
    }

    private async Task<JsonDocument> PostRpcAsync(object payload, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(payload);
        var response = await _http.PostAsync("jsonrpc", new StringContent(json, Encoding.UTF8, "application/json"), ct);
        response.EnsureSuccessStatusCode();
        var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
        if (doc.RootElement.TryGetProperty("error", out var error))
        {
            var msg = error.TryGetProperty("data", out var d) && d.TryGetProperty("message", out var m) ? m.GetString() : error.GetRawText();
            throw new InvalidOperationException($"Odoo RPC error: {msg}");
        }
        return doc;
    }

    private static int TupleId(JsonElement e) =>
        e.ValueKind == JsonValueKind.Array && e.GetArrayLength() >= 1 && e[0].ValueKind == JsonValueKind.Number
            ? e[0].GetInt32() : 0;

    private static string TupleName(JsonElement e) =>
        e.ValueKind == JsonValueKind.Array && e.GetArrayLength() >= 2 ? SafeString(e[1])
        : e.ValueKind == JsonValueKind.String ? e.GetString() ?? "" : "";

    private static JsonElement TryGet(JsonElement e, string n) => e.TryGetProperty(n, out var v) ? v : default;
    private static string SafeString(JsonElement e) => e.ValueKind == JsonValueKind.String ? e.GetString() ?? "" : "";
    private static DateOnly ParseDate(JsonElement e) =>
        e.ValueKind == JsonValueKind.String && DateOnly.TryParse(e.GetString()?[..10], out var d) ? d : DateOnly.MinValue;

    private static List<int> ParseIntArray(JsonElement e) =>
        e.ValueKind == JsonValueKind.Array
            ? e.EnumerateArray().Where(x => x.ValueKind == JsonValueKind.Number).Select(x => x.GetInt32()).ToList()
            : new List<int>();
}
