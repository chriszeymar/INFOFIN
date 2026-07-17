# Odoo Sync — Full Visibility Plan (UI Mastery Edition)

> **Goal**: Transform the Odoo Sync wizard from a black-box summary into a transparent, drillable audit trail showing exactly what was synced, entity by entity.

> **Date**: 2026-07-13  
> **Branch**: `main`

---

## Current State Assessment

### What Works
- Health check shows Odoo connectivity (green/red dot)
- Sync runs all 4 steps correctly on the backend
- Aggregate counts are returned and displayed

### What's Broken / Missing

| # | Issue | Impact |
|---|-------|--------|
| 1 | **Step progression is simulated** — `setInterval` advances steps every 2s regardless of actual server progress | Users see "done" steps while sync is still on step 1; misleading and erodes trust |
| 2 | **No entity-level visibility** — only 5 aggregate numbers returned (`companies`, `categoriesCreated`, `categoriesUpdated`, `journalLines`, `actualsRows`) | Can't answer: "Which companies were mapped?", "Which accounts became categories?", "Did any mapping fail?" |
| 3 | **No diff between created vs updated** — categories lump `created` and `updated` but departments don't distinguish at all | Can't tell if a sync was a no-op or made material changes |
| 4 | **No sync history** — each sync overwrites the previous result in memory, nothing persisted | Can't compare runs, can't audit what happened 3 days ago |
| 5 | **Flat, unscannable results** — 5 rows in a `<Card>` with text + badge, no grouping, no hierarchy | Hard to parse at a glance which steps did heavy lifting |
| 6 | **No per-company/per-period breakdown** — journal lines and actuals are single integers | A sync of 10,000 lines from 3 companies looks identical whether balanced or skewed |
| 7 | **No warnings or partial failures surfaced** — if Odoo returns bad JSON for some entities, they're silently skipped | Sync says "success" but data is incomplete |

---

## Design Principles

| Principle | What it means |
|-----------|--------------|
| **Progressive disclosure** | Summary at a glance → expand for detail → click to drill deeper |
| **Real data only** | Never simulate, never fake. Show actual server state at all times |
| **Scannable in 3 seconds** | Color-coded badges, iconography, compact but information-dense layout |
| **Actionable** | If something looks off, the UI tells you exactly which entity and why |
| **Auditable** | Every sync run is logged with a unique ID; past runs are browsable |

---

## Target UX (Wireframe)

