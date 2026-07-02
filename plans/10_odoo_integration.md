# Phase 10: Odoo Integration — Investigation & Plan

> Pull Odoo financial data for InfoFin reporting and budget actuals

---

## Odoo Modules Visible in Screenshot

| Module | French Name | Use for InfoFin |
|--------|------------|-----------------|
| **Accounting** | Comptabilité | Actual expenses/revenues, journal entries |
| **Sales** | Ventes | Revenue data for BU reporting |
| **Purchases** | Achats | Purchase orders, vendor costs |
| **Contacts** | Contacts | Vendors, suppliers, customers |
| **Employees** | Employés | Department structure, users |
| **Dashboard** | Tableaux de bord | Pre-built Odoo reports |
| **Calendar** | Calendrier | Payment schedules |
| **Planning** | Planning | Budget planning |

---

## Deployment — Zero Extra Work

The `OdooBackgroundService` runs **inside the same API process**. Wherever you deploy the API, the sync runs with it:

| Deployment Method | What Happens |
|-------------------|-------------|
| **Docker** | `docker compose up` → API + sync start together in one container |
| **IIS** | Deploy API to IIS → sync starts as part of the API app pool |
| **Azure / cloud VM** | Same as IIS — runs in-process |

```bash
# Example: Docker deployment
docker compose up -d
# → SQL Server starts on :1433
# → InfoFin API starts on :5292 (Odoo sync starts inside)
# → Sync runs daily at 2 AM, no extra container needed
```

### Future: Extract to separate microservice

```bash
# If sync becomes too heavy, extract to its own container:
docker run infofin-odoo-sync:latest
# Same IOdooAdapter, different hosting model
```

---

## Odoo → InfoFin Schema Mapping

### How Odoo data maps to your existing tables

```
Odoo                                      InfoFin DB
─────                                     ──────────

account.account                           Category
├─ Code: "641000" Name: "Salaires" ──►    ├─ Payrolls expenses
├─ Code: "625000" Name: "Déplacements"──► ├─ Transport Costs
└─ Code: "701000" Name: "Ventes" ────►    └─ Sales Rev-Hardwares

account.move.line (journal entries)       Budget (actuals)
├─ Jan: 641000 = 45,000 FC ─────────►     Budget.ActualAmount += 45,000
├─ Feb: 625000 = 12,000 FC ─────────►     Budget.ActualAmount += 12,000
└─ Mar: 701000 = 220,000 FC ────────►     Budget.ActualAmount += 220,000

res.partner (contacts)                    Vendor
├─ "Orange RDC" ────────────────────►     Vendor.Name
└─ "Vodacom" ───────────────────────►     Vendor.Name

hr.department                             Department (map via OdooAccountMapping)
├─ "IT & Cloud" ────────────────────►     Department.Name
└─ "Finance" ───────────────────────►     Department.Name
```

### New DB Table: OdooAccountMapping

The only new table needed — links Odoo account codes to your InfoFin categories:

```sql
CREATE TABLE [dbo].[OdooAccountMapping] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [OdooAccountCode] NVARCHAR(20) NOT NULL,
    [OdooAccountName] NVARCHAR(200) NOT NULL,
    [InfoFinCategoryId] INT NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_OdooAccountMapping_Category]
        FOREIGN KEY ([InfoFinCategoryId]) REFERENCES [dbo].[Category]([Id])
);
```

Admin fills this in Master Data → Odoo Mappings tab. Once populated, the sync knows exactly where every Odoo transaction goes.

---

## Interchangeability — Swapping Odoo Instances

The integration is **instance-agnostic** by design. Only 3 values in `appsettings.json` change between environments:

```json
{
  "Odoo": {
    "Url": "...",      // ← sandbox / staging / production URL
    "Database": "...",  // ← Odoo database name
    "ApiKey": "..."     // ← user API key
  }
}
```

| Environment | URL Example |
|-------------|------------|
| **Sandbox** | `https://infoset-sandbox.odoo.com` |
| **Production** | `https://odoo.infoset.cd` |
| **Local dev** | `http://localhost:8069` |

