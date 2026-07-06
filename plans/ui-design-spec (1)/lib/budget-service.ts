import 'server-only'
import { db } from '@/lib/db'
import {
  budgetGroups,
  budgetDepartments,
  budgetLineItems,
  budgetValues,
} from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import {
  departmentGroups as seedGroups,
  type BucketType,
  type SectionType,
  type ClassificationType,
  type BudgetSection,
  type BudgetLineItem,
  type Department,
  type DepartmentGroup,
} from '@/lib/budget-data'
import { SEED_YEARS } from '@/lib/budget-shared'

// ─── Row shapes ────────────────────────────────────────────────────────────────

type GroupRow = typeof budgetGroups.$inferSelect
type DeptRow = typeof budgetDepartments.$inferSelect
type ItemRow = typeof budgetLineItems.$inferSelect

// A stable id for a template line item derived from its position in the group.
function lineItemId(groupId: string, section: string, cls: string | null, idx: number) {
  return `${groupId}::${section}::${cls ?? 'flat'}::${idx}`
}

// ─── Seeding ────────────────────────────────────────────────────────────────────

async function seedIfEmpty() {
  const existing = await db.select({ id: budgetGroups.id }).from(budgetGroups).limit(1)
  if (existing.length > 0) return

  const groupsToInsert: (typeof budgetGroups.$inferInsert)[] = []
  const deptsToInsert: (typeof budgetDepartments.$inferInsert)[] = []
  const itemsToInsert: (typeof budgetLineItems.$inferInsert)[] = []
  const valuesToInsert: (typeof budgetValues.$inferInsert)[] = []

  // Per-year scaling so switching years shows distinct numbers.
  const yearScale: Record<number, number> = {}
  for (const y of SEED_YEARS) yearScale[y] = y === 2026 ? 1 : y === 2025 ? 0.92 : 0.84

  seedGroups.forEach((group, gi) => {
    groupsToInsert.push({
      id: group.id,
      name: group.name,
      bucketType: group.bucketType,
      sortOrder: gi,
    })

    group.departments.forEach((dept, di) => {
      deptsToInsert.push({
        id: dept.id,
        groupId: group.id,
        name: dept.name,
        sortOrder: di,
      })
    })

    // Build line items from the first department's structure (shared across the group).
    const template = group.departments[0]
    let order = 0
    for (const section of template.sections) {
      if (section.items) {
        section.items.forEach((it, idx) => {
          const id = lineItemId(group.id, section.type, null, idx)
          itemsToInsert.push({
            id,
            groupId: group.id,
            section: section.type,
            classification: null,
            label: it.label,
            sortOrder: order++,
          })
        })
      }
      if (section.classifications) {
        for (const cls of section.classifications) {
          cls.items.forEach((it, idx) => {
            const id = lineItemId(group.id, section.type, cls.type, idx)
            itemsToInsert.push({
              id,
              groupId: group.id,
              section: section.type,
              classification: cls.type,
              label: it.label,
              sortOrder: order++,
            })
          })
        }
      }
    }

    // Values: for each department, map its item at the same (section, cls, idx).
    group.departments.forEach((dept) => {
      for (const section of dept.sections) {
        const writeItem = (it: BudgetLineItem, cls: string | null, idx: number) => {
          const id = lineItemId(group.id, section.type, cls, idx)
          for (const year of SEED_YEARS) {
            const scale = yearScale[year]
            valuesToInsert.push({
              lineItemId: id,
              departmentId: dept.id,
              year,
              forecast: String(Math.round(it.forecast * scale)),
              execution: String(Math.round(it.execution * scale)),
            })
          }
        }
        if (section.items) section.items.forEach((it, idx) => writeItem(it, null, idx))
        if (section.classifications) {
          for (const cls of section.classifications) {
            cls.items.forEach((it, idx) => writeItem(it, cls.type, idx))
          }
        }
      }
    })
  })

  await db.transaction(async (tx) => {
    if (groupsToInsert.length) await tx.insert(budgetGroups).values(groupsToInsert)
    if (deptsToInsert.length) await tx.insert(budgetDepartments).values(deptsToInsert)
    if (itemsToInsert.length) await tx.insert(budgetLineItems).values(itemsToInsert)
    // Chunk value inserts to stay within parameter limits.
    for (let i = 0; i < valuesToInsert.length; i += 500) {
      await tx.insert(budgetValues).values(valuesToInsert.slice(i, i + 500))
    }
  })
}

