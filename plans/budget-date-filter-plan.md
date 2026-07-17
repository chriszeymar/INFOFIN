# Budget Grid — Date/Period Filter Plan

> **Goal**: Add a period filter to the budget grid so users can see execution evolution by month, quarter, or custom date range — not just full-year aggregates.
>
> **Date**: 2026-07-07
> **Branch**: `main`

---

## Current State

```
Actuals table: DepartmentId | CategoryId | Year | Month | Amount
                                                           ↑
                                              Month-level data EXISTS
                                              but grid sums it all up
```

- `GET /api/budgets/grid/{year}` aggregates **all 12 months** into one `execution` number per line item
- UI has year selector (2024/2025/2026) but no period/month selector
- Odoo sync already stores month-level `Actuals` — the data is there, we're just not exposing it

## Target State

User can filter the grid by period in two modes:

### Mode A: Month Selector (Simple)

A single month picker that shows execution for **one specific month**:

```
[2026 ▼]  [Month: All ▼]   ← "All" = full year (current behavior)
              ├ Jan
              ├ Feb
              ├ ...
              └ Dec
```

### Mode B: Cumulative "Up To" Selector (Recommended)

A month selector that shows **cumulative** execution from January through the selected month:

```
[2026 ▼]  [YTD through: Dec ▼]   ← "Dec" = full year
               ├ Jan                 ← show only January execution
               ├ Feb                 ← show Jan+Feb execution
               ├ ...
               └ Dec                 ← show Jan-Dec = full year
```

This better answers "budget evolution date to date" — you slide the month forward and see execution accumulate.

---

## Implementation Steps

### Step 1: Backend — Add `month` parameter to grid endpoint

**File**: `Api/InfoFin.Api/Controllers/BudgetsController.cs`

Modify `GetGrid` to accept an optional `month` query parameter:

```csharp
[HttpGet("grid/{year:int}")]
public async Task<IActionResult> GetGrid(
    int year,
    [FromQuery] string buSu = "BU",
    [FromQuery] int? month = null)  // NEW: 1–12, null = full year
```

Modify the Actuals query:

```sql
-- When month is provided:
SELECT a.DepartmentId, a.CategoryId, SUM(a.Amount) AS Execution, ...
FROM Actuals a
WHERE a.Year = @Y AND a.Month <= @M   -- cumulative Jan→selected month
GROUP BY a.DepartmentId, a.CategoryId, ...

-- When month is null (full year, current behavior):
WHERE a.Year = @Y
```

Also update the navigator endpoint (`GET /api/budgets/navigator/{year}`) with the same `month` filter for consistency.

**Effort**: ~15 min

### Step 2: Backend — Add `GetAvailableMonths` endpoint (optional helper)

**File**: `Api/InfoFin.Api/Controllers/BudgetsController.cs`

```csharp
[HttpGet("grid/{year:int}/months")]
public async Task<IActionResult> GetMonths(int year)
```

Returns which months have actuals data for the given year:

```json
[1, 2, 3, 4, 5, 6]   // E.g., data only through June
```

This lets the UI disable months with no data yet. The query:

```sql
SELECT DISTINCT Month FROM Actuals WHERE Year = @Y ORDER BY Month
```

**Effort**: ~10 min

### Step 3: Frontend — Add month selector to BudgetPage toolbar

**File**: `InfoFin.UI/src/pages/BudgetPage.tsx`

Add a month dropdown next to the year selector:

```tsx
const MONTHS = [
  { value: null, label: 'All months' },  // null = full year
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  // ... through 12
  { value: 12, label: 'Dec' },
]

const [month, setMonth] = useState<number | null>(null)
```

Wire it into the data fetch:

```tsx
useEffect(() => {
  setLoading(true)
  httpClient.get(`/api/budgets/grid/${year}`, {
    params: { buSu, month }  // month: null → not sent → full year
  })
    .then(({ data }) => setDepts(Array.isArray(data) ? data : []))
    .catch(() => setDepts([]))
    .finally(() => setLoading(false))
}, [year, buSu, month])
```

**Effort**: ~15 min

### Step 4: UX — Update KPI labels for period context

**File**: `InfoFin.UI/src/components/budgets/BudgetKPICards.tsx`

When a month is selected, show the period in the KPI card labels:

| Current | With filter |
|---|---|
| "Revenue: $20.6M ($3.0M to date)" | "Revenue: $20.6M ($1.2M Jan–Jun)" |
| "Opex Burn: 9%" | "Opex Burn: 41% (H1)" |

Pass `month` down to `BudgetKPICards` and adjust subtitle text.

**Effort**: ~10 min

---

## Design Decision: Cumulative vs Month-by-Month

| Approach | UX | Use Case |
|---|---|---|
| **Cumulative (YTD)** | One month selector, execution accumulates | "How are we tracking against budget through June?" |
| **Month-by-month** | Month selector picks one month | "What happened specifically in March?" |
| **Date range** | Two selectors (from → to) | "Show me Q2 only" |

**Recommendation**: Start with **cumulative YTD** (Step 1–4). It's the simplest and answers the primary question "budget evolution date to date." Month-by-month and date range can be added later as dropdown options.

---

## Future Enhancements (Phase 2)

1. **Quarter selector**: "Q1", "Q2", "Q3", "Q4" as shortcuts → maps to month ranges
2. **Side-by-side periods**: Show two columns — "Jan–Jun 2025" vs "Jan–Jun 2026" for YoY comparison
3. **Month-over-month sparklines**: Tiny trend charts in each grid cell showing monthly execution history
4. **"As of date" picker**: A calendar date picker for "show me the state as of March 15"

---

## Files Modified

| File | Change | Effort |
|---|---|---|
| `Api/InfoFin.Api/Controllers/BudgetsController.cs` | Add `month` param to `GetGrid`, `GetNavigator`; add `GetMonths` endpoint | 25 min |
| `InfoFin.UI/src/pages/BudgetPage.tsx` | Add month selector, wire to fetch | 15 min |
| `InfoFin.UI/src/components/budgets/BudgetKPICards.tsx` | Accept `month` prop, adjust labels | 10 min |
| **Total** | | **~50 min** |
