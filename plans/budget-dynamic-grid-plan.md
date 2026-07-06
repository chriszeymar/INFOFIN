# Budget Grid — Dynamic & Customizable Transformation Plan

> **Goal**: Transform the budget grid from static read-only to fully interactive — inline editing, row CRUD, column customization, and draft/save workflow. UI-first approach; backend wiring follows after UX is solidified.

> **Reference**: `plans/ui-design-spec (1)/components/budget/budget-grid.tsx`  
> **Date**: 2026-07-05  
> **Branch**: `copilot/transform-budget-feature`

---

## What the Images Show

From the pasted images, the grid in edit mode supports:

| Feature | Description |
|---|---|
| **Inline label edit** | Click a category name → input field with delete (trash) button |
| **Inline value edit** | Click a forecast/execution cell → numeric input, auto-selects on focus |
| **Row deletion** | Trash icon per row removes the line item |
| **Add line item** | "Add line item" button at section/classification level |
| **Section collapse** | Chevron toggles to show/hide sections |
| **Edit mode toggle** | "Edit budget" → enters draft mode; "Discard" / "Save changes" appear |
| **"Customise" button** | Seen in toolbar — suggests column/department customization |

---

## Reference Implementation Analysis

The design spec at `plans/ui-design-spec (1)/components/budget/budget-grid.tsx` already has a complete dynamic grid implementation. Key components:

### Edit API Interface
```typescript
export type EditApi = {
  onValue: (deptId: string, itemId: string, field: 'forecast' | 'execution', value: number) => void
  onRename: (itemId: string, label: string) => void
  onDelete: (itemId: string) => void
  onAdd: (section: SectionType, classification: ClassificationType | null) => void
}
```

### Editable Components
| Component | Purpose | Status in our code |
|---|---|---|
| `NumInput` | Inline numeric editor for forecast/execution cells | ✅ In spec, needs porting |
| `LabelCell` | Editable label with delete button | ✅ In spec |
| `AddLineRow` | "Add line item" button at section level | ✅ In spec |
| `ValueCells` | Renders NumInput when editing, fmt when not | ✅ In spec |
| `FlatSection` | REVENUES/COS with optional edit support | ✅ In spec |
| `ClassifiedSection` | FIXED/VARIABLE with optional edit + classification toggle | ✅ In spec |

### Draft/Save Workflow (from spec BudgetPage)
```typescript
// Draft state management
const [draft, setDraft] = useState<DepartmentGroup[] | null>(null)
const [deletedIds, setDeletedIds] = useState<string[]>([])
const editing = draft !== null

// Start editing → clone live data into draft
function startEdit() { setDraft(cloneGroups(data)) }
// Discard → clear draft
function discard() { setDraft(null); setDeletedIds([]) }
// Save → POST draft to API, then refresh
async function save() { await saveBudgetAction(buildSavePayload(draft!, deletedIds)); refresh() }
```

---

## Gap Analysis: Our Code vs Spec

| Component | Spec Has | Our Code Has | Action |
|---|---|---|---|
| `NumInput` | ✅ | ❌ Missing | Port from spec |
| `LabelCell` with edit | ✅ | ❌ Missing | Port from spec |
| `AddLineRow` | ✅ | ❌ Missing | Port from spec |
| `ValueCells` with edit | ✅ | Partial | Port full version |
| `FlatSection` edit prop | ✅ | ❌ Not passed | Wire edit prop |
| `ClassifiedSection` edit prop | ✅ | ❌ Not passed | Wire edit prop |
| Draft state (clone/discard/save) | ✅ | ❌ Missing | Add to BudgetPage |
| `deptItem` lookup helper | ✅ | ❌ Missing | Port from spec |
| `edit` prop on BUGrid/SUGrid | ✅ | ✅ Present | Already wired |
| Edit mode toggle in toolbar | ✅ | ✅ Present | Already working |
| React key warnings | ❌ | ❌ Bug | Fix fragments in DeptSubHeaders/FlatSection |

---

## Implementation Plan

### Step 1: Port Missing Editable Components

Add these to our `BudgetGrid.tsx`:

- **`NumInput`** — controlled numeric input with auto-select on focus, real-time onChange
- **`LabelCell`** — conditionally renders input + trash button when `edit` prop exists
- **`AddLineRow`** — "+ Add line item" button row, only visible when `edit` is active
- **`ValueCells`** — renders `NumInput` when `edit` is present, static `fmt()` otherwise
- **`deptItem`** — helper to look up an item by section/classification/id within a department

### Step 2: Wire `edit` Prop Through All Components

- `FlatSection` → accepts optional `edit: EditApi`
- `ClassifiedSection` → accepts optional `edit: EditApi`
- Section subtotals → `ValueCells` when editing
- Classification subtotals → `ValueCells` when editing

### Step 3: Add Draft State Management to BudgetPage

- `draft: DepartmentGroup[] | null` — cloned data during editing
- `deletedIds: string[]` — tracking deleted items for save payload
- `startEdit()` → deep-clone `filteredDepts` into draft
- `discard()` → clear draft and deletedIds
- `save()` → build payload, POST to API, refresh

### Step 4: Implement EditApi Handlers

- `onValue(deptId, itemId, field, value)` → update draft item's forecast/execution
- `onRename(itemId, label)` → update draft item's label
- `onDelete(itemId)` → remove from draft, add to deletedIds
- `onAdd(section, classification)` → insert new empty item with unique ID

### Step 5: Fix React Key Warnings

- Replace `<>` fragments with `<React.Fragment key={...}>` in `DeptSubHeaders`, `FlatSection`, `ClassifiedSection`, `SummaryRow`

### Step 6: Column Customization (Future Phase)

- "Customise" button in toolbar
- Department visibility toggles
- Column reordering
- Save layout preferences

---

## Files to Modify

| File | Action | Effort |
|---|---|---|
| `BudgetGrid.tsx` | Port `NumInput`, `LabelCell`, `AddLineRow`, `ValueCells`, `deptItem`; wire `edit` through all sections | 2 hrs |
| `BudgetPage.tsx` | Add draft state, `startEdit`/`discard`/`save`, EditApi handlers | 1 hr |
| `budget-data.ts` | May need `cloneGroups` / `setValue` / `renameItem` / `deleteItem` / `addItem` helpers | 30 min |

---

## Backend (Future Phase — NOT in this plan)

After UI transformation is complete:
- `PUT /api/budgets/draft` — save full draft (upsert changed + delete removed)
- `POST /api/budgets/item` — add single item
- `DELETE /api/budgets/item/{id}` — delete single item
- Column layout preferences endpoint