**No code changes needed to switch.** The `OdooClient` reads config at startup. Different environments are loaded via standard ASP.NET `appsettings.{Environment}.json` files.

```
Odoo sandbox   ──► appsettings.Development.json
Odoo production ──► appsettings.Production.json
```

### Abstracted for Future ERPs

```csharp
IErpClient.cs           ← interface (contract)
OdooClient.cs           ← JSON-RPC implementation
```

If you ever switch to Sage, SAP, or another ERP:

```csharp
SageClient.cs           ← new, same IErpClient interface
SapClient.cs            ← new, same IErpClient interface
```

The controllers and services only depend on the interface. Swap implementations via DI.

---

## Can I Start Without Your Odoo Configs?

**Yes.** The Odoo JSON-RPC API is standardized across every Odoo instance:

| What's the same everywhere | What differs per instance |
|----------------------------|---------------------------|
| JSON-RPC protocol (port 8069) | Server URL |
| Model names (`account.move.line`, etc.) | Database name |
| Query/search syntax (domain filters) | API key / credentials |
| Response structures | Account code → category mapping |

I can build the `OdooClient`, `OdooSyncService`, DB mapping table, and API endpoints **right now**. When you provide the 3 config values, it's plug-and-play.

---

## How Odoo Integration Works

Odoo exposes a **JSON-RPC** (or XML-RPC) API on port 8069.

### Connection Pattern

```
InfoFin.Api ──JSON-RPC──► Odoo Server (port 8069)
                            │
                            ├─ common endpoint: authenticate()
                            └─ object endpoint: execute_kw()
                                  │
                                  ├─ account.move (journal entries)
                                  ├─ account.move.line (line items)
                                  ├─ account.account (chart of accounts)
                                  ├─ purchase.order (purchase orders)
                                  ├─ sale.order (sales orders)
                                  ├─ res.partner (contacts/vendors)
                                  └─ hr.employee (employees)
```

### Authentication

```csharp
// 1. Authenticate
/ xmlrpc / 2 / common endpoint
authenticate(db, username, password / api_key)
→ returns user_id

// 2. Query models
/ xmlrpc / 2 / object endpoint
execute_kw(db, user_id, password, model, method, args, kwargs)
```

### Example: Fetch journal entries

```csharp
execute_kw(db, uid, pass,
    "account.move.line",
    "search_read",
    // domain filter
    [[("date", ">=", "2026-01-01"), ("date", "<=", "2026-12-31")]],
    // fields to return
    { "fields": ["date", "name", "debit", "credit", "account_id", "partner_id"] }
)
```

---

## What We Need from Odoo

### For Budget Actuals (Reporting)

| Odoo Model | Fields | Maps to InfoFin |
|------------|--------|-----------------|
| `account.move.line` | date, debit, credit, account_id, partner_id, name | Actual expenses/revenues by category |
| `account.account` | code, name, account_type | Financial categories |
| `res.partner` | name, email, phone | Vendors |

### For Department Structure

| Odoo Model | Fields | Maps to InfoFin |
|------------|--------|-----------------|
| `hr.department` | name, parent_id | Department hierarchy |
| `hr.employee` | name, department_id, work_email | Employee list |

### Sync Strategy

| Data | Frequency | Notes |
|------|-----------|-------|
| Chart of accounts | On demand / weekly | Rarely changes |
| Journal entries (actuals) | Daily | Populates budget actuals |
| Vendors/partners | Weekly | Vendor master data |
| Departments | On demand | Structure mapping |

---

## Architecture Decision: Adapter Pattern

