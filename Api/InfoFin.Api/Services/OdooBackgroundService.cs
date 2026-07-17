using InfoFin.Integration.Odoo;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace InfoFin.Api.Services;

public sealed class OdooBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OdooBackgroundService> _logger;
    private readonly OdooOptions _options;

    public OdooBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<OdooBackgroundService> logger,
        IOptions<OdooOptions> options)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _options = options.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        // Wait until the configured sync hour, then sync daily
        while (!ct.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddHours(_options.SyncHourUtc);
            if (nextRun <= now) nextRun = nextRun.AddDays(1);

            var delay = nextRun - now;
            _logger.LogInformation("Next Odoo sync scheduled at {NextRun:O} (in {Delay})", nextRun, delay);

            await Task.Delay(delay, ct);

            await SyncOnceAsync(now, ct);
        }
    }

    private async Task SyncOnceAsync(DateTime now, CancellationToken ct)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var adapter = scope.ServiceProvider.GetRequiredService<IOdooAdapter>();

            _logger.LogInformation("Odoo health check for {Year}/{Month}", now.Year, now.Month);
            var healthy = await adapter.HealthCheckAsync(ct);
            _logger.LogInformation("Odoo connected: {Healthy}", healthy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Odoo background sync failed");
        }
    }
}