// ─── Tree assembly ──────────────────────────────────────────────────────────────

function buildDepartment(
  dept: DeptRow,
  items: ItemRow[],
  valueMap: Map<string, { forecast: number; execution: number }>,
): Department {
  const key = (itemId: string) => `${itemId}|${dept.id}`
  const val = (itemId: string) =>
    valueMap.get(key(itemId)) ?? { forecast: 0, execution: 0 }

  const bySection = new Map<SectionType, ItemRow[]>()
  for (const it of items) {
    const arr = bySection.get(it.section as SectionType) ?? []
    arr.push(it)
    bySection.set(it.section as SectionType, arr)
  }

  const sectionOrder: SectionType[] = ['REVENUES', 'COS', 'FIXED_COSTS', 'VARIABLE_COSTS']
  const sections: BudgetSection[] = []

  for (const sectionType of sectionOrder) {
    const rows = bySection.get(sectionType)
    if (!rows || rows.length === 0) continue

    const isClassified = sectionType === 'FIXED_COSTS' || sectionType === 'VARIABLE_COSTS'
    if (!isClassified) {
      sections.push({
        type: sectionType,
        items: rows.map((r) => ({
          id: r.id,
          label: r.label,
          ...val(r.id),
        })),
      })
    } else {
      const clsOrder: ClassificationType[] = ['ADMIN_FIN', 'TECH_OPS', 'MKT_SALES']
      const byCls = new Map<ClassificationType, ItemRow[]>()
      for (const r of rows) {
        const c = (r.classification ?? 'ADMIN_FIN') as ClassificationType
        const arr = byCls.get(c) ?? []
        arr.push(r)
        byCls.set(c, arr)
      }
      sections.push({
        type: sectionType,
        classifications: clsOrder
          .filter((c) => (byCls.get(c)?.length ?? 0) > 0)
          .map((c) => ({
            type: c,
            items: (byCls.get(c) ?? []).map((r) => ({
              id: r.id,
              label: r.label,
              ...val(r.id),
            })),
          })),
      })
    }
  }

  return { id: dept.id, name: dept.name, sections }
}

export async function getBudgetTree(year: number): Promise<DepartmentGroup[]> {
  await seedIfEmpty()

  const [groups, depts, items, values] = await Promise.all([
    db.select().from(budgetGroups).orderBy(budgetGroups.sortOrder),
    db.select().from(budgetDepartments).orderBy(budgetDepartments.sortOrder),
    db.select().from(budgetLineItems).orderBy(budgetLineItems.sortOrder),
    db.select().from(budgetValues).where(eq(budgetValues.year, year)),
  ])

  const valueMap = new Map<string, { forecast: number; execution: number }>()
  for (const v of values) {
    valueMap.set(`${v.lineItemId}|${v.departmentId}`, {
      forecast: Number(v.forecast),
      execution: Number(v.execution),
    })
  }

  const itemsByGroup = new Map<string, ItemRow[]>()
  for (const it of items) {
    const arr = itemsByGroup.get(it.groupId) ?? []
    arr.push(it)
    itemsByGroup.set(it.groupId, arr)
  }

  const deptsByGroup = new Map<string, DeptRow[]>()
  for (const d of depts) {
    const arr = deptsByGroup.get(d.groupId) ?? []
    arr.push(d)
    deptsByGroup.set(d.groupId, arr)
  }

  return (groups as GroupRow[]).map((g) => ({
    id: g.id,
    name: g.name,
    bucketType: g.bucketType as BucketType,
    departments: (deptsByGroup.get(g.id) ?? []).map((d) =>
      buildDepartment(d, itemsByGroup.get(g.id) ?? [], valueMap),
    ),
  }))
}