```
┌─────────────────────────────────────────────────────────────┐
│  ● Odoo Connected    Last sync: Jul 13, 2026 09:41 UTC     │
│  [Year: 2026 ▼]                        [🔄 Sync Now] [📋 History] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ SYNC IN PROGRESS ──────────────────────────────────┐   │
│  │  ████████████░░░░░░░░░  62%                         │   │
│  │                                                     │   │
│  │  ✅ Step 1: Companies → Departments  (3 mapped)     │   │
│  │  ✅ Step 2: Accounts → Categories   (45 new, 12 upd)│   │
│  │  ⏳ Step 3: Journal Lines           4,210 / 8,432   │   │
│  │  ○ Step 4: Aggregate to Actuals                    │   │
│  │  ○ Step 5: Budget Forecasts         307 lines       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ SYNC COMPLETE · Jul 13, 2026 09:42 ───────────────┐   │
│  │  Run #42 · 2026 full sync · 8.2s duration           │   │
│  │                                                     │   │
│  │  ▼ 🏢  Companies → Departments                 3    │   │
│  │  │  GENISYS            → GENISYS       mapped      │   │
│  │  │  INFOSET SARL       → INFOSET SARL  mapped      │   │
│  │  │  AGMUX SA           → AGMUX SA      mapped      │   │
│  │                                                     │   │
│  │  ▼ 📁  Accounts → Categories         45 new  12 upd│   │
│  │  │  611000 Achats Marchandises   → COS        new  │   │
│  │  │  613000 Services Extérieurs   → Var OPEX   new  │   │
│  │  │  ... (show 5 of 57, [Show all 57 →])           │   │
│  │                                                     │   │
│  │  ▼ 📄  Journal Lines              8,432 imported    │   │
│  │  │  By company:  INFOSET 3.2K · GENISYS 2.8K · AGMUX 2.4K  │
│  │  │  By month:    Jan 680 · Feb 710 · Mar 695 · ... │   │
│  │  │  ⚠ 3 lines skipped (unmapped company id=99)     │   │
│  │                                                     │   │
│  │  ▼ 📊  Actuals Aggregated           142 rows        │   │
│  │  │  98 inserted · 44 updated · 0 deleted            │   │
│  │  │  By dept: INFOSET 52 · GENISYS 48 · AGMUX 42    │   │
│  │                                                     │   │
│  │  ▼ 🎯  Budget Forecasts Synced      105 categories  │   │
│  │  │  307 Odoo budget lines → 118 Mapped Budget rows  │   │
│  │  │  By dept: INFOSET 52 · GENISYS 38 · AGMUX 28    │   │
│  │  │  Years: 2023, 2024, 2025, 2026                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Backend — Enriched Sync Result

**File**: `Api/InfoFin.Api/Controllers/OdooController.cs`

Replace the flat `SyncResult` with structured detail objects.

#### New response model (`OdooController.cs` — inner classes or new file `Contracts/OdooSyncResult.cs`)

```csharp
public sealed class SyncResult
{
    public SyncRunInfo Run { get; set; } = new();
    public CompanySyncDetail Companies { get; set; } = new();
    public CategorySyncDetail Categories { get; set; } = new();
    public JournalSyncDetail Journals { get; set; } = new();
    public ActualsSyncDetail Actuals { get; set; } = new();
    public ForecastSyncDetail Forecasts { get; set; } = new();  // NEW: Step 5
    public List<SyncWarning> Warnings { get; set; } = new();
}

public sealed class SyncRunInfo
{
    public string RunId { get; set; } = "";
    public DateTime StartedAt { get; set; }
    public DateTime CompletedAt { get; set; }
    public double DurationMs { get; set; }
    public int Year { get; set; }
    public bool IsFullSync { get; set; }
}

public sealed class CompanySyncDetail
{
    public int Total { get; set; }
    public int Created { get; set; }       // new departments created
    public int Mapped { get; set; }         // matched existing by Odoo ID
    public int MappedByName { get; set; }   // matched existing by name
    public List<CompanyMappingItem> Items { get; set; } = new();
}

public sealed class CompanyMappingItem
{
    public int OdooCompanyId { get; set; }
    public string OdooName { get; set; } = "";
    public string? DepartmentName { get; set; }
    public string Action { get; set; } = ""; // "created", "mapped-by-id", "mapped-by-name"
}

public sealed class CategorySyncDetail
{
    public int Created { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }        // non-P&L accounts filtered out
    public List<CategoryMappingItem> Items { get; set; } = new();
}

public sealed class CategoryMappingItem
{
    public int OdooAccountId { get; set; }
    public string OdooCode { get; set; } = "";
    public string OdooName { get; set; } = "";
    public string OdooType { get; set; } = "";
    public string? CategoryName { get; set; }
    public string? FinancialGroup { get; set; }
    public string Action { get; set; } = ""; // "created", "updated"
    public int? CompanyId { get; set; }
}

public sealed class JournalSyncDetail
{
    public int Total { get; set; }
    public int Inserted { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }
    public List<JournalCompanyBreakdown> ByCompany { get; set; } = new();
    public List<JournalMonthBreakdown> ByMonth { get; set; } = new();
}

public sealed class JournalCompanyBreakdown
{
    public int OdooCompanyId { get; set; }
    public string CompanyName { get; set; } = "";
    public int Count { get; set; }
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
}

