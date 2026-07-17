import { httpClient } from './httpClient'
import type {
  SpendRequest,
  SpendRequestHistory,
  SpendRequestAttachment,
  CreateSpendRequestPayload,
  TransitionSpendRequestPayload,
  Department,
  Account,
  Currency,
  Vendor,
  User,
} from '@/types/spend-request'

// ── Spend Requests ──────────────────────────────────────
export async function getSpendRequests(status?: string): Promise<SpendRequest[]> {
  const { data } = await httpClient.get<SpendRequest[]>('/api/SpendRequests', {
    params: status ? { status } : undefined,
  })
  return data
}

export async function getSpendRequestById(id: number): Promise<SpendRequest> {
  const { data } = await httpClient.get<SpendRequest>(`/api/SpendRequests/${id}`)
  return data
}

export async function createSpendRequest(
  payload: CreateSpendRequestPayload,
): Promise<SpendRequest> {
  const { data } = await httpClient.post<SpendRequest>('/api/SpendRequests', payload)
  return data
}

export async function transitionSpendRequest(
  id: number,
  payload: TransitionSpendRequestPayload,
): Promise<SpendRequest> {
  const { data } = await httpClient.post<SpendRequest>(
    `/api/SpendRequests/${id}/transition`,
    payload,
  )
  return data
}

// ── History ─────────────────────────────────────────────
export async function getSpendRequestHistories(
  spendRequestId: number,
): Promise<SpendRequestHistory[]> {
  const { data } = await httpClient.get<SpendRequestHistory[]>(
    '/api/SpendRequestHistories',
    { params: { spendRequestId } },
  )
  return data
}

// ── Attachments ─────────────────────────────────────────
export async function getSpendRequestAttachments(
  spendRequestId: number,
): Promise<SpendRequestAttachment[]> {
  const { data } = await httpClient.get<SpendRequestAttachment[]>(
    '/api/SpendRequestAttachments',
    { params: { spendRequestId } },
  )
  return data
}

// ── Lookups ─────────────────────────────────────────────
export async function getDepartments(): Promise<Department[]> {
  const { data } = await httpClient.get<Department[]>('/api/departments', {
    params: { isActive: true },
  })
  return data
}

export async function getAccounts(): Promise<Category[]> {
  const { data } = await httpClient.get<Category[]>('/api/accounts', {
    params: { isActive: true },
  })
  return data
}

export async function getCurrencies(): Promise<Currency[]> {
  const { data } = await httpClient.get<Currency[]>('/api/currencies')
  return data
}

export async function getVendors(): Promise<Vendor[]> {
  const { data } = await httpClient.get<Vendor[]>('/api/vendors')
  return data
}

export async function getUsers(params?: {
  roleId?: number
  departmentId?: number
  isActive?: boolean
}): Promise<User[]> {
  const { data } = await httpClient.get<User[]>('/api/users', { params })
  return data
}
