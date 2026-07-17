# Export Capabilities Plan

## Overview

Add PDF and Excel export across all features. Excel is the primary format for tabular data; PDF is for reports, detail views, and presentation-ready output.

---

## Feature → Export Mapping

| Feature | Excel | PDF | Notes |
|---|---|---|---|
| **Dashboard** | ✗ | ✓ | Full dashboard snapshot with KPI cards + all visible charts |
| **Budget Grid (BU)** | ✓ | ✓ | Excel = raw grid, PDF = formatted P&L-style report |
| **Budget Grid (SU)** | ✓ | ✓ | Same as BU but OPEX-only |
| **Spend Requests List** | ✓ | ✓ | Respects current filters (status, search, date range) |
| **Spend Request Detail** | ✗ | ✓ | Single request with approval timeline |
| **Master Data** | ✓ | ✗ | Export each section (Categories, Departments, etc.) |
| **User Management** | ✓ | ✗ | User list with roles, departments, active status |

---

## Technical Approach

### Option A: Server-Side (Recommended)
- **Excel:** ClosedXML — generates `.xlsx` on the backend, streams to client
- **PDF:** QuestPDF or IronPDF — renders HTML/razor templates to PDF
- **Pros:** Consistent output, handles large datasets, works with real DB data
- **Cons:** More backend work, needs template design

### Option B: Client-Side (Faster MVP)
- **Excel:** SheetJS (`xlsx`) — generates `.xlsx` from in-memory data
- **PDF:** `jspdf` + `jspdf-autotable` — builds PDF from DOM/data
- **Pros:** Quick to implement, no backend changes
- **Cons:** Limited to data already loaded in browser, larger downloads

### Decision: Start with **Option B (client-side)** for MVP speed, then migrate critical exports (dashboard, budget grid) to server-side for production.

---

## Implementation Steps

### Phase 1: Shared Export Infrastructure

1. **Install dependencies**
   ```
   npm install jspdf jspdf-autotable xlsx file-saver
   npm install -D @types/file-saver
   ```

2. **Create shared export utilities**
   - `src/lib/export/excel.ts` — generic `exportToExcel(rows, columns, filename, sheetName)` 
   - `src/lib/export/pdf.ts` — generic `exportToPdf({ title, content, filename })` with auto-table
   - `src/lib/export/utils.ts` — filename helpers with date stamps (`Budget_BU_2026-07-07.xlsx`)

3. **Add Export button component**
   - `src/components/ui/export-button.tsx` — dropdown with Excel/PDF options
   - Reusable across all pages

### Phase 2: Per-Feature Exports

#### Budget Grid (BU/SU)
- **Excel:** Export the full grid as-is — department columns, rows with sections, subtotals
- **PDF:** Landscape A3, formatted P&L layout matching the on-screen grid with headers, alternating row colors, section grouping
- **Trigger:** "Export" button in BudgetPage filter bar
- **Data source:** Current `departments` state (already in memory)

#### Spend Requests List
- **Excel:** Columns: Reference #, Department, Category, Amount, Currency, Status, Date, Encoder, Assigned To
- **PDF:** Table format with current filters shown in title
- **Trigger:** "Export" button next to search/filter bar
- **Data source:** `allRequests` or `filtered` state

#### Spend Request Detail
- **PDF:** Formatted detail sheet — request info, amounts, approval timeline, attachments list
- **Trigger:** "Export PDF" button on detail page
- **Data source:** `request` + `histories` + `attachments` state

#### Dashboard
- **PDF:** Full dashboard capture — title "InfoFin Dashboard — [Year] — [BU/SU]", KPI cards as summary box, all visible chart widgets rendered as embedded images or summary tables
- **Trigger:** "Export PDF" in dashboard filter bar
- **Challenge:** Charts (Recharts) need to be captured as images via `html2canvas` or Recharts `toDataURL`
- **Dependency:** `npm install html2canvas`

#### Master Data
- **Excel:** One sheet per section (Categories, Departments, Classifications, FinancialGroups, DepartmentGroups, Currencies)
- **Trigger:** "Export" button in each section or a global "Export All" in MasterData
- **Data source:** Current tab's data from state

#### User Management
- **Excel:** Columns: Name, Email, Role, Department, Active status
- **Trigger:** "Export" button on UserManagement page
- **Data source:** `masterUsers` (mock) → real API later

### Phase 3: Polish

- Add company logo/header to PDF exports
- Consistent filename convention: `InfoFin_{Feature}_{Date}.{ext}`
- Loading spinner during export generation
- Toast notification on success/failure
- Respect user's data scoping (analyst only exports their department)

---

## Backend Endpoints (Server-Side — Phase 4+)

For production, add dedicated export endpoints that bypass the client:

```
GET /api/export/budgets/{year}?month=&buSu=BU&format=xlsx
GET /api/export/budgets/{year}?month=&buSu=BU&format=pdf
GET /api/export/spendrequests?status=&departmentId=&format=xlsx
GET /api/export/spendrequests?status=&departmentId=&format=pdf
GET /api/export/spendrequests/{id}/pdf
GET /api/export/dashboard/{year}?buSu=BU&format=pdf
GET /api/export/masterdata/{section}?format=xlsx
GET /api/export/users?format=xlsx
```

Backend libraries:
- `ClosedXML` (Excel) — NuGet
- `QuestPDF` (PDF) — NuGet, free for commercial use < $1M revenue

---

## Priority Order

1. **Spend Requests List** — highest value, most frequently used
2. **Budget Grid** — core financial reporting
3. **Spend Request Detail** — needed for approval workflows
4. **Master Data** — admin convenience
5. **Dashboard** — presentation/board-ready reports
6. **User Management** — nice to have