public sealed class JournalMonthBreakdown
{
    public int Month { get; set; }
    public int Count { get; set; }
}

public sealed class ActualsSyncDetail
{
    public int TotalRows { get; set; }
    public int Inserted { get; set; }
    public int Updated { get; set; }
    public List<ActualsDeptBreakdown> ByDepartment { get; set; } = new();
}

public sealed class ActualsDeptBreakdown
{
    public string DepartmentName { get; set; } = "";
    public int Rows { get; set; }
    public decimal TotalAmount { get; set; }
}

public sealed class SyncWarning
{
    public string Step { get; set; } = "";
    public string Message { get; set; } = "";
    public string? EntityId { get; set; }
}

public sealed class ForecastSyncDetail
{
    public int TotalOdooLines { get; set; }       // budget lines from Odoo
    public int MappedBudgetRows { get; set; }      // Budget rows created/updated
    public int Skipped { get; set; }               // lines with missing mappings
    public int NoDepartment { get; set; }          // analytic account → no department
    public int NoCategory { get; set; }            // budget post → no category
    public List<int> Years { get; set; } = new();  // years synced
    public List<ForecastDeptBreakdown> ByDepartment { get; set; } = new();
}

public sealed class ForecastDeptBreakdown
{
    public string DepartmentName { get; set; } = "";
    public int BudgetRows { get; set; }
    public decimal TotalForecast { get; set; }
}
```

#### Controller changes

| # | Change | Why |
|---|--------|-----|
| 1 | Populate `SyncResult.Run` with run metadata (GUID, timestamps, duration) | Audit trail |
| 2 | In `SyncCompanies`: track per-company action (`created` / `mapped-by-id` / `mapped-by-name`) and populate `CompanyMappingItem` list | Entity visibility |
| 3 | In `UpsertCategory`: populate `CategoryMappingItem` list with Odoo code, name, type, financial group assigned | Know which accounts became which categories |
| 4 | In `StoreJournalLines`: track inserted vs updated counts (can't easily with MERGE; switch to per-row SELECT-then-INSERT/UPDATE or use OUTPUT clause) | Know if data is new or refresh |
| 5 | In `StoreJournalLines`: compute `ByCompany` and `ByMonth` breakdowns from the fetched lines | Distribution visibility |
| 6 | In `AggregateToActuals`: capture inserted vs updated via MERGE OUTPUT or post-query | Know if actuals are new |
| 7 | Add warning collection: unmapped company IDs, unmapped account IDs, JSON parse skips | Surface partial failures |
| 8 | When journal line company doesn't match any department, add a `SyncWarning` instead of silently dropping | Data integrity |
| 9 | When journal line account doesn't match any category, add a `SyncWarning` | Data integrity |
| 10 | Track skipped non-P&L accounts count | User knows filtering happened |
| 11 | **NEW**: Populate `ForecastSyncDetail` during Step 5 budget sync | Entity visibility for forecast sync |
| 12 | **NEW**: Parse account name suffixes (`Opex Fix`/`Opex Variable`/`COS`) to assign correct `FinancialGroupId` | Fixed vs Variable OPEX classification |

---

### Phase 2: Backend — Real Step Progression

**Goal**: Replace fake frontend timer with actual server-driven step reporting.

**Approach**: Sync runs as a cancellable background operation. A polling endpoint reports live progress.

#### New endpoint: `GET /api/odoo/sync/progress`

| Field | Type | Description |
|-------|------|-------------|
| `runId` | `string?` | Active run ID, null if idle |
| `isRunning` | `bool` | Whether a sync is in progress |
| `currentStep` | `int` | 0-3 (companies, categories, journals, actuals) |
| `stepLabel` | `string` | Human-readable step name |
| `stepProgress` | `int?` | 0-100 within current step (e.g., "processing item 420/8432") |
| `stepDetail` | `string?` | e.g., "Importing journal lines… 4,210 of 8,432" |
| `errors` | `string[]?` | Any errors so far |

#### Implementation approach

```csharp
// In-memory progress tracker (scoped to app lifetime; simple for single-instance)
public static class SyncProgressTracker
{
    public static string? ActiveRunId;
    public static int CurrentStep;
    public static string? CurrentDetail;
    public static bool IsRunning;
    public static List<string> LiveErrors = new();
}
```

The `Sync()` method updates `SyncProgressTracker` between steps and within the journal line loop. The frontend polls `GET /api/odoo/sync/progress` every 500ms during a sync.

| # | Backend Change | File |
|---|---------------|------|
| 1 | Add `SyncProgressTracker` static class | `OdooController.cs` |
| 2 | Add `[HttpGet("sync/progress")]` endpoint | `OdooController.cs` |
| 3 | Update tracker at each step boundary | `OdooController.cs` → `Sync()` |
| 4 | Update tracker within `StoreJournalLines` loop (every N items) | `OdooController.cs` |

---

### Phase 3: Frontend — Redesigned Sync Wizard

**File**: `InfoFin.UI/src/components/master-data/OdooSyncWizard.tsx`

#### 3a: New Type Definitions

```typescript
interface SyncRunInfo {
  runId: string
  startedAt: string
  completedAt: string
  durationMs: number
  year: number
  isFullSync: boolean
}

