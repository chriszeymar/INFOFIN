# Phase 3: Backend Custom Logic

## Step 3.1: JWT Authentication
- [x] Add JWT Bearer authentication to `InfoFin.Api` `Program.cs`.
- [x] Create `AuthController.cs` with `/login` endpoint.
- [x] Verify password against the hashed `User.PasswordHash` field (bcrypt supported, with bootstrap plain-text fallback).
- [x] Generate JWT containing claims for `UserId`, `RoleId`, and `DepartmentId`.

## Step 3.2: Scoping (Multi-Tenancy Filtering)
- [x] Implement request scoping in `SpendRequestsController.cs` based on authenticated user context.
- [x] Update retrieval logic:
  - If Role == FPA | MD | Admin -> Return all.
  - If Role == Directeur -> Filter for requests where `DepartmentGroupId == User.DeptGroupId`.
  - If Role == Encodeur -> Filter for requests where `DepartmentId == User.DepartmentId`.

## Step 3.3: Workflow Transition Logic
- [x] Implement custom create and transition endpoints on `SpendRequestsController`.
- [x] Capture point-in-time `LockedExchangeRate` from selected currency on creation.
- [x] Validate allowed status transitions by role.
- [x] Write transition tracking to `SpendRequestHistory` and `NotificationLog`.

## Current Implementation Summary

1. `AuthController`
  - `POST /api/auth/login`
2. `SpendRequestsController`
  - `GET /api/spendrequests`
  - `GET /api/spendrequests/{id}`
  - `POST /api/spendrequests`
  - `POST /api/spendrequests/{id}/transition`

## Verification

1. `dotnet build c:\\repos\\InfoFin\\InfoFin.slnx -v minimal` passes.
2. `dotnet build c:\\repos\\InfoFin\\InfoFin.sln -v minimal` passes.