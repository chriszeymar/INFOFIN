using System.Text;
using InfoFin.Api.Security;
using InfoFin.Api.Services;
using InfoFin.Integration.Odoo;
using InfoFin.ServiceCollectionExtension.Gen;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Odoo ERP integration
builder.Services.Configure<OdooOptions>(builder.Configuration.GetSection(OdooOptions.SectionName));
builder.Services.AddHttpClient<IOdooAdapter, OdooAdapter>();
builder.Services.AddScoped<OdooSyncService>();
builder.Services.AddHostedService<OdooBackgroundService>();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.AdminOnly, policy =>
        policy.RequireAssertion(ctx =>
            ctx.User.HasClaim(c =>
                c.Type == "roleId" && c.Value == "5") ||
            ctx.User.HasClaim(c =>
                c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" &&
                c.Value.Contains("Administrateur", StringComparison.OrdinalIgnoreCase))));

    options.AddPolicy(AuthorizationPolicies.FpaOrAdmin, policy =>
        policy.RequireAssertion(ctx =>
            ctx.User.HasClaim(c =>
                c.Type == "roleId" && (c.Value == "3" || c.Value == "5")) ||
            ctx.User.HasClaim(c =>
                c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" &&
                (c.Value.Contains("FPA", StringComparison.OrdinalIgnoreCase) ||
                 c.Value.Contains("Administrateur", StringComparison.OrdinalIgnoreCase)))));

    options.AddPolicy(AuthorizationPolicies.ApproverOrAdmin, policy =>
        policy.RequireAssertion(ctx =>
            ctx.User.HasClaim(c =>
                c.Type == "roleId" && (c.Value == "2" || c.Value == "3" || c.Value == "4" || c.Value == "5"))));
});

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("ConnectionStrings:Default is not configured.");

builder.Services.AddGeneratedRepositories(connectionString);
builder.Services.AddGeneratedServices();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi("/swagger/{documentName}/swagger.json");
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.RunAsync();