interface CompanyMappingItem {
  odooCompanyId: number
  odooName: string
  departmentName: string | null
  action: 'created' | 'mapped-by-id' | 'mapped-by-name'
}

interface CategoryMappingItem {
  odooAccountId: number
  odooCode: string
  odooName: string
  odooType: string
  categoryName: string | null
  financialGroup: string | null
  action: 'created' | 'updated'
  companyId: number | null
}

interface JournalCompanyBreakdown {
  odooCompanyId: number
  companyName: string
  count: number
  totalDebit: number
  totalCredit: number
}

interface JournalMonthBreakdown {
  month: number
  count: number
}

interface ActualsDeptBreakdown {
  departmentName: string
  rows: number
  totalAmount: number
}

interface SyncWarning {
  step: string
  message: string
  entityId: string | null
}

interface SyncResult {
  run: SyncRunInfo
  companies: CompanySyncDetail
  categories: CategorySyncDetail
  journals: JournalSyncDetail
  actuals: ActualsSyncDetail
  warnings: SyncWarning[]
}

interface SyncProgress {
  runId: string | null
  isRunning: boolean
  currentStep: number
  stepLabel: string
  stepProgress: number | null
  stepDetail: string | null
  errors: string[] | null
}
```

#### 3b: Component Structure

The redesigned wizard has four sub-components living within the same file or extracted:

1. **`SyncCommandBar`** — top strip with health, last sync, year selector, action buttons
2. **`LiveProgressPanel`** — shown during active sync with real polling-driven progress
3. **`SyncResultsDashboard`** — post-sync expandable detail cards
4. **`SyncHistoryDrawer`** — slide-out panel listing past sync runs

#### 3c: Component Changes (from current → target)

| # | Change | Why |
|---|--------|-----|
| 1 | **Remove `stepTimer` simulation** — replace with `useEffect` polling `GET /api/odoo/sync/progress` every 500ms while `syncing=true` | Real progress, no fakery |
| 2 | **Add year selector** `<Select>` for choosing which year to sync (passed as `?year=` to sync endpoint) | Users can sync past years |
| 3 | **Add "Sync History" button** → opens a slide-over with past sync runs (fetched from new `GET /api/odoo/sync/history` endpoint) | Audit trail |
| 4 | **Redesign progress panel** — each step shows: icon (checkmark/spinner/circle), label, detail text (e.g., "3 companies mapped"), and a thin progress bar for the journal line import step | Real-time at-a-glance status |
| 5 | **Redesign results card** — replace flat list with collapsible sections per step. Each section has a header row (icon + title + summary counts + chevron) and an expandable body with a compact data table | Progressive disclosure |
| 6 | **Company section body** — mini table: Odoo Name → Department Name, action badge (green=new, blue=mapped) | Entity-level detail |
| 7 | **Category section body** — mini table: Code, Odoo Name → Category + FG, action badge. Default show first 5, "Show all 57 →" link to expand | Handle large lists gracefully |
| 8 | **Journal Lines section body** — two horizontal bar groups: "By Company" and "By Month", plus inserted/updated counts | Distribution at a glance |
| 9 | **Actuals section body** — "By Department" horizontal bars + inserted/updated counts | Know where actuals landed |
| 10 | **Warnings callout** — if `warnings.length > 0`, show an amber alert card listing each warning with step context | Don't hide problems |
| 11 | **Add `Collapsible` wrapper component** — a simple `useState`-based expand/collapse with animated `max-height` and chevron rotation | Smooth UX, no new dependency needed |
| 12 | **Add color-coded action badges** — `created`=green, `updated`/`mapped-by-name`=amber, `mapped-by-id`=blue | Instant visual parsing |

#### 3d: New/Modified UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `Collapsible` | `InfoFin.UI/src/components/ui/collapsible.tsx` | Reusable expand/collapse wrapper (or use headless UI) |
| `SyncProgressBar` | Inline in `OdooSyncWizard.tsx` | Thin bar + detail text per step |
| `EntityMiniTable` | Inline in `OdooSyncWizard.tsx` | Compact 3-4 column table for entity lists |
| `ActionBadge` | Inline or `components/ui/badge.tsx` variant | Color-coded created/updated/mapped badges |
| `MonthBarGroup` | Inline in `OdooSyncWizard.tsx` | Horizontal bar chart for by-month distribution |

---

### Phase 4: Backend — Sync History

**Goal**: Persist each sync run so users can browse past syncs and drill into them.

#### Database: New `SyncRun` table

```sql
CREATE TABLE [dbo].[SyncRun] (
    [RunId] NVARCHAR(36) PRIMARY KEY,         -- GUID
    [StartedAt] DATETIME NOT NULL,
    [CompletedAt] DATETIME NULL,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'running',  -- running, completed, failed
    [Year] INT NOT NULL,
    [IsFullSync] BIT NOT NULL DEFAULT 1,
    [ResultJson] NVARCHAR(MAX) NULL,          -- full SyncResult serialized
    [ErrorMessage] NVARCHAR(MAX) NULL,
    [CompaniesTotal] INT NULL,
    [CategoriesCreated] INT NULL,
    [CategoriesUpdated] INT NULL,
    [JournalLinesTotal] INT NULL,
    [ActualsRowsTotal] INT NULL
);
```

#### New endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/odoo/sync/history?limit=20` | List recent sync runs (summary only) |
| `GET /api/odoo/sync/history/{runId}` | Full detail for a specific run (reconstituted from `ResultJson`) |

