# INFOFIN

Expense Management & Budget Tracking System — INFOSET Group

## Stack

- **Database:** SQL Server 2022 (Docker)
- **Backend:** .NET 10 ASP.NET Core Web API (N-Tier)
- **Frontend:** React 19 + Vite + TypeScript + Tailwind v4
- **Auth:** JWT Bearer

## Quick Start

```powershell
# Start SQL Server
docker compose up -d

# Run migrations (first time)
dotnet run --project DB/InfoFin.DB.DbUp

# Start API
cd Api/InfoFin.Api
$env:ASPNETCORE_ENVIRONMENT='Development'
dotnet run --urls http://localhost:5292

# Start Frontend
cd InfoFin.UI
npm install
npm run dev -- --host 127.0.0.1
```

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@infoset.cd | admin | Administrateur |
| analyst.cirrus@infoset.cd | pass | Financial Analyst |
| reviewer@infoset.cd | pass | FPA Reviewer |
| approver@infoset.cd | pass | FPA Approver |
