# Phase 1: Database Setup & Tooling

## Step 1.1: Docker Compose Setup
- [x] Create `docker-compose.yml` in the root `C:\repos\InfoFin`.
- [x] Define the `sqlserver` service using `mcr.microsoft.com/mssql/server:2022-latest`.
- [x] Set `SA_PASSWORD` and ports (`1433`).
- [x] Map a data volume so state persists.
- [x] Start the container using `docker compose up -d`.

## Step 1.2: DbUp Migration Builder
- [x] Create a .NET Console app `InfoFin.DB.DbUp`.
- [x] Add `dbup-sqlserver` NuGet package.
- [x] Move `01_initial_schema.sql` into a `Scripts` folder in the DbUp project.
- [x] Create `Program.cs` to execute embedded SQL scripts against `localhost:1433`.

## Step 1.3: Master Data Seeding
- [x] Create `02_seed_data.sql` with `INSERT` statements for:
  - Roles (Encodeur, Directeur BU/SU, Validation FPA, Val MD, Administrateur).
  - BucketTypes (BU, SU).
  - DepartmentGroups and Departments (Cirrus, Genisys, FPA).
  - FinancialGroups, Classifications, and Categories (From our exact Excel mappings).
  - Test Users with hashed passwords ('admin@infofin.com', etc.).
- [x] Compile DbUp and run it to create the database (`InfoFinDb`) and all tables.