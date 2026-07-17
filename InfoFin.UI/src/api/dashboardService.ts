import { httpClient } from './httpClient'
import type { DashboardResponse } from '@/lib/dashboard-data'

export interface DashboardParams {
  year?: number
  buSu?: 'BU' | 'SU' | null
  month?: number | null
  departmentId?: number | null
}

export interface DeptOption {
  id: number
  name: string
}

export async function fetchDashboard(params: DashboardParams = {}): Promise<DashboardResponse> {
  const query: Record<string, unknown> = { year: params.year ?? 2026 }
  if (params.buSu) query.buSu = params.buSu
  if (params.month != null) query.month = params.month
  if (params.departmentId != null) query.departmentId = params.departmentId
  const { data } = await httpClient.get<DashboardResponse>('/api/dashboard', { params: query })
  return data
}

export async function fetchDashboardDepartments(): Promise<DeptOption[]> {
  try {
    const { data } = await httpClient.get<DeptOption[]>('/api/dashboard/departments')
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to fetch dashboard departments:', err)
    return []
  }
}
