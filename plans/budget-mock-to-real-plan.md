# Budget Feature — Mock-to-Real Data Replacement Plan

> **Goal**: Replace all mock/hardcoded data in the budget feature with real API-driven data, fix architecture issues, and ensure end-to-end correctness.

> **Date**: 2026-07-05  
> **Status**: Phase 1 done (grid shows real actuals). Phases 2–6 pending.

---

## Current State Summary

| Component | Real/Mock | Status |
|-----------|-----------|--------|
| `BudgetPage` data fetching | ✅ Real | Fetches from `/api/budgets/grid/{year}?buSu=BU\|SU` |
| `BudgetGrid` (BUGrid/SUGrid) | ✅ Real | Renders from `Department[]` props — null-safe |
| `BudgetNavigator` | ❌ Mock | 100% hardcoded in `budget-data.ts` — fake percentages, groups, departments |
| `selection` state → grid filter | ❌ Not wired | Navigator selection has zero effect on grid |
| Grid API endpoint | ⚠️ Partial | Returns real data but has hardcoded mappings, bypasses service layer |
| Navigator API endpoint | ❌ None | No endpoint exists for group/department summaries |
| `YEARS` constant | ❌ Hardcoded | `[2026, 2025, 2024]` — should come from DB |
| `ActualAdjustment` table | ❌ Missing | Phase 11 plan requires it but not created |

---

## Phase 1: Grid Real Data — `[DONE]`

Already complete. The grid fetches real Odoo actuals and renders them with Revenue/COS/Fixed/Variable sections.

**What was fixed:**
- Department ID mismatch in Actuals (stale Odoo IDs 9,11 → real IDs 2,3)
- Frontend crash `departments.map is not a function`
- React `key` warnings on Fragment elements

---

## Phase 2: Fix Controller Hardcoded Mappings

**Files**: `Api/InfoFin.Api/Controllers/BudgetsController.cs`

### 2.1 Replace `MapSection` — stop using `fgId == 3`

**Current code** (lines 112–121):
```csharp
string MapSection(string odooType, int fgId) => odooType switch
{
    "income" or "income_other" => "REVENUES",
    "expense_direct_cost" => "COS",
    "expense" when fgId == 3 => "FIXED_COSTS",  // ← HARDCODED ID
    _ => "VARIABLE_COSTS"
};
```

**Fix**: Use `FinancialGroup.Name` from the query result instead of its ID. Add `FinancialGroupName` to `CellDto` and match on `"Fixed Costs"`.

### 2.2 Replace `MapCls` — stop using exact string match

**Current code** (lines 122–126):
```csharp
string MapCls(string? clName) => clName switch
{
    "Admin & Finances" => "ADMIN_FIN",       // ← exact string match
    "Technical & Operations" => "TECH_OPS",
    "Marketing & Sales" => "MKT_SALES",
    _ => "ADMIN_FIN"                          // ← silent default
};
```

**Fix**: Use `ClassificationId` (already in the query as `c.ClassificationId`) instead of name. Map by ID — check DB for the 3 classification IDs:
```csharp
string MapCls(int? clsId) => clsId switch
{
    1 => "ADMIN_FIN",
    2 => "TECH_OPS",
    3 => "MKT_SALES",
    _ => "ADMIN_FIN"
};
```
Add `ClassificationId` to `CellDto` if not already present.

---

## Phase 3: Real Budget Navigator

**Files**: `BudgetNavigator.tsx`, `BudgetPage.tsx`, `BudgetsController.cs` (or new service)

### 3.1 Add Navigator API Endpoint

**New endpoint**: `GET /api/budgets/navigator/{year}`

Returns group-level summary data:
```csharp
// Response shape
[
  {
    "id": "banking-digital",
    "name": "Banking & Digital",
    "bucketType": "BU",                    // or "SU"
    "forecast": 1200000,
    "execution": 108000,
    "burnPct": 9,                          // computed by frontend
    "departments": [
      {
        "id": "2",
        "name": "INFOSET SARL - MONETIQUE",
        "forecast": 500000,
        "execution": 45000,
        "burnPct": 9
      }
    ]
  }
]
```

**Implementation options**:
- **Option A** (fast): Add to `BudgetsController` with Dapper — same pattern as grid endpoint
- **Option B** (clean): Create `BudgetNavigatorService` + interface, move grid queries there too
- **Recommended**: Option A for now, refactor to B in Phase 5

**SQL approach**:
```sql
SELECT dg.Id AS GroupId, dg.Name AS GroupName, bt.Name AS BucketType,
       d.Id AS DeptId, d.Name AS DeptName,
       ISNULL(SUM(b.ForecastAmount), 0) AS Forecast,
       ISNULL(SUM(a.Amount), 0) AS Execution
FROM DepartmentGroup dg
JOIN BucketType bt ON bt.Id = dg.BucketTypeId
JOIN Department d ON d.DepartmentGroupId = dg.Id AND d.IsActive = 1
LEFT JOIN Budget b ON b.DepartmentId = d.Id AND b.Year = @Y
LEFT JOIN Actuals a ON a.DepartmentId = d.Id AND a.Year = @Y
WHERE (@B IS NULL OR bt.Name = @B)
GROUP BY dg.Id, dg.Name, bt.Name, d.Id, d.Name
ORDER BY dg.Id, d.Id
```

### 3.2 Refactor `BudgetNavigator` to Accept Props

**Current**: 0 data props — all mock internally.

