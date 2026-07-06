import type { SectionType, ClassificationType } from '@/lib/budget-data'

export const SEED_YEARS = [2026, 2025, 2024] as const

// ─── Save payload (client → server action) ──────────────────────────────────────

export type LineItemDraft = {
  id: string
  section: SectionType
  classification: ClassificationType | null
  label: string
  sortOrder: number
  /** true for rows created client-side that don't exist in the DB yet */
  isNew?: boolean
}

export type ValueDraft = {
  lineItemId: string
  departmentId: string
  forecast: number
  execution: number
}

export type SaveBudgetPayload = {
  groupId: string
  year: number
  lineItems: LineItemDraft[]
  /** ids of line items removed in this edit session */
  deletedLineItemIds: string[]
  values: ValueDraft[]
}
