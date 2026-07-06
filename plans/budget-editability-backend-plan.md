# Budget Grid — Editability Backend Plan

> **Goal**: Make inline edits persistent — save draft changes to the database via API

> **Date**: 2026-07-05  
> **Branch**: `copilot/transform-budget-feature`

---

## Current Draft State (Frontend)

The `BudgetPage` manages a local draft:
```typescript
draft: Department[] | null          // cloned departments with in-progress changes
deletedIds: Set<string>             // items marked for deletion
```

EditApi operations mutate draft locally:
- `onValue(deptId, itemId, field, value)` — updates forecast or execution
- `onRename(itemId, label)` — renames category label
- `onDelete(itemId)` — removes item from draft, adds to deletedIds
- `onAdd(section, classification)` — inserts `{ id: "new-...", label: "New line item", forecast: 0, execution: 0 }`

Save is a no-op currently — `setDraft(null); setDeletedIds(new Set())`

---

## Data Model

### Budget Table
```sql
Budget (Id, DepartmentId, CategoryId, Year, Month, ForecastAmount, CurrencyId, IsActive, CreateDT, UpdateDT)
```

### Category Table
```sql
Category (Id, Name, FinancialGroupId, ClassificationId, OdooAccountType)
```

### Item ID Convention
- Existing items: `"{deptId}-{categoryId}"` (e.g., "2-314")
- New items: `"new-{timestamp}"` (e.g., "new-1734567890")

### What's Editable
| Field | Table | Editable? |
|---|---|---|
| Forecast | `Budget.ForecastAmount` | ✅ Yes |
| Execution | `Actuals.Amount` | ❌ No (Odoo-synced) |
| Label | `Category.Name` | ✅ Yes (affects all departments) |

---

## API Design

### `PUT /api/budgets/draft`

Save all draft changes in one request (atomic-ish — each step independent).

**Request Body:**
```json
{
  "year": 2026,
  "departments": [
    {
      "id": "2",
      "sections": [
        {
          "type": "REVENUES",
          "items": [
            { "id": "2-314", "label": "Hardwares Rev.", "forecast": 500000, "execution": 341937.45 },
            { "id": "new-1734", "label": "New Revenue Item", "forecast": 10000, "execution": 0 }
          ]
        }
      ]
    }
  ],
  "deletedIds": ["2-315", "new-1735"]
}
```

**Backend Logic:**
1. For each item in departments:
   - Parse id: `"2-314"` → deptId=2, categoryId=314
   - If id starts with `"new-"`: create Category row → get new categoryId
   - If label differs from DB: update `Category.Name`
   - Upsert `Budget`: `(DepartmentId, CategoryId, Year)`, set `ForecastAmount`
2. For each deletedId:
   - If existing (numeric categoryId): soft-delete `Budget WHERE DepartmentId=X AND CategoryId=Y AND Year=Z`
   - If new (`"new-..."`): nothing to delete in DB
3. Return success with updated departments (with real IDs for new items)

### `POST /api/budgets/item`

Add single budget line item (alternative to full draft save).

**Request:**
```json
{ "departmentId": 2, "categoryId": 314, "year": 2026, "forecastAmount": 500000 }
```

### `DELETE /api/budgets/item/{departmentId}/{categoryId}/{year}`

Remove a single budget entry.

---

## Implementation

### Step 1: Add `SaveDraft` endpoint to Controller

**File**: `Api/InfoFin.Api/Controllers/BudgetsController.cs`

```csharp
[HttpPut("draft")]
public async Task<IActionResult> SaveDraft([FromBody] SaveDraftRequest request)
```

**Request DTO:**
```csharp
public class SaveDraftRequest
{
    public int Year { get; set; }
    public List<DeptOut> Departments { get; set; } = new();
    public List<string> DeletedIds { get; set; } = new();
}
```

