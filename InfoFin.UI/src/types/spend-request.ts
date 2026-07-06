// ── Canonical Spend Request types — matches C# backend exactly ──

// ── Reference / lookup entities ────────────────────────
export interface User {
  id: number
  email: string
  roleId: number
  departmentId: number | null
  isActive: boolean
  department?: Department
  role?: Role
}

export interface Role {
  id: number
  name: string
}

export interface Department {
  id: number
  name: string
  departmentGroupId: number
  isActive: boolean
}

export interface Category {
  id: number
  name: string
  financialGroupId: number
  classificationId: number | null
  isActive: boolean
}

export interface Currency {
  id: number
  code: string
  exchangeRateToUSD: number
}

export interface Vendor {
  id: number
  name: string
  isActive: boolean
}

// ── Status ──────────────────────────────────────────────
export type SpendRequestStatus =
  | 'Posted'
  | 'UnderReview'
  | 'Approved'
  | 'Completed'
  | 'Declined'

export const STATUS_META: Record<SpendRequestStatus, { label: string; variant: 'neutral' | 'default' | 'warning' | 'success' | 'danger' }> = {
  Posted:       { label: 'Posted', variant: 'default' },
  UnderReview:  { label: 'Under Review', variant: 'warning' },
  Approved:     { label: 'Approved', variant: 'success' },
  Completed:    { label: 'Completed', variant: 'neutral' },
  Declined:     { label: 'Declined', variant: 'danger' },
}

export const APPROVAL_STEPS = ['Posted', 'Under Review', 'Approved', 'Completed'] as const

// ── Core request ────────────────────────────────────────
export interface SpendRequest {
  id: number
  referenceNumber: string
  departmentId: number
  categoryId: number
  encoderId: number
  assignedToUserId: number | null
  amount: number
  currencyId: number
  lockedExchangeRate: number
  vendorId: number | null
  description: string
  status: SpendRequestStatus
  createDT: string
  updateDT: string

  // Navigation props (populated when includeNested=true)
  department?: Department
  category?: Category
  encoder?: User
  assignedToUser?: User | null
  currency?: Currency
  vendor?: Vendor | null
}

// ── History ─────────────────────────────────────────────
export interface SpendRequestHistory {
  id: number
  spendRequestId: number
  actionById: number
  oldStatus: string
  newStatus: string
  comments: string | null
  createDT: string
}

// ── Attachment ──────────────────────────────────────────
export interface SpendRequestAttachment {
  id: number
  spendRequestId: number
  fileUrl: string
  fileName: string
  uploadedByUserId: number
  createDT: string
}

// ── Payloads ────────────────────────────────────────────
export interface CreateSpendRequestPayload {
  departmentId: number
  categoryId: number
  amount: number
  currencyId: number
  vendorId?: number | null
  assignedToUserId?: number | null
  description: string
}

export interface TransitionSpendRequestPayload {
  newStatus: string
  comments?: string
}

// ── Grid row (flattened for list display) ───────────────
export interface SpendRequestGridRow {
  id: number
  referenceNumber: string
  departmentName: string
  categoryName: string
  amount: number
  currencyCode: string
  status: SpendRequestStatus
  createdByEmail: string
  assignedToEmail: string | null
  createDT: string
}

// ── Helpers ─────────────────────────────────────────────
export function flattenSpendRequest(r: SpendRequest): SpendRequestGridRow {
  return {
    id: r.id,
    referenceNumber: r.referenceNumber,
    departmentName: r.department?.name ?? `Dept #${r.departmentId}`,
    categoryName: r.category?.name ?? `Cat #${r.categoryId}`,
    amount: r.amount,
    currencyCode: r.currency?.code ?? 'USD',
    status: r.status,
    createdByEmail: r.encoder?.email ?? `User #${r.encoderId}`,
    assignedToEmail: r.assignedToUser?.email ?? null,
    createDT: r.createDT,
  }
}

export function formatCurrency(amount: number, currencyCode?: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode === 'FC' ? 'CDF' : currencyCode ?? 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
