# Phase 2: Backend Scaffolding

## Step 2.1: Initialize N-Tier Solution
- [x] Create `InfoFin.sln`.
- [x] Create class libraries: `InfoFin.Model`, `InfoFin.Domain`, `InfoFin.Dal`, `InfoFin.Service`, `InfoFin.Common`.
- [x] Create ASP.NET Core Web API: `InfoFin.Api`.
- [x] Setup Project References (API -> Service -> Dal/Domain/Model).

## Step 2.2: Apstory Scaffold Configuration
- [x] Copy `apstory-scaffold.ps1` from a known reference (e.g., MyHomeClubV2) into `.github/tools`.
- [x] Add Dapper, Microsoft.Data.SqlClient, and required Apstory NuGet packages to the `Dal` and `Domain` projects.
- [x] Configure the `appsettings.json` in `Api` to point to the Docker SQL Server instance.

## Step 2.3: Execute Code Generation
- [x] Run `apstory-scaffold.ps1 -regen dbo -namespace InfoFin` targeting the `InfoFinDb`.
- [x] Wait for tool to auto-generate Models, Dapper execution methods (DAL), Services, and Controllers.
- [x] Build the solution to verify it compiles with zero errors.
- [x] Run the API and verify endpoint discovery via `http://localhost:5099/swagger/v1/swagger.json`.