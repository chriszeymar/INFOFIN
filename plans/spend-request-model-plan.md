# Spend Request — Model Standardization & Scaffold Plan

## 1. Canonical Model (C# Backend)

### SpendRequest (`Model/InfoFin.Model/SpendRequest.Gen.cs`)

```csharp
public partial class SpendRequest
{
    public int? Id { get; set; }
    public string? ReferenceNumber { get; set; }
    public int DepartmentId { get; set; }
    public int CategoryId { get; set; }
    public int EncoderId { get; set; }           // FK → User (created by)
    public int? AssignedToUserId { get; set; }    // FK → User (assigned reviewer/approver)
    public decimal Amount { get; set; }
    public int CurrencyId { get; set; }
    public decimal LockedExchangeRate { get; set; }
    public int? VendorId { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public DateTime CreateDT { get; set; }
    public DateTime UpdateDT { get; set; }

    // Navigation properties (populated when includeNested=true)
    public Department? Department { get; set; }
    public Category? Category { get; set; }
    public User? Encoder { get; set; }            // ← created by user
    public User? AssignedToUser { get; set; }     // ← assigned user (NEW)
    public Currency? Currency { get; set; }
    public Vendor? Vendor { get; set; }
}
```

### DB Schema Change (NEW)

```sql
ALTER TABLE [dbo].[SpendRequest]
ADD [AssignedToUserId] INT NULL,
CONSTRAINT [FK_SpendRequest_AssignedToUser]
    FOREIGN KEY ([AssignedToUserId]) REFERENCES [dbo].[User]([Id]);
```

> ✅ Already added to:
> - `DB/InfoFin.DB/dbo/Tables/SpendRequest.sql` (DB project source of truth)
> - `DB/01_initial_schema.sql` (standalone migration script)

---

## 2. Canonical Model (TypeScript)

```typescript
// ── Reference / lookup entities ────────────────────────
export interface User {
  id: number
  email: string
  roleId: number
  departmentId: number | null
  isActive: boolean
  role?: Role
  department?: Department
}

export interface Role {
  id: number
  name: string       // e.g. "ANALYST", "REVIEWER", "APPROVER", "ADMIN"
}

export interface Department {
  id: number
  name: string
  departmentGroupId: number
  isActive: boolean
}

export interface Category {
  id: number
  name: string
  financialGroupId: number
  classificationId: number | null
  isActive: boolean
}

export interface Currency {
  id: number
  code: string            // e.g. "USD", "EUR", "CDF"
  exchangeRateToUSD: number
}

export interface Vendor {
  id: number
  name: string
  isActive: boolean
}

// ── Status ──────────────────────────────────────────────
export type SpendRequestStatus =
  | 'Posted'
  | 'UnderReview'
  | 'Approved'
  | 'Completed'
  | 'Declined'

// ── Core request (mirrors backend exactly) ──────────────
export interface SpendRequest {
  id: number
  referenceNumber: string
  departmentId: number
  categoryId: number
  encoderId: number
  assignedToUserId: number | null
  amount: number
  currencyId: number
  lockedExchangeRate: number
  vendorId: number | null
  description: string
  status: SpendRequestStatus
  createDT: string          // ISO 8601
  updateDT: string          // ISO 8601

  // Navigation (populated by backend includeNested=true)
  department?: Department
  category?: Category
  encoder?: User
  assignedToUser?: User | null
  currency?: Currency
  vendor?: Vendor | null
}

// ── History (separate API) ──────────────────────────────
export interface SpendRequestHistory {
  id: number
  spendRequestId: number
  actionById: number
  oldStatus: string
  newStatus: string
  comments: string | null
  createDT: string
}

// ── Attachment (separate API) ───────────────────────────
export interface SpendRequestAttachment {
  id: number
  spendRequestId: number
  fileUrl: string
  fileName: string
  uploadedByUserId: number
  createDT: string
}

// ── Create payload ──────────────────────────────────────
export interface CreateSpendRequestPayload {
  departmentId: number
  categoryId: number
  amount: number
  currencyId: number
  vendorId?: number | null
  description: string
}

// ── Transition payload ──────────────────────────────────
export interface TransitionSpendRequestPayload {
  newStatus: string
  comments?: string
}

// ── Grid row (flattened for list display) ───────────────
export interface SpendRequestGridRow {
  id: number
  referenceNumber: string
  departmentName: string
  categoryName: string
  amount: number
  currencyCode: string
  status: SpendRequestStatus
  createdByEmail: string
  assignedToEmail: string | null
  createDT: string
}
```

### Key differences from old mock model (`mock-data.ts`)

| Old (mock) | New (canonical) | Reason |
|---|---|---|
| `id: string` | `id: number` | Matches C# `int` |
| `ref` | `referenceNumber` | Matches C# property name |
| `department: string` | `departmentId` + `department?: {name}` | FK-based, name resolved via nav |
| `category: string` | `categoryId` + `category?: {name}` | FK-based |
| `vendor: string` | `vendorId` + `vendor?: {name}` | FK-based |
| `currency: 'USD'\|'FC'` | `currencyId` + `currency?: {code}` | FK-based, supports all currencies |
| `exchangeRate` | `lockedExchangeRate` | Matches C# |
| `date` | `createDT` | Matches C# |
| `requester` / `reportedBy` | `encoder` (User object) | Single source: EncoderId FK |
| `assignedTo: string` | `assignedToUser?: User\|null` | FK-based (NEW column) |
| `fcAmount` | ❌ removed | Computable: amount × exchangeRate |
| `timeline: inline[]` | `SpendRequestHistory[]` (separate API) | Separate table |
| `attachments: {name,size}[]` | `SpendRequestAttachment[]` (separate API) | Separate table |
| `status: 'under_review'` | `status: 'UnderReview'` | Matches C# constants |

