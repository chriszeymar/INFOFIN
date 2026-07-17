# Budget Navigator + Grid — Filter Sync Plan

**Date:** 2026-07-16  
**Problem:** Navigator and Grid filters are disconnected. Navigator BU/SU/All tabs don't affect grid data.

---

## Filter Inventory

| Filter | Where set | Affects Navigator | Affects Grid | Status |
|--------|----------|------------------|-------------|--------|
| **Year** | Topbar `<Select>` | ✅ `?year=` | ✅ `?year=` | ✅ Working |
| **BU/SU** | Navigator tabs (All/BU/SU) | ✅ filters groups | ❌ Not passed to grid | 🔴 Broken |
| **Group** | Click group name (e.g., IT & Cloud) | ✅ highlights | ❌ Shows ALL depts | 🔴 Broken |
| **Department** | Click dept name (e.g., GENISYS) | ✅ highlights | ✅ filters to 1 dept | ✅ Working |
| **Overview** | Click "Overview" | ✅ deselects all | ✅ shows all depts | ✅ Working |
| **Month** | Not present in current UI | — | Needed for cumulative | 🟡 Missing |

---

## Root Causes

### 1. Navigator BU/SU tabs → Grid disconnect
```
Navigator: onBucketChange(t.key) → setBucketFilter(t.key)  // local state only
BudgetPage: buSu state = 'BU' (hardcoded)                   // never changes
Grid API:   ?buSu=BU                                        // always BU
```
The Navigator's `onBucketChange` callback exists but BudgetPage doesn't pass a handler that updates `buSu`.

### 2. Group selection → shows all departments
```
selection = { groupId: "2", deptId: "all" }
filteredDepts = selection.deptId !== 'all' 
    ? depts.filter(d => d.id === selection.deptId)  // deptId is "all", skip filter
    : depts                                          // shows ALL departments
```
The filter shows ALL departments when a group is selected, not just that group's departments. Need to also filter by `groupId`.

### 3. Navigator "All" → Grid "BU" mismatch
Navigator default shows All (BU + SU groups). Grid always fetches BU. Result: navigator shows groups that have no data in the grid.

---

## Fix Plan

### Fix 1: Connect Navigator bucket tabs to Grid filter

**BudgetPage.tsx:**
```tsx
// Add handler for navigator bucket change
const handleBucketChange = (bucket: 'BU' | 'SU' | 'all') => {
  if (bucket === 'all') {
    // For 'all', don't filter by bucket type — fetch both
    setBuSu('BU') // or remove filter from API call
  } else {
    setBuSu(bucket)
  }
}

// Pass to navigator
<BudgetNavigator onBucketChange={handleBucketChange} ... />
```

**Grid API:** When `buSu` is not passed or is 'all', don't apply bucket filter.

### Fix 2: Group selection filters grid by group departments

**BudgetPage.tsx:**
```tsx
const filteredDepts = useMemo(() => {
  if (!selection) return depts // Overview — show all
  
  if (selection.deptId === 'all') {
    // Group selected — filter to that group's departments
    const group = navGroups.find(g => g.id === selection.groupId)
    if (!group) return depts
    const deptIds = new Set(group.departments.map(d => d.id))
    return depts.filter(d => deptIds.has(d.id))
  }
  
  // Specific department selected
  return depts.filter(d => d.id === selection.deptId)
}, [depts, selection, navGroups])
```

### Fix 3: Add month filter (optional, restore from original)

The original BudgetPage had a month selector. Restore it so users can see cumulative execution by month.

### Fix 4: Normalize default state

- Default: `buSu = 'BU'`, `selection = null` (Overview), year = 2026
- Navigator starts collapsed (showNav = false)
- Navigator All/BU/SU syncs with grid buSu parameter

---

## Data Flow (After Fix)

```
User clicks "IT & Cloud" group in Navigator
  → selection = { groupId: "2", deptId: "all" }
  → filteredDepts = depts WHERE deptId IN ("3","4")  // GENISYS + AGMUX
  → KPI cards show IT & Cloud summary
  → Grid shows 2 departments

User clicks "GENISYS - CLOUD" in Navigator
  → selection = { groupId: "2", deptId: "3" }
  → filteredDepts = depts WHERE deptId === "3"  // GENISYS only
  → KPI cards show GENISYS summary
  → Grid shows 1 department

User clicks "Overview"
  → selection = null
  → filteredDepts = depts (all 7)
  → Grid shows all

User clicks "SU" tab in Navigator
  → onBucketChange('SU') → setBuSu('SU')
  → Grid refetches with ?buSu=SU
  → Navigator shows only SU groups (DG, Admin & Fin)
  → KPI cards recalculate for SU only
```

---

## Files to Change

| File | Change |
|------|--------|
| `BudgetPage.tsx` | Connect `onBucketChange`, fix `filteredDepts` logic, add month, remove edit mode remnants |
| `BudgetsController.cs` | Handle `buSu=all` (no filter), add month parameter |

---

## Implementation Order

1. Fix `filteredDepts` — group selection shows correct departments (5 min)
2. Connect `onBucketChange` — navigator tabs sync with grid (5 min)
3. Add month filter back — restore from original (10 min)
4. Clean up edit mode remnants — remove Edit button + save/draft (5 min)
5. Verify all 4 click combinations work (10 min)