The integration follows an **adapter pattern** with separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                  InfoFin.Api                        │
│                                                     │
│  BudgetController  ←──  IOdooSyncService (contract) │
│                                                     │
│  ┌──────────────── OdooBackgroundService ────────┐  │
│  │  IHostedService (runs on timer, e.g. daily)   │  │
│  │       │                                        │  │
│  │       └──► IOdooAdapter.FetchActuals()        │  │
│  └───────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ DI
┌───────────────────────▼─────────────────────────────┐
│         InfoFin.Integration.Odoo (Adapter)           │
│                                                     │
│  IOdooAdapter  ←──  OdooAdapter (JSON-RPC)          │
│                                                     │
│  • Pure logic, no runtime                           │
│  • Can be extracted into microservice later         │
│  • Interchangeable: swap OdooAdapter → SageAdapter  │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              Odoo Server (external)                  │
│          JSON-RPC on port 8069                       │
└─────────────────────────────────────────────────────┘
```

### Why This Pattern

| Concern | Where | Can Change Independently? |
|---------|-------|--------------------------|
| **Odoo communication** | `OdooAdapter` (class library) | ✅ Swap for Sage adapter |
| **Sync schedule** | `OdooBackgroundService` (IHostedService) | ✅ Change timer, add CRON |
| **Trigger (manual)** | Sync endpoint in controller | ✅ Add `/api/admin/sync-odoo` |
| **Deployment** | Runs inside API process now | ✅ Extract to Worker Service / microservice later |

### How It Runs in Production

**Option A (Now):** `OdooBackgroundService` inside the API.

```csharp
// Runs inside the API process, on a timer
public class OdooBackgroundService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        // Sync daily at 2 AM
        while (!ct.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromHours(24), ct);
            await _odooAdapter.SyncActuals(DateTime.UtcNow.Year, DateTime.UtcNow.Month);
        }
    }
}
```

**Option B (Later):** Extract to a standalone Worker Service / microservice.

```bash
# Deploy separately, scales independently
docker run infofin-odoo-sync:latest
```

Same `IOdooAdapter` interface, different hosting model.

### New Project Structure

```
Integration/
├── InfoFin.Integration.Odoo/          ← Adapter (class library)
│   ├── IOdooAdapter.cs                ← Contract
│   ├── OdooAdapter.cs                 ← JSON-RPC implementation
│   ├── OdooOptions.cs                 ← Config class
│   └── Models/
│       ├── AccountMoveLine.cs
│       ├── AccountAccount.cs
│       └── ResPartner.cs
│
└── (future) InfoFin.Worker.Odoo/      ← Standalone Worker Service
                                        │   (extracted later)
                                        │   Same IOdooAdapter
                                        └── Same OdooAdapter
```

### DI Registration (in API Program.cs)

```csharp
// Adapter (can be used anywhere)
builder.Services.Configure<OdooOptions>(builder.Configuration.GetSection("Odoo"));
builder.Services.AddSingleton<IOdooAdapter, OdooAdapter>();

// Background sync (runs in API process)
builder.Services.AddHostedService<OdooBackgroundService>();

// Manual trigger (optional)
builder.Services.AddScoped<IOdooSyncService, OdooSyncService>();
```

### Files to Create

| # | File | Type |
|---|------|------|
| 1 | `Integration/InfoFin.Integration.Odoo/IOdooAdapter.cs` | Interface |
| 2 | `Integration/InfoFin.Integration.Odoo/OdooAdapter.cs` | JSON-RPC implementation |
| 3 | `Integration/InfoFin.Integration.Odoo/OdooOptions.cs` | Config DTO |
| 4 | `Integration/InfoFin.Integration.Odoo/Models/*.cs` | Response DTOs |
| 5 | `Integration/InfoFin.Integration.Odoo/InfoFin.Integration.Odoo.csproj` | Project |
| 6 | `Api/.../Services/OdooBackgroundService.cs` | Daily sync runner |
| 7 | `DB/.../03_odoo_mapping.sql` | Account mapping table |
| 8 | `InfoFin.sln` | Add new project |

## Status

| Question | Answer |
|----------|--------|
| Adapter pattern (later → microservice)? | ✅ Yes — `IOdooAdapter` interface + separate class library |
| Automatic daily sync? | ✅ Yes — `OdooBackgroundService` (IHostedService) |
| Manual trigger available? | ✅ Yes — sync endpoint for ad-hoc runs |
| Build without Odoo configs? | ✅ Yes — API is standard |
| Interchangeable between sandbox/prod? | ✅ Yes — 3 config values |
| Future-proof for other ERPs? | ✅ Yes — swap adapter implementations | |
