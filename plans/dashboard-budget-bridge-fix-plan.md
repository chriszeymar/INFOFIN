# Dashboard ↔ Budget Bridge — Fix Plan

## Root Cause Analysis

### 1. OPEX showing negative in charts
**Cause:** Odoo stores expense actuals as negative numbers (standard accounting: credits = positive/revenue, debits = negative/expenses). The dashboard SQL sums `a.Amount` as-is, so `fixE`, `varE`, `cosE`, and `mOpex` are all negative. The bar chart renders negative OPEX bars below the axis.
**Fix:** Use `ABS(SUM(a.Amount))` for OPEX/COS/Fixed/Variable amounts in chart data. Revenue stays as-is (positive). KPI "Total Spent" should be `ABS(opex) + ABS(cos)` — total spending, not net.

### 2. Cost breakdown donut empty
**Cause:** Same as #1 — `fixE`, `varE`, `cosE` are negative. Recharts PieChart may not render negative slices properly, or they render as 0-height.
**Fix:** Apply `ABS()` to cost breakdown values.

### 3. Overspent table shows revenue items with $0 budget (Infinity%)
**Cause:** Revenue items (`OdooAccountType = 'income'|'income_other'`) have positive execution but often $0 forecast (no budget line for revenue). The overspent filter `Execution > Forecast` catches them. Budget shows $0, spent shows actual revenue amount, overspend = Infinity%.
**Fix:** Exclude revenue items from overspent — only check expense/COS items: `OdooAccountType IN ('expense', 'expense_direct_cost')`.

### 4. Department dropdown not populated
**Cause:** The `GET /api/dashboard/departments` endpoint is behind `[Authorize]` on the controller class. The frontend call via `httpClient` should include auth cookies. If the call fails silently (`.catch(() => setDepts([]))`), the dropdown stays empty. Possible causes:
- Route conflict (`/api/dashboard/departments` vs `/api/dashboard?departmentId=...`)
- The endpoint returns 401/403 but frontend swallows the error
**Fix:** The route should be fine (different HTTP method path). Check if there's an auth issue. Also add error logging.

### 5. Month filter shows data for future months
**Cause:** The Budget UNION part has no month filter:
```sql
WHERE b.Year = @Y AND b.IsActive = 1  -- no month condition!
```
When month=9 (future from July), actuals return 0 rows for that month, but budget entries still appear. The dashboard then shows forecast data for a future month.
**Fix:** When a specific month is selected, the budget-only UNION part should respect it. Options:
- **A:** Add `AND (@M IS NULL OR @M >= MONTH(GETDATE()))` — only show budget rows if the selected month is current or future (where actuals wouldn't exist yet). But budget is yearly, not monthly — this doesn't quite work.
- **B (better):** Always show budget/forecast regardless of month (forecast is yearly). Only the execution/todate should be month-filtered. The monthly bars query already only pulls actuals by month. For future months, revenue=0, opex=0 — the bars would be empty. The KPI cards should still show the yearly forecast.
- **C:** Remove the month filter from the dashboard entirely (it doesn't apply to forecasts). Or rename it to "YTD through" instead of "Month".

**Recommended:** Option B — forecast is always yearly. Month only affects execution/todate. For the monthly bars chart, future months correctly show 0.

### 6. Dashboard doesn't reflect budget data well
**Cause:** The dashboard computes everything from raw Actuals + Budget rows without understanding the P&L structure that the budget grid enforces. The budget grid maps categories to sections (REVENUES/COS/FIXED_COSTS/VARIABLE_COSTS) based on `OdooAccountType` + `FinancialGroup.Name`. The dashboard does this too, but:
- KPI "Total Budget" sums ALL forecasts (including revenue + expense), which gives net, not total spending budget
- KPI "Total Spent" sums ALL execution (revenue positive + expense negative = net), which is misleading
- KPI "EBIT" computation might be wrong due to sign issues
**Fix:** Align KPI definitions with the budget grid's P&L structure:
- `totalBudget` = sum of all expense forecasts (COS + Fixed + Variable) — the spending budget
- `totalSpent` = sum of ABS(all expense execution) — actual spending
- `remaining` = budget - spent
- `EBIT` = revenue execution - ABS(COS execution) - ABS(Fixed execution) - ABS(Variable execution)

---

## Implementation Plan

### Backend: `DashboardController.cs`

| # | Change | Why |
|---|--------|-----|
| 1 | Use `ABS(SUM(a.Amount))` for expense/COS monthly bars | OPEX shows positive on chart |
| 2 | Use `ABS()` for cost breakdown values (fixE, varE, cosE) | Donut renders properly |
| 3 | Exclude income types from overspent query | No revenue in overspent |
| 4 | Fix KPI computation: totalBudget = expense forecasts only; totalSpent = ABS(expense execution) | Meaningful KPIs |
| 5 | Fix KPI EBIT: revE - ABS(cosE) - ABS(fixE) - ABS(varE) | Correct P&L math |
| 6 | Budget UNION: add `AND (@M IS NULL OR b.Year = @Y)` — always include budget unless no data at all | Forecast always yearly |

### Frontend: `Dashboard.tsx`

| # | Change | Why |
|---|--------|-----|
| 1 | Rename month filter label to "YTD through" | Clarify it's cumulative, not single-month |
| 2 | Add error console logging for department fetch | Debug dropdown issue |

### Frontend: `dashboardService.ts`

| # | Change | Why |
|---|--------|-----|
| 1 | Ensure `fetchDashboardDepartments` handles errors gracefully | Debug dropdown |

---

## Data Flow (corrected)

```
Odoo Sync → Actuals (amounts: revenue=+, expense=-)
                         │
                         ├─ ABS(expense amounts) → Charts, KPIs (display)
                         ├─ Signed amounts → EBIT calculation (math)
                         │
Budget entries → Budget (ForecastAmount: always positive)
                         │
                         └─ Sum by category → totalBudget (expenses only)
```