#### Controller changes

| # | Change | Why |
|---|--------|-----|
| 1 | At sync start: INSERT into `SyncRun` with `Status='running'` | Begin audit record |
| 2 | At sync end: UPDATE `SyncRun` with completed status and serialized `ResultJson` | Persist full detail |
| 3 | On sync error: UPDATE `SyncRun` with `Status='failed'` and error message | Failed runs visible |
| 4 | Add `GET /api/odoo/sync/history` — query `SyncRun` ordered by `StartedAt DESC` | Browse past syncs |
| 5 | Add `GET /api/odoo/sync/history/{runId}` — deserialize `ResultJson` and return | Drill into past sync |

---

### Phase 5: Frontend — Sync History Panel

**File**: New component or extension of `OdooSyncWizard.tsx`

A slide-over panel (or modal) triggered by the "History" button.

| # | Feature | Detail |
|---|---------|--------|
| 1 | **Run list** — table showing: date, year, status badge (success/partial/failed), duration, counts summary | Quick comparison |
| 2 | **Click to expand** — clicking a run loads full detail into the same results dashboard view used for live syncs | Reuse `SyncResultsDashboard` |
| 3 | **Diff mode** — select two runs and see what changed between them (counts delta) | "What changed since last sync?" |
| 4 | **Status badge states** — `completed`=green, `completed_with_warnings`=amber, `failed`=red | Immediate triage |

