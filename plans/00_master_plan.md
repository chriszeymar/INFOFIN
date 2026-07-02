# InfoFin Master Execution Plan

This directory contains the step-by-step execution plans to build out the InfoFin MVP. 
The plans are broken into small, precise chunks. You can simply command the agent to "execute Phase X, Step Y", or "execute the next step" to proceed sequentially.

## 🚀 Execution Order

1. **Phase 1: Database Setup & Tooling** (`01_database_setup.md`)
   - Setup Docker Compose (SQL Server)
   - Setup DbUp Console App for migrations
   - Run the initial schema & master data seed
   - Status: Completed

2. **Phase 2: Backend Scaffolding** (`02_backend_scaffold.md`)
   - Initialize the .NET N-Tier solution (`Api`, `Service`, `Domain`, `Dal`, `Model`)
   - Copy and configure the `apstory-scaffold.ps1` tool
   - Execute the code generator against the live Database
   - Status: Completed

3. **Phase 3: Backend Custom Logic** (`03_backend_logic.md`)
   - Implement JWT Authentication Controller
   - Implement Role-based Data Scoping (FPA vs Encoder)
   - Implement workflow transition logic (Approval/Decline tracking)
   - Status: Completed

4. **Phase 4: Frontend Scaffolding** (`04_frontend_scaffold.md`)
   - Scaffold React/Vite/Next.js UI app with Tailwind CSS
   - Configure `apstory-api-gen.ps1`
   - Generate TypeScript API Clients from Swagger
   - Status: In progress (Apstory Swagger parser compatibility blocker)

5. **Phase 5: Frontend UI Shell** (`05_frontend_shell.md`)
   - Implement React Auth Context
   - Build App Shell (Sidebar, Header)
   - Stub out empty UI Views to be later designed in Figma/v0
   - Status: Completed

6. **Phase 6: API Controller Expansion** (`06_api_controllers.md`)
   - Implement remaining business and admin controllers over generated services
   - Lock authorization boundaries per role
   - Stabilize endpoint contracts for frontend integration
   - Status: Completed

7. **Phase 7: v0 UI Integration** (`07_v0_ui_integration.md`)
   - Translate exported Next.js components to Vite + React Router.
   - Configure Tailwind v4 PostCSS and aliases.
   - Inject real JWT authentication into v0 `useSession` mock.
   - Resolve all Recharts and Next.js specific TypeScript errors.
   - Status: Not started

## Backend API Controller Inventory (Post-Scaffold)

The lower layers (DAL + Domain + generated services) are in place. The API layer should now expose controllers in this order.

### Already implemented

1. `AuthController`
   - `POST /api/auth/login`
   - JWT token creation with role and department claims.
2. `SpendRequestsController`
   - `GET /api/spendrequests`
   - `GET /api/spendrequests/{id}`
   - `POST /api/spendrequests`
   - `POST /api/spendrequests/{id}/transition`
   - Role/department scoping and workflow transition enforcement.

### Controllers to implement next

1. `BudgetsController`
   - Budget CRUD, year/month snapshots, and remaining budget queries.
2. `BudgetAdjustmentsController`
   - Increase/decrease budget with audit trail.
3. `CategoriesController`
   - Read-only for Encoder/Director, admin write operations.
4. `DepartmentsController`
   - Department and DepartmentGroup lookup endpoints for scoping and filters.
5. `VendorsController`
   - Vendor CRUD + active/inactive filtering.
6. `SpendRequestAttachmentsController`
   - Upload/list/delete attachment metadata.
7. `NotificationsController`
   - Read notification logs and delivery status.
8. `ReportsController`
   - Aggregated KPI views (planned vs actual, approval cycle times, per BU/SU).
9. `AdminUsersController`
   - User/role assignment and activation/deactivation.

## DI and Composition Root Status

Dependency Injection is implemented in API startup:

1. JWT auth and authorization are registered in `Program.cs`.
2. Generated repositories are registered via `AddGeneratedRepositories(connectionString)`.
3. Generated domain services are registered via `AddGeneratedServices()`.

No missing manual registration was found for current controllers.

## Visual Studio Entry Point

Use `InfoFin.sln` as the primary Visual Studio solution entry point.

1. Includes API, Common, DAL, Domain, Model, Service, and DbUp projects.
2. Builds successfully with `dotnet build .\\InfoFin.sln -v minimal`.
