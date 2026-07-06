'use server'

import { db } from '@/lib/db'
import {
  budgetLineItems,
  budgetValues,
} from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getBudgetTree } from '@/lib/budget-service'
import type { SaveBudgetPayload } from '@/lib/budget-shared'
import type { DepartmentGroup } from '@/lib/budget-data'

export async function getBudgetTreeAction(year: number): Promise<DepartmentGroup[]> {
  return getBudgetTree(year)
}

export async function saveBudgetAction(payload: SaveBudgetPayload) {
  const { year, lineItems, deletedLineItemIds, values } = payload

  await db.transaction(async (tx) => {
    // 1. Remove deleted line items and every value that referenced them.
    if (deletedLineItemIds.length > 0) {
      await tx
        .delete(budgetValues)
        .where(inArray(budgetValues.lineItemId, deletedLineItemIds))
      await tx
        .delete(budgetLineItems)
        .where(inArray(budgetLineItems.id, deletedLineItemIds))
    }

    // 2. Upsert line items (new rows inserted, existing labels/order updated).
    for (const li of lineItems) {
      await tx
        .insert(budgetLineItems)
        .values({
          id: li.id,
          groupId: payload.groupId,
          section: li.section,
          classification: li.classification,
          label: li.label,
          sortOrder: li.sortOrder,
        })
        .onConflictDoUpdate({
          target: budgetLineItems.id,
          set: {
            label: li.label,
            section: li.section,
            classification: li.classification,
            sortOrder: li.sortOrder,
          },
        })
    }

    // 3. Upsert values for this year only.
    for (const v of values) {
      await tx
        .insert(budgetValues)
        .values({
          lineItemId: v.lineItemId,
          departmentId: v.departmentId,
          year,
          forecast: String(v.forecast),
          execution: String(v.execution),
        })
        .onConflictDoUpdate({
          target: [
            budgetValues.lineItemId,
            budgetValues.departmentId,
            budgetValues.year,
          ],
          set: {
            forecast: String(v.forecast),
            execution: String(v.execution),
          },
        })
    }
  })

  revalidatePath('/budgets')
  return { ok: true }
}