---

## Summary of All Changes

### Backend (`OdooController.cs`)

| # | Change |
|---|--------|
| B1 | Enrich `SyncResult` with structured per-entity detail (new inner classes) |
| B2 | Populate per-entity detail in each sync step |
| B3 | Add `SyncProgressTracker` for real-time step reporting |
| B4 | Add `GET /api/odoo/sync/progress` polling endpoint |
| B5 | Add `SyncRun` table migration |
| B6 | Add `GET /api/odoo/sync/history` endpoints |
| B7 | Persist sync runs to `SyncRun` table |
| B8 | Add warning collection for unmapped entities |
| B9 | Pass `?year=` query param to sync a specific year |

### Frontend (`OdooSyncWizard.tsx` + new components)

| # | Change |
|---|--------|
| F1 | Remove fake `setInterval` step timer |
| F2 | Add `useEffect` polling loop for real `GET /api/odoo/sync/progress` |
| F3 | Add year selector dropdown |
| F4 | Add "History" button + slide-over panel |
| F5 | Replace flat results list with collapsible per-step sections |
| F6 | Add entity mini-tables for companies and categories |
| F7 | Add breakdown bars for journals (by company, by month) and actuals (by department) |
| F8 | Add color-coded action badges |
| F9 | Add warnings callout card |
| F10 | Create reusable `Collapsible` component |
| F11 | Create sync history list view |
| F12 | Reuse results dashboard for history drill-down |

---

## Implementation Order

```
Phase 1 (Backend: Enriched Result)    ← Foundation — everything builds on this
    ↓
Phase 2 (Backend: Real Progress)      ← Enables live UI updates
    ↓
Phase 3 (Frontend: Redesigned Wizard) ← The main deliverable
    ↓
Phase 4 (Backend: Sync History)       ← Adds persistence
    ↓
Phase 5 (Frontend: History Panel)     ← Completes the audit trail
```

**Recommended**: Implement Phase 1 + Phase 3 first as they deliver the highest value (entity-level visibility). Phase 2 (real progress) is a nice-to-have that makes the UX polished. Phases 4-5 (history) complete the picture but can be done later.

---

## Design Rationale (Why This Approach)

### Why not SSE/WebSocket for live progress?
Polling at 500ms intervals is simpler, works through all load balancers/proxies, and the sync takes 5-15 seconds — real-time microsecond precision isn't needed. SSE would be over-engineering here.

### Why not a separate micro-frontend or page?
The Odoo Sync lives under Master Data → Odoo Sync tab. Keeping it as a single component with collapsible sections keeps navigation simple. The history panel as a slide-over avoids a page navigation.

### Why not real-time per-row streaming?
Odoo returns all journal lines in a single XML-RPC response. We can't "stream" from Odoo. We can, however, report progress as we process batches locally — which Phase 2 covers.

### Why collapsible sections instead of tabs?
Tabs hide information; collapsible sections let users see all steps at once and expand the ones they care about. This is the "progressive disclosure" pattern — summary always visible, detail on demand.

---

## Future Enhancements (Out of Scope)

- **Pre-sync preview/dry-run**: Show what would change without executing
- **Scheduled sync configuration UI**: Let users change the daily sync hour from the UI
- **Sync notifications**: Toast/email when a scheduled sync completes or fails
- **Entity reconciliation UI**: When an Odoo company doesn't match any department, let users manually link them from the sync results
