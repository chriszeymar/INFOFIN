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

    public async Task<bool> HealthCheckAsync(CancellationToken ct = default)
    {
        try { var uid = await AuthenticateAsync(ct); return uid > 0; }
        catch { return false; }
    }

    public async Task<List<OdooCompany>> FetchCompaniesAsync(CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);
        var results = await ExecuteKwAsync<JsonElement[]>(uid, "res.company", "search_read",
            new object[] { Array.Empty<object>() },
            new Dictionary<string, object> { ["fields"] = new[] { "id", "name", "currency_id" } }, ct);

        return results.Select(r => new OdooCompany
        {
            Id = r.GetProperty("id").GetInt32(),
            Name = SafeString(TryGet(r, "name")),
            CurrencyId = TryGet(r, "currency_id") is var c && c.ValueKind == JsonValueKind.Object && c.TryGetProperty("id", out var cid) ? cid.GetInt32() : null
        }).ToList();
    }

    public async Task<List<ChartAccount>> FetchChartOfAccountsAsync(CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);
        var fields = new[] { "id", "code", "name", "account_type", "company_id" };
        var results = await ExecuteKwAsync<JsonElement[]>(uid, "account.account", "search_read",
            new object[] { Array.Empty<object>() },
            new Dictionary<string, object> { ["fields"] = fields }, ct);

        return results.Select(r => new ChartAccount
        {
            Id = r.GetProperty("id").GetInt32(),
            Code = SafeString(TryGet(r, "code")),
            Name = SafeString(TryGet(r, "name")),
            Type = SafeString(TryGet(r, "account_type")),
            CompanyId = TupleId(TryGet(r, "company_id")),
            CompanyName = TupleName(TryGet(r, "company_id"))
        }).ToList();
    }

    public async Task<List<ErpPartner>> FetchPartnersAsync(CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);
        var fields = new[] { "name", "email", "phone" };
        var domain = new object[] { new object[] { "supplier_rank", ">", 0 } };
        var results = await ExecuteKwAsync<JsonElement[]>(uid, "res.partner", "search_read",
            new object[] { domain },
            new Dictionary<string, object> { ["fields"] = fields }, ct);

        return results.Select(r => new ErpPartner
        {
            Name = r.GetProperty("name").GetString() ?? "",
            Email = r.TryGetProperty("email", out var e) && e.ValueKind == JsonValueKind.String ? e.GetString() : null,
            Phone = r.TryGetProperty("phone", out var p) && p.ValueKind == JsonValueKind.String ? p.GetString() : null,
        }).ToList();
    }

    public async Task<List<OdooJournalLine>> FetchJournalLinesAsync(int year, DateTime? since = null, CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);
        var domain = new List<object>
        {
            new object[] { "date", ">=", $"{year}-01-01" },
            new object[] { "date", "<=", $"{year}-12-31" },
            new object[] { "parent_state", "=", "posted" }
        };
        if (since.HasValue)
            domain.Add(new object[] { "write_date", ">", since.Value.ToString("yyyy-MM-dd HH:mm:ss") });

        var fields = new[] { "id", "account_id", "company_id", "date", "debit", "credit", "name", "write_date" };
        var results = await ExecuteKwAsync<JsonElement[]>(uid, "account.move.line", "search_read",
            new object[] { domain.ToArray() },
            new Dictionary<string, object> { ["fields"] = fields }, ct);

        return results.Select(MapToJournalLine).ToList();
    }

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

    private static OdooJournalLine MapToJournalLine(JsonElement line)
    {
        var acct = TryGet(line, "account_id");
        var comp = TryGet(line, "company_id");
        var dt = TryGet(line, "date");
        return new OdooJournalLine
        {
            Id = line.GetProperty("id").GetInt32(),
            AccountId = TupleId(acct), AccountCode = "", AccountName = TupleName(acct),
            CompanyId = TupleId(comp), CompanyName = TupleName(comp),
            Date = dt.ValueKind == JsonValueKind.String && DateOnly.TryParse(dt.GetString()?[..10], out var d) ? d : DateOnly.MinValue,
            Debit = TryGet(line, "debit") is var deb && deb.ValueKind == JsonValueKind.Number ? deb.GetDecimal() : 0,
            Credit = TryGet(line, "credit") is var cr && cr.ValueKind == JsonValueKind.Number ? cr.GetDecimal() : 0,
            Label = SafeString(TryGet(line, "name")),
            WriteDate = TryGet(line, "write_date") is var wd && wd.ValueKind == JsonValueKind.String && DateTime.TryParse(wd.GetString(), out var wdt) ? wdt : null
        };
    }

    private static int TupleId(JsonElement e) => e.ValueKind == JsonValueKind.Array && e.GetArrayLength() >= 1 && e[0].ValueKind == JsonValueKind.Number ? e[0].GetInt32() : 0;
    private static string TupleName(JsonElement e) => e.ValueKind == JsonValueKind.Array && e.GetArrayLength() >= 2 ? SafeString(e[1]) : e.ValueKind == JsonValueKind.String ? e.GetString() ?? "" : "";
    private static JsonElement TryGet(JsonElement e, string n) => e.TryGetProperty(n, out var v) ? v : default;
    private static string SafeString(JsonElement e) => e.ValueKind == JsonValueKind.String ? e.GetString() ?? "" : "";
}
