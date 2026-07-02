# InfoFin Database Schema Design

This document details the Database-First SQL schema devised for the InfoFin Expense Management System. This schema relies on strict relational integrity and is fully optimized so that the `apstory-scaffold` tool can auto-generate cleanly mapped N-Tier .NET components (Domain, DAL, Service, API Layers) without boilerplate.

*Note: This schema was refined to include enterprise constraints like point-in-time exchange locks, intermediate department groups, and multi-file attachment management.*

---

## 1. Security & Access Control
These tables govern system access and role-based privilege checks for the spend workflow.

*   `Role`: Defines the static system roles (`Encodeur`, `Directeur BU/SU`, `Validation FPA`, `Val MD`, `Administrateur`). Used to control UI visibility and API endpoint authorization.
*   `User`: The core identity table storing employee credentials (`Email`, `PasswordHash`), active status, and linking the user to precisely one `Role`.

---

## 2. Organization & Department Entities
These tables recreate the Excel reporting hierarchy.

*   `BucketType`: A simple lookup delineating `BU` (Business Unit) from `SU` (Support Unit). Crucial for filtering aggregate dashboards.
*   `Department`: The actual functional units (e.g., `CIRRUS - DIGITAL`, `FPA`, `ADMIN & ACCOUNTING`). Every department is strictly linked to a single `BucketType`.

---

## 3. Financial Master Data (The 3-Tier Hierarchy)
This structure mirrors the exact layout of the financial Excel grids, allowing dynamic CRUD management by administrators instead of hard-coded structures.

*   `FinancialGroup`: The highest level of categorization (`Revenus`, `COS`, `Fixed Costs`, `Variables Costs`).
*   `Classification`: The secondary grouping specifically used for OPEX (`Admin & Finances`, `Technical & Operations`, `Marketing & Sales`).
*   `Category`: The actual line item an expense is mapped to (e.g., `Transport Costs`, `Sales Rev-Hardwares`). 
    *   *Mapping Note:* Links upwards to `FinancialGroup` and conditionally to `Classification` (since 'Revenus' and 'COS' do not utilize secondary classifications).
*   `Currency`: System currencies (`USD`, `FC`) alongside their `ExchangeRateToUSD`. This enables the backend/frontend to instantly normalize Congolese Francs into USD for aggregated budget comparisons.

---

## 4. Budget Tracking Engine
*   `Budget`: Stores the forecasted budget allocations. 
    *   It anchors to a `Department` and a `Category`.
    *   It dictates the `Year` and conditionally the `Month` (allowing tracking of both Annual goals and Monthly quotas).
    *   *Constraint:* Enforces `UNIQUE(DepartmentId, CategoryId, Year, Month)` so the database physically blocks duplicate forecasts from being entered for the same period.

---

## 5. Transaction Engine (Spend Requests)
The operational core of the application where day-to-day work happens.

*   `SpendRequest`: The primary transaction object created by an Encoder.
    *   *Fields:* Tracks `Amount`, `CurrencyId`, `Vendor`, `Description`, and the `AttachmentUrl` (URI pointing to blob storage for receipts).
    *   *Tracking:* Links directly to the `EncoderId` (User), `DepartmentId`, and `CategoryId`.
    *   *State:* The `Status` column manages the workflow (`PENDING_DIR`, `PENDING_FPA`, `PENDING_MD`, `APPROVED`, `DECLINED`). This single field drives the entire UI dashboard task lists.
*   `SpendRequestHistory`: An immutable audit trail table.
    *   Every time a request changes `Status`, an entry is dropped here detailing *who* (`ActionById`) did it, what the status changed from/to, and any required `Comments` (mandatory during Rejections). 
    *   This table allows the frontend to plot a "Request Timeline" (e.g., "Submitted Monday -> Approved by FPA Tuesday -> Declined by MD Wednesday with comment: 'Over allocated budget'").

## 6. Advanced Tracking & Audit (Refinements)
Based on operational requirements, the following structures have been added:
*   **DepartmentGroup:** Connects BucketType to Department (e.g. BU -> Banking & Digital -> CIRRUS) ensuring reporting aggregate views work out of the box.
*   **LockedExchangeRate:** Captured on SpendRequest at the time of submission so a fluctuation in conversion does not retroactively change a historical budget impact.
*   **SpendRequestAttachment:** Isolated table handling an unbounded 1-to-Many relationship for invoices/receipts per request.
*   **BudgetAdjustment:** Audit log for mid-year financial reallocations.
*   **NotificationLog:** Observability logic tracing exact email/status triggers fired to users.

## 7. Entity-Relationship Diagram (ERD)

