# Budget Top Design — Redesign Plan

> **Goal**: Redesign the budget page header area (toolbar + KPI cards) to match the provided mockup image.

> **Date**: 2026-07-05  
> **Branch**: `copilot/transform-budget-feature`

---

## Current State vs Target

### Top Bar

| Element | Current | Target |
|---|---|---|
| Navigator toggle | "Hide Navigator" button | "Navigator" text link with icon |
| Year selector | Full `<Select>` dropdown with border | Compact inline pill-style year selector |
| Breadcrumb | None | "Business Unit — Full P&L" |
| BU/SU toggle | In navigator tabs | Keep in navigator ✅ |
| Action buttons | None | "Upload Budget" (ghost) + "Edit budget" (toggle) |
| Layout | Single `<div>` with `rounded-lg border bg-card p-3` | Clean horizontal strip, no card wrapper |

### KPI Cards Row

| Element | Current | Target |
|---|---|---|
| Section title | Inside `<CardHeader>`: "Business Units — 2026" | "Banking & Digital" with "5 departments · FY 2026" subtitle |
| KPI card 1 | None | Revenue: $20.6M ($3.0M to date) |
| KPI card 2 | None | Gross Margin: $16.9M ($2.6M to date) |
| KPI card 3 | None | Total Opex: $2.0M ($180K spent) |
| KPI card 4 | None | EBIT: $15.0M ($2.4M to date) |
| KPI card 5 | None | Opex Burn: 9% |
| Layout | Inside card with padding | Horizontal flex row of 5 metric cards |

### Grid

| Element | Current | Target |
|---|---|---|
| Wrapper | `<Card>` with header + content | Remove card wrapper, just the table |
| Grid component | `BUGrid` / `SUGrid` | Same grid, but directly rendered (no Card) |

---

## Implementation Plan

### Step 1: Create KPI Cards Component

**New file**: `InfoFin.UI/src/components/budgets/BudgetKPICards.tsx`

Props:
```typescript
interface KPIData {
  revenue: { forecast: number; execution: number }
  grossMargin: { forecast: number; execution: number }
  totalOpex: { forecast: number; execution: number }
  ebit: { forecast: number; execution: number }
  opexBurnPct: number | null
  groupName: string
  deptCount: number
  year: number
}
```

Render 5 cards horizontally:
- Each card: label on top, large value, smaller "to date" sub-value
- Last card (Opex Burn): just percentage with color coding
- Cards have subtle border/background, rounded corners

### Step 2: Redesign Top Bar

**Modify**: `BudgetPage.tsx`

Replace the current toolbar with:
```
[Navigator]  [2026 ▼]  [Business Unit — Full P&L breadcrumb]  ...spacer...  [Upload Budget]  [Edit budget]
```

- "Navigator" — text button with PanelLeft icon, toggles `showNav`
- Year selector — compact inline dropdown, no border wrapper
- Breadcrumb — gray text, "Business Unit" when BU selected, "Support Unit" when SU
- "Upload Budget" — ghost button with Upload icon
- "Edit budget" — toggle/switch component

### Step 3: Insert KPI Cards Between Toolbar and Grid

**Modify**: `BudgetPage.tsx`

Compute KPI data from `filteredDepts` using existing helpers (`getDeptSummary`, `sumItems`):
```typescript
const kpiData = useMemo(() => {
  if (filteredDepts.length === 0) return null
  const summaries = filteredDepts.map(d => getDeptSummary(d, buSu))
  const total = summaries.reduce((acc, s) => ({
    revenue: { forecast: acc.revenue.forecast + s.revenue.forecast, execution: acc.revenue.execution + s.revenue.execution },
    grossMargin: { forecast: acc.grossMargin.forecast + s.grossMargin.forecast, execution: acc.grossMargin.execution + s.grossMargin.execution },
    opex: { forecast: acc.opex.forecast + s.opex.forecast, execution: acc.opex.execution + s.opex.execution },
    ebit: { forecast: acc.ebit.forecast + s.ebit.forecast, execution: acc.ebit.execution + s.ebit.execution },
  }), { revenue: {...}, grossMargin: {...}, opex: {...}, ebit: {...} })
  const opexBurnPct = total.opex.forecast > 0 ? Math.round((total.opex.execution / total.opex.forecast) * 100) : null
  return {
    revenue: total.revenue,
    grossMargin: total.grossMargin,
    totalOpex: total.opex,
    ebit: total.ebit,
    opexBurnPct,
    groupName: selection?.groupId ? navGroups.find(g => g.id === selection.groupId)?.name ?? '' : '',
    deptCount: filteredDepts.length,
    year
  }
}, [filteredDepts, buSu, selection, navGroups, year])
```

### Step 4: Remove Card Wrapper from Grid

**Modify**: `BudgetPage.tsx`

Remove `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardContent>` wrappers. Render `BUGrid`/`SUGrid` directly with the table.

### Step 5: Connect KPI to Navigator Selection

When a department is selected in the navigator, the KPI cards should show metrics for that specific department (or group aggregate when "all" is selected).

---

## Component Tree (After)

```
BudgetPage
├── TopBar
│   ├── NavigatorToggle (text + PanelLeft icon)
│   ├── YearSelector (compact pill)
│   ├── Breadcrumb ("Business Unit — Full P&L")
│   ├── UploadBudgetButton (ghost)
│   └── EditBudgetToggle
├── MainLayout (flex row)
│   ├── BudgetNavigator (conditional)
│   │   └── ... (existing)
│   └── ContentArea (flex-1)
│       ├── BudgetKPICards
│       │   ├── RevenueCard
│       │   ├── GrossMarginCard
│       │   ├── TotalOpexCard
│       │   ├── EBITCard
│       │   └── OpexBurnCard
│       └── BUGrid / SUGrid (no Card wrapper)
```

---

## Files to Create / Modify

| File | Action | Effort |
|---|---|---|
| `src/components/budgets/BudgetKPICards.tsx` | **New** — KPI cards component | 1 hr |
| `src/pages/BudgetPage.tsx` | **Modify** — redesign toolbar, add KPI row, remove Card wrapper | 1 hr |

---

## Data Sources

All KPI data comes from `filteredDepts: Department[]` using existing helpers:
- `getDeptSummary(dept, bucketType)` → returns `{ revenue, grossMargin, opex, ebit }` with `{ forecast, execution }`
- `execPct(forecast, execution)` → returns `number | null`
- Group name from `navGroups` matching `selection.groupId`
- Department count = `filteredDepts.length`

No new API endpoints needed.
