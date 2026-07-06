import type {
  DepartmentGroup,
  Department,
  BudgetSection,
  BudgetLineItem,
  SectionType,
  ClassificationType,
} from '@/lib/budget-data'
import type { SaveBudgetPayload, LineItemDraft, ValueDraft } from '@/lib/budget-shared'

export function cloneGroups(groups: DepartmentGroup[]): DepartmentGroup[] {
  return structuredClone(groups)
}

function findGroup(groups: DepartmentGroup[], groupId: string) {
  return groups.find((g) => g.id === groupId)
}

/** Walk every line item in a department, calling cb with its containing array + index. */
function forEachItem(
  dept: Department,
  cb: (item: BudgetLineItem, arr: BudgetLineItem[], idx: number, section: BudgetSection) => void,
) {
  for (const section of dept.sections) {
    if (section.items) section.items.forEach((it, i) => cb(it, section.items!, i, section))
    if (section.classifications) {
      for (const cls of section.classifications) {
        cls.items.forEach((it, i) => cb(it, cls.items, i, section))
      }
    }
  }
}

// ─── Value edit (per department) ────────────────────────────────────────────────

export function setValue(
  groups: DepartmentGroup[],
  groupId: string,
  deptId: string,
  itemId: string,
  field: 'forecast' | 'execution',
  value: number,
): DepartmentGroup[] {
  const next = cloneGroups(groups)
  const dept = findGroup(next, groupId)?.departments.find((d) => d.id === deptId)
  if (dept) {
    forEachItem(dept, (item) => {
      if (item.id === itemId) item[field] = value
    })
  }
  return next
}

// ─── Rename (all departments) ───────────────────────────────────────────────────

export function renameItem(
  groups: DepartmentGroup[],
  groupId: string,
  itemId: string,
  label: string,
): DepartmentGroup[] {
  const next = cloneGroups(groups)
  const group = findGroup(next, groupId)
  group?.departments.forEach((dept) => {
    forEachItem(dept, (item) => {
      if (item.id === itemId) item.label = label
    })
  })
  return next
}

// ─── Delete (all departments) ───────────────────────────────────────────────────

export function deleteItem(
  groups: DepartmentGroup[],
  groupId: string,
  itemId: string,
): DepartmentGroup[] {
  const next = cloneGroups(groups)
  const group = findGroup(next, groupId)
  group?.departments.forEach((dept) => {
    for (const section of dept.sections) {
      if (section.items) section.items = section.items.filter((it) => it.id !== itemId)
      if (section.classifications) {
        for (const cls of section.classifications) {
          cls.items = cls.items.filter((it) => it.id !== itemId)
        }
      }
    }
  })
  return next
}

// ─── Add (all departments) ──────────────────────────────────────────────────────

export function addItem(
  groups: DepartmentGroup[],
  groupId: string,
  section: SectionType,
  classification: ClassificationType | null,
  label: string,
): { groups: DepartmentGroup[]; newId: string } {
  const next = cloneGroups(groups)
  const newId = `new-${crypto.randomUUID()}`
  const group = findGroup(next, groupId)
  group?.departments.forEach((dept) => {
    const sec = dept.sections.find((s) => s.type === section)
    if (!sec) return
    const row: BudgetLineItem = { id: newId, label, forecast: 0, execution: 0 }
    if (classification && sec.classifications) {
      const cls = sec.classifications.find((c) => c.type === classification)
      if (cls) cls.items.push(row)
    } else if (sec.items) {
      sec.items.push(row)
    }
  })
  return { groups: next, newId }
}

// ─── Serialize for save ─────────────────────────────────────────────────────────

export function buildSavePayload(
  groups: DepartmentGroup[],
  groupId: string,
  year: number,
  deletedLineItemIds: string[],
): SaveBudgetPayload {
  const group = findGroup(groups, groupId)
  const lineItems: LineItemDraft[] = []
  const values: ValueDraft[] = []

  if (group) {
    // Structure comes from the first department (rows are shared across the group).
    const template = group.departments[0]
    let order = 0
    if (template) {
      for (const section of template.sections) {
        const pushRow = (item: BudgetLineItem, cls: ClassificationType | null) => {
          lineItems.push({
            id: item.id,
            section: section.type,
            classification: cls,
            label: item.label,
            sortOrder: order++,
            isNew: item.id.startsWith('new-'),
          })
        }
        if (section.items) section.items.forEach((it) => pushRow(it, null))
        if (section.classifications) {
          for (const cls of section.classifications) {
            cls.items.forEach((it) => pushRow(it, cls.type))
          }
        }
      }
    }

    // Values across every department.
    for (const dept of group.departments) {
      forEachItem(dept, (item) => {
        values.push({
          lineItemId: item.id,
          departmentId: dept.id,
          forecast: item.forecast,
          execution: item.execution,
        })
      })
    }
  }

  return { groupId, year, lineItems, deletedLineItemIds, values }
}
