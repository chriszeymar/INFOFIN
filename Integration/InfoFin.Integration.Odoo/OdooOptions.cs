namespace InfoFin.Integration.Odoo;

public sealed class OdooOptions
{
    public const string SectionName = "Odoo";

    public string Url { get; set; } = "http://localhost:8069";
    public string Database { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public int SyncHourUtc { get; set; } = 2;
}
