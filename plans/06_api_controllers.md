# Phase 6: API Controller Expansion

This phase defines the full API controller surface now that DAL/Domain scaffolding and Phase 3 custom logic are in place.

## Step 6.1: Budget and Planning Controllers

- [x] `BudgetsController`
  - `GET /api/budgets` (filter by department/category/year/month)
  - `GET /api/budgets/{id}`
  - `POST /api/budgets`
  - `PUT /api/budgets/{id}`
- [x] `BudgetAdjustmentsController`
  - `POST /api/budget-adjustments`
  - `GET /api/budget-adjustments`

## Step 6.2: Master Data Controllers

- [x] `CategoriesController`
  - `GET /api/categories`
  - `GET /api/categories/{id}`
- [x] `DepartmentsController`
  - `GET /api/departments`
  - `GET /api/department-groups`
- [x] `VendorsController`
  - `GET /api/vendors`
  - `POST /api/vendors`
  - `PUT /api/vendors/{id}`

## Step 6.3: Operational Controllers

- [x] `SpendRequestAttachmentsController`
  - `GET /api/spendrequests/{id}/attachments`
  - `POST /api/spendrequests/{id}/attachments`
  - `DELETE /api/spendrequests/{id}/attachments/{attachmentId}`
- [x] `NotificationsController`
  - `GET /api/notifications`
  - `GET /api/notifications/{id}`

## Step 6.4: Reporting and Admin Controllers

- [x] `ReportsController`
  - `GET /api/reports/approval-cycle-time`
  - `GET /api/reports/budget-vs-actual`
  - `GET /api/reports/spend-by-bu-su`
- [x] `AdminUsersController`
  - `GET /api/admin/users`
  - `POST /api/admin/users`
  - `PUT /api/admin/users/{id}`

## Authorization Policy Matrix

- Encoder: create/view own department requests, view master data.
- Directeur: view department group requests, transition PendingDirector decisions.
- FPA: global view, transition PendingFPA decisions.
- MD: global view, transition PendingMD decisions.
- Admin: full access, user/role management, master-data writes.

## DI and Wiring Checklist

- [x] Keep generated registrations through `AddGeneratedRepositories(connectionString)`.
- [x] Keep generated registrations through `AddGeneratedServices()`.
- [x] Add only custom service registrations when introducing non-generated business services.
- [x] Add authorization policies and map them to controller attributes.

## Exit Criteria

- [x] All listed controllers compile and are discoverable in OpenAPI.
- [x] All controller endpoints have role-based authorization attributes.
- [x] Controller smoke tests pass (happy path + unauthorized path).

Smoke test notes:
- Endpoint discovery verified through `http://localhost:5099/swagger/v1/swagger.json`.
- Unauthorized path behavior validated on protected endpoints.
