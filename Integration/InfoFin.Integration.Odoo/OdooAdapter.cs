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
        try
        {
            var uid = await AuthenticateAsync(ct);
            return uid > 0;
        }
        catch
        {
            return false;
        }
    }

    public async Task<List<AccountActual>> FetchActualsAsync(int year, int month, CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);

        var domain = new object[]
        {
            new object[] { "date", ">=", $"{year}-{month:D2}-01" },
            new object[] { "date", "<=", $"{year}-{month:D2}-{DateTime.DaysInMonth(year, month)}" }
        };

        var fields = new[] { "date", "name", "debit", "credit", "account_id" };

        var results = await ExecuteKwAsync<JsonElement[]>(
            uid, "account.move.line", "search_read", new object[] { domain },
            new Dictionary<string, object> { ["fields"] = fields },
            ct);

        return results
            .Select(MapToActual)
            .GroupBy(a => a.AccountCode)
            .Select(g => new AccountActual
            {
                AccountCode = g.Key,
                AccountName = g.First().AccountName,
                Debit = g.Sum(x => x.Debit),
                Credit = g.Sum(x => x.Credit),
            })
            .ToList();
    }

    public async Task<List<ChartAccount>> FetchChartOfAccountsAsync(CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);

        var fields = new[] { "code", "name", "account_type" };
        var domain = Array.Empty<object>();

        var results = await ExecuteKwAsync<JsonElement[]>(
            uid, "account.account", "search_read", new object[] { domain },
            new Dictionary<string, object> { ["fields"] = fields },
            ct);

        return results.Select(r => new ChartAccount
        {
            Code = r.GetProperty("code").GetString() ?? string.Empty,
            Name = r.GetProperty("name").GetString() ?? string.Empty,
            Type = r.TryGetProperty("account_type", out var t) ? t.GetString() ?? string.Empty : string.Empty,
        }).ToList();
    }

    public async Task<List<ErpPartner>> FetchPartnersAsync(CancellationToken ct = default)
    {
        var uid = await AuthenticateAsync(ct);

        var fields = new[] { "name", "email", "phone" };
        var domain = new object[] { new object[] { "supplier_rank", ">", 0 } };

        var results = await ExecuteKwAsync<JsonElement[]>(
            uid, "res.partner", "search_read", new object[] { domain },
            new Dictionary<string, object> { ["fields"] = fields },
            ct);

        return results.Select(r => new ErpPartner
        {
            Name = r.GetProperty("name").GetString() ?? string.Empty,
            Email = r.TryGetProperty("email", out var e) && e.ValueKind == JsonValueKind.String ? e.GetString() : null,
            Phone = r.TryGetProperty("phone", out var p) && p.ValueKind == JsonValueKind.String ? p.GetString() : null,
        }).ToList();
    }

    // ── private helpers ──

    private async Task<int> AuthenticateAsync(CancellationToken ct)
    {
        var payload = new
        {
            jsonrpc = "2.0",
            method = "call",
            @params = new
            {
                service = "common",
                method = "authenticate",
                args = new object[] { _options.Database, _options.Username, _options.ApiKey }
            }
        };

        var response = await PostRpcAsync(payload, ct);
        return response.RootElement.GetProperty("result").GetInt32();
    }

    private async Task<T> ExecuteKwAsync<T>(
        int uid, string model, string method, object[] args,
        Dictionary<string, object>? kwargs = null, CancellationToken ct = default)
    {
        var fullArgs = new object[]
        {
            _options.Database,
            uid,
            _options.ApiKey,
            model,
            method,
            args,
            kwargs ?? new Dictionary<string, object>()
        };

        var payload = new
        {
            jsonrpc = "2.0",
            method = "call",
            @params = new
            {
                service = "object",
                method = "execute_kw",
                args = fullArgs
            }
        };

        var response = await PostRpcAsync(payload, ct);
        var result = response.RootElement.GetProperty("result");
        return JsonSerializer.Deserialize<T>(result.GetRawText())!;
    }

    private async Task<JsonDocument> PostRpcAsync(object payload, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _http.PostAsync("jsonrpc", content, ct);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadAsStringAsync(ct);
        var doc = JsonDocument.Parse(body);

        if (doc.RootElement.TryGetProperty("error", out var error))
        {
            var msg = error.TryGetProperty("data", out var d)
                ? d.TryGetProperty("message", out var m) ? m.GetString() : error.GetRawText()
                : error.GetRawText();
            throw new InvalidOperationException($"Odoo RPC error: {msg}");
        }

        return doc;
    }

    private static AccountActual MapToActual(JsonElement line)
    {
        var accountId = line.GetProperty("account_id");
        var account = accountId.ValueKind == JsonValueKind.Array
            ? accountId[1].GetString() ?? string.Empty
            : accountId.GetString() ?? string.Empty;

        return new AccountActual
        {
            AccountCode = account,
            AccountName = string.Empty,
            Debit = line.GetProperty("debit").GetDecimal(),
            Credit = line.GetProperty("credit").GetDecimal(),
        };
    }
}