---

## 3. Scaffold Process

### Step 1: Ensure DB project is up to date

The scaffold tool reads the SQL project at `DB/InfoFin.DB/InfoFin.DB.sqlproj` to discover table schemas. Before running scaffold:

```powershell
# Verify the SpendRequest table definition has AssignedToUserId
Get-Content C:\repos\InfoFin\DB\InfoFin.DB\dbo\Tables\SpendRequest.sql
```

> The `AssignedToUserId` column + FK have been added to:
> - `DB/InfoFin.DB/dbo/Tables/SpendRequest.sql` ✅
> - `DB/01_initial_schema.sql` ✅

### Step 2: Run C# scaffold

```powershell
cd C:\repos\InfoFin
.\.github\tools\apstory-scaffold.ps1 -Namespace InfoFin -Schema dbo -SqlProjectPath "DB\InfoFin.DB\InfoFin.DB.sqlproj"
```

This generates:
| Layer | Path |
|---|---|
| Models | `Model/InfoFin.Model/*.Gen.cs` |
| DAL Interfaces | `Dal/InfoFin.Dal.Interface/Gen/*.Gen.cs` |
| DAL Dapper | `Dal/InfoFin.Dal.Dapper/Gen/*.Gen.cs` |
| Domain Interfaces | `Domain/InfoFin.Domain.Interface/Gen/*.Gen.cs` |
| Domain Services | `Domain/InfoFin.Domain/Gen/*.Gen.cs` |
| DI Registration | `Common/InfoFin.Common.ServiceCollectionExtension/Gen/*.Gen.cs` |
| Stored Procedures | `DB/InfoFin.DB/dbo/Stored Procedures/zgen_*.sql` |

### Step 3: Post-scaffold patches

**3a. Remove broken `IncludeForeignKeys` signatures:**

```powershell
Get-ChildItem C:\repos\InfoFin\Domain\InfoFin.Domain.Interface\Gen -Filter *.Gen.cs | ForEach-Object { (Get-Content $_.FullName) | Where-Object { $_ -notmatch 'IncludeForeignKeys' } | Set-Content $_.FullName }
```

**3b. Delete all `*.Foreign.Gen.cs` files** (broken FK resolution methods that call non-existent `GetXxxByXxxIds` repository methods):

```powershell
Remove-Item C:\repos\InfoFin\Domain\InfoFin.Domain\Gen\*Foreign.Gen.cs
Remove-Item C:\repos\InfoFin\Domain\InfoFin.Domain.Interface\Gen\*Foreign.Gen.cs
```

**3c. Delete `*.Odoo.cs` partial classes** (scaffold now includes Odoo columns directly in `.Gen.cs`):

```powershell
Remove-Item C:\repos\InfoFin\Model\InfoFin.Model\Category.Odoo.cs
Remove-Item C:\repos\InfoFin\Model\InfoFin.Model\Department.Odoo.cs
```

**3d. Fix `OdooJournalLine` namespace ambiguity** — qualify with full namespace in `OdooController.cs`:

```csharp
// Change: List<OdooJournalLine>
// To:     List<InfoFin.Integration.Odoo.OdooJournalLine>
```

**3e. Fix `GetSpendRequestByIds` call sites** — scaffold adds `assignedToUserId` and `isActive` params:

```csharp
// Old: GetSpendRequestByIds(null, null, null, null, null, true)
// New: GetSpendRequestByIds(null, null, null, null, null, null, null)
```
Affected files: `SpendRequestsController.cs`, `ReportsController.cs`

**3f. Fix nullable `DateTime?` in `ReportsController.cs`:**

```csharp
// Old: (x.UpdateDT - x.CreateDT).TotalHours
// New: ((x.UpdateDT ?? x.CreateDT ?? DateTime.MinValue) - (x.CreateDT ?? DateTime.MinValue)).TotalHours
```

### Step 4: Validate build

```powershell
dotnet build C:\repos\InfoFin\InfoFin.slnx -v minimal
```

### Step 5: Update SpendRequestsController

After scaffold, manually update `Api/InfoFin.Api/Controllers/SpendRequestsController.cs`:
- Set `AssignedToUserId` on create (default to null or a reviewer based on workflow)
- Include `AssignedToUserId` in scope/filter logic if needed
- Ensure the `Get`/`GetById` responses include `encoder` and `assignedToUser` navigation

### Step 6: Run API + TypeScript codegen

```powershell
# Start the API first, then:
cd C:\repos\InfoFin
.\.github\tools\apstory-api-gen.ps1
```

This generates TypeScript types + API client from the Swagger spec into:
- `InfoFin.UI/src/codegen-v1.ts`
- `InfoFin.UI/src/app/` (generated service modules)

---

## 4. Seed Data Script

Create `DB/02_seed_spend_requests.sql` with sample data mirroring the old mock data but using real FK references to departments, categories, currencies, vendors, and users. This ensures the UI has displayable data after migration.

---

## 5. UI Implementation Order

After scaffold + seed data:

1. **Create** `src/types/spend-request.ts` — canonical TS types (above)
2. **Create** `src/api/spendRequestService.ts` — API client wrapping `httpClient`
3. **Update** `SpendRequestsList.tsx` — fetch real data, use `SpendRequestGridRow`
4. **Update** `request-form.tsx` — load departments/categories/vendors/currencies from API, submit real POST
5. **Update** `SpendRequestDetail.tsx` — fetch by ID, load history + attachments from separate endpoints
6. **Update** `request-slideover.tsx` — receive canonical model
7. **Clean up** `mock-data.ts` — remove request-specific mock data