`mermaid
erDiagram
    BucketType ||--o{ DepartmentGroup : "contains"
    DepartmentGroup ||--o{ Department : "contains"
    
    Role ||--o{ User : "assigns"
    Department ||--o{ User : "belongs to"

    FinancialGroup ||--o{ Category : "groups"
    Classification |o--o{ Category : "classifies"
    
    Category ||--o{ Budget : "allocates"
    Department ||--o{ Budget : "owns"
    Currency ||--o{ Budget : "denominated in"
    Budget ||--o{ BudgetAdjustment : "adjusted by"
    User ||--o{ BudgetAdjustment : "authorizes"

    User ||--o{ SpendRequest : "encodes"
    Department ||--o{ SpendRequest : "incurs"
    Category ||--o{ SpendRequest : "categorized by"
    Currency ||--o{ SpendRequest : "paid in"
    Vendor |o--o{ SpendRequest : "supplied by"

    SpendRequest ||--o{ SpendRequestAttachment : "contains files"
    User ||--o{ SpendRequestAttachment : "uploads"

    SpendRequest ||--o{ SpendRequestHistory : "logs workflow"
    User ||--o{ SpendRequestHistory : "actions"

    SpendRequest ||--o{ NotificationLog : "triggers"
    User ||--o{ NotificationLog : "receives"
`

## 8. Detailed Schema (SSMS View)

Below is the SSMS Table Designer perspective detailing the precise column types, nullability, and keys for the core structures:

### [dbo].[SpendRequest]
| Column Name | Data Type | Allow Nulls | Keys / Notes |
| :--- | :--- | :--- | :--- |
| **Id** | INT | ? No | **PK**, IDENTITY(1,1) |
| ReferenceNumber | NVARCHAR(50) | ? No | **UNIQUE** |
| DepartmentId | INT | ? No | **FK** -> Department(Id) |
| CategoryId | INT | ? No | **FK** -> Category(Id) |
| EncoderId | INT | ? No | **FK** -> User(Id) |
| Amount | DECIMAL(18,2)| ? No | |
| CurrencyId | INT | ? No | **FK** -> Currency(Id) |
| LockedExchangeRate | DECIMAL(18,6)| ? No | Point-in-time value |
| VendorId | INT | ?? Yes | **FK** -> Vendor(Id) |
| Description | NVARCHAR(MAX)| ? No | |
| Status | NVARCHAR(50) | ? No | 'PENDING_DIR', 'APPROVED', etc. |
| CreateDT | DATETIME | ? No | Default: GETDATE() |
| UpdateDT | DATETIME | ? No | Default: GETDATE() |

### [dbo].[Budget]
| Column Name | Data Type | Allow Nulls | Keys / Notes |
| :--- | :--- | :--- | :--- |
| **Id** | INT | ? No | **PK**, IDENTITY(1,1) |
| DepartmentId | INT | ? No | **FK, UQ1** |
| CategoryId | INT | ? No | **FK, UQ1** |
| Year | INT | ? No | **UQ1** |
| Month | INT | ?? Yes | **UQ1** (Null = Annual) |
| ForecastAmount | DECIMAL(18,2)| ? No | |
| CurrencyId | INT | ? No | **FK** -> Currency(Id) |
| CreateDT | DATETIME | ? No | Default: GETDATE() |
| UpdateDT | DATETIME | ? No | Default: GETDATE() |

### [dbo].[Category] (Master Data)
| Column Name | Data Type | Allow Nulls | Keys / Notes |
| :--- | :--- | :--- | :--- |
| **Id** | INT | ? No | **PK**, IDENTITY(1,1) |
| Name | NVARCHAR(200)| ? No | e.g., 'Transport Costs' |
| FinancialGroupId | INT | ? No | **FK** -> FinancialGroup(Id) |
| ClassificationId | INT | ?? Yes | **FK** -> Classification(Id) |
| IsActive | BIT | ? No | Default: 1 (Soft Delete) |

### [dbo].[User]
| Column Name | Data Type | Allow Nulls | Keys / Notes |
| :--- | :--- | :--- | :--- |
| **Id** | INT | ? No | **PK**, IDENTITY(1,1) |
| Email | NVARCHAR(100)| ? No | **UNIQUE** |
| PasswordHash | NVARCHAR(MAX)| ? No | |
| RoleId | INT | ? No | **FK** -> Role(Id) |
| DepartmentId | INT | ?? Yes | **FK** -> Department(Id) |
| IsActive | BIT | ? No | Default: 1 (Soft Delete) |
| CreateDT | DATETIME | ? No | Default: GETDATE() |
| UpdateDT | DATETIME | ? No | Default: GETDATE() |