**Logic (in controller or service):**
```csharp
// 1. Handle deletions
foreach (var id in request.DeletedIds)
{
    if (TryParseDeptCat(id, out int deptId, out int catId))
        await conn.ExecuteAsync("UPDATE Budget SET IsActive = 0 WHERE DepartmentId = @D AND CategoryId = @C AND Year = @Y", new { D = deptId, C = catId, Y = request.Year });
}

// 2. Handle items
foreach (var dept in request.Departments)
{
    int deptId = int.Parse(dept.Id);
    foreach (var section in dept.Sections)
    {
        foreach (var item in section.AllItems())
        {
            int catId;
            if (item.Id.StartsWith("new-"))
            {
                // Create new category
                var (fgId, clsId) = MapSectionToDb(section.Type);
                catId = await conn.QuerySingleAsync<int>(
                    @"INSERT INTO Category (Name, FinancialGroupId, ClassificationId) VALUES (@N, @F, @C); SELECT SCOPE_IDENTITY()",
                    new { N = item.Label, F = fgId, C = clsId });
            }
            else
            {
                catId = int.Parse(item.Id.Split('-')[1]);
            }

            // Update label if changed
            await conn.ExecuteAsync("UPDATE Category SET Name = @N WHERE Id = @C", new { N = item.Label, C = catId });

            // Upsert budget
            await conn.ExecuteAsync(
                @"MERGE Budget AS t
                  USING (SELECT @D AS DepartmentId, @C AS CategoryId, @Y AS Year) AS s
                  ON t.DepartmentId = s.DepartmentId AND t.CategoryId = s.CategoryId AND t.Year = s.Year
                  WHEN MATCHED THEN UPDATE SET ForecastAmount = @F, IsActive = 1
                  WHEN NOT MATCHED THEN INSERT (DepartmentId, CategoryId, Year, ForecastAmount, CurrencyId, IsActive) VALUES (@D, @C, @Y, @F, 1, 1);",
                new { D = deptId, C = catId, Y = request.Year, F = item.Forecast });
        }
    }
}
```

### Step 2: Add mapping helpers

```csharp
// Map section type to FinancialGroupId + ClassificationId
(string FgName, int? ClassificationId) MapSectionType(string type) => type switch
{
    "REVENUES" => ("Revenus", null),
    "COS" => ("COS", null),
    "FIXED_COSTS" => ("Fixed Costs", null), // classification from context
    "VARIABLE_COSTS" => ("Variables Costs", null),
    _ => ("Variables Costs", null)
};
```

### Step 3: Frontend — wire Save button

Update `BudgetPage.tsx` save handler:
```typescript
const save = useCallback(async () => {
  if (!draft) return
  const payload = {
    year,
    departments: draft,
    deletedIds: Array.from(deletedIds),
  }
  try {
    await httpClient.put('/api/budgets/draft', payload)
    setDraft(null)
    setDeletedIds(new Set())
    // Re-fetch grid data to get real IDs for new items
    // (triggers useEffect reload)
  } catch (e) {
    // show error toast
  }
}, [draft, deletedIds, year])
```

### Step 4: Re-fetch after save

After successful save, re-fetch grid data so new items get proper `"{deptId}-{categoryId}"` IDs instead of `"new-..."` placeholders.

---

## Files to Create/Modify

| File | Action | Effort |
|---|---|---|
| `BudgetsController.cs` | Add `SaveDraft` endpoint | 1 hr |
| `BudgetPage.tsx` | Wire save handler, add error handling | 30 min |
| `BudgetGrid.tsx` | Maybe: disable execution editing (Odoo-synced) | 15 min |

---

## Edge Cases

1. **New items get real IDs**: After save, the API returns the updated departments with real category IDs. Frontend replaces draft with server response.
2. **Label rename is global**: Renaming "Hardwares Rev." affects all departments using that category. This is correct behavior.
3. **Execution is read-only**: Odoo Actuals should not be editable. Consider disabling the execution `NumInput` or marking it visually.
4. **Currency**: Hardcoded `CurrencyId = 1` (USD) for now. Add currency selector later.
5. **Concurrent edits**: No locking — last write wins. Acceptable for single-user FPA workflow.