**New interface**:
```typescript
interface NavigatorGroup {
  id: string; name: string; bucketType: 'BU' | 'SU';
  forecast: number; execution: number;
  departments: { id: string; name: string; forecast: number; execution: number; }[];
}

interface BudgetNavigatorProps {
  groups: NavigatorGroup[];
  selection: { groupId: string; deptId: string } | null;
  onSelect: (sel: { groupId: string; deptId: string } | null) => void;
  onClose: () => void;
}
```

### 3.3 Wire Navigator Data in `BudgetPage`

```tsx
// Add state for navigator data
const [navGroups, setNavGroups] = useState<NavigatorGroup[]>([])

// Fetch alongside grid data
useEffect(() => {
  httpClient.get(`/api/budgets/navigator/${year}`, { params: { buSu } })
    .then(({ data }) => setNavGroups(data))
}, [year, buSu])

// Pass to navigator
<BudgetNavigator groups={navGroups} selection={selection} onSelect={setSelection} onClose={...} />
```

---

## Phase 4: Wire Navigator Selection to Grid Filter

**Files**: `BudgetPage.tsx`, `BudgetGrid.tsx`

### 4.1 Add `selection` Filter Prop to Grid Components

```tsx
// BUGrid / SUGrid accept optional selectedDeptId
<BUGrid departments={depts} selectedDeptId={selection?.deptId} />
<SUGrid departments={depts} selectedDeptId={selection?.deptId} />
```

### 4.2 Filter Departments in Grid

When `selectedDeptId` is set, filter `departments` to only that department's rows. When `null` (or "All"), show all.

### 4.3 Add "All" Option to Navigator

The "All" button already exists in the navigator UI — wire it to clear selection (`onSelect(null)`).

---

## Phase 5: Refactor Controller → Service Layer

**Files**: `IBudgetService`, `BudgetService`, `BudgetsController.cs`

### 5.1 Move Dapper Queries to Service

Add to `IBudgetService.Foreign.Gen.cs`:
```csharp
Task<IEnumerable<DeptOut>> GetBudgetGrid(int year, string buSu);
Task<IEnumerable<NavigatorGroupOut>> GetBudgetNavigator(int year, string? buSu);
```

Implement in `BudgetService.Gen.cs` using the same Dapper queries currently in the controller.

### 5.2 Controller Becomes Thin

Controller methods should only:
1. Call service
2. Return `Ok(result)` or `NotFound()`

No raw SQL in controllers.

---

## Phase 6: Misc Cleanup

### 6.1 Dynamic Years

Replace `const YEARS = [2026, 2025, 2024]` with a DB query:
```sql
SELECT DISTINCT Year FROM Actuals UNION SELECT DISTINCT Year FROM Budget ORDER BY Year DESC
```
Add `GET /api/budgets/years` endpoint.

### 6.2 Add `Operations` DepartmentGroup to Seed

In `DB/InfoFin.DB.DbUp/Scripts/02_seed_data.sql`, add the missing `Operations` group if needed for the navigator structure.

### 6.3 Create `ActualAdjustment` Table

Per the Phase 11 plan, create the `ActualAdjustment` table for tracking Odoo sync corrections.

### 6.4 Remove `budget-data.ts` Mock Exports

Once Navigator and Page no longer use mock data, remove or deprecate:
- `departmentGroups` (line 210–260)
- `makeBUDept` / `makeSUDept` (lines 162–207)
- `buFixedClassifications` / `buVariableClassifications` (lines 101–157)
- `li()` function (line 58)
- `BUCKET_GROUPS` (line 256)

**Keep** (data-agnostic helpers):
- `type Department`, `type BudgetSection`, `type BudgetLineItem`, `type ClassificationType`
- `CLASSIFICATION_LABELS`
- `sumItems`, `execPct`, `getSectionTotals`, `getDeptSummary`
- `SectionType`, `BucketType`

---

## Execution Order

| # | Phase | Priority | Estimated Effort |
|---|-------|----------|-----------------|
| 1 | Grid Real Data | Done ✅ | — |
| 2 | Fix controller mappings | **High** | 30 min |
| 3 | Real Budget Navigator | **High** | 2 hrs |
| 4 | Wire selection → grid filter | Medium | 30 min |
| 5 | Refactor to service layer | Medium | 1 hr |
| 6 | Misc cleanup | Low | 1 hr |

**Recommended order**: 2 → 3 → 4 → 5 → 6

Phases 2+3 can be done in parallel (different files, no dependency).

---

## Files Affected

| File | Phase | Action |
|------|-------|--------|
| `Api/.../Controllers/BudgetsController.cs` | 2, 3, 5 | Fix mappings, add navigator endpoint, extract to service |
| `Api/.../IBudgetService.Foreign.Gen.cs` | 5 | Add grid + navigator method signatures |
| `Api/.../BudgetService.Gen.cs` | 5 | Implement grid + navigator queries |
| `InfoFin.UI/src/pages/BudgetPage.tsx` | 3, 4, 6 | Fetch navigator data, wire selection filter, dynamic years |
| `InfoFin.UI/src/components/budgets/BudgetNavigator.tsx` | 3 | Accept data props, remove mock imports |
| `InfoFin.UI/src/components/budgets/BudgetGrid.tsx` | 4 | Accept optional `selectedDeptId` filter prop |
| `InfoFin.UI/src/lib/budget-data.ts` | 6 | Remove mock data, keep types/helpers |
| `DB/.../02_seed_data.sql` | 6 | Add Operations group if needed |
| `DB/.../ActualAdjustment.sql` | 6 | New — create adjustment tracking table |
