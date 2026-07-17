// ─────────────────────────────────────────────────────────────────────────────
// INFOFIN Dashboard Data Types
// Matches the response from GET /api/dashboard?year=&buSu=&month=
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardResponse {
  kpis: KpiData
  monthlyBars: MonthlyBar[]
  costBreakdown: PieSlice[]
  overspent: OverspentItem[]
  yearlyPerformance: BudgetLine[]
  costsAnalysis: CostGroup[]
  costByDept: DeptCost[]
}

export interface KpiData {
  totalBudget: number
  totalSpent: number
  remaining: number
  ebit: number
}

export interface MonthlyBar {
  month: string
  revenue: number
  opex: number
}

export interface PieSlice {
  name: string
  value: number
}

export interface OverspentItem {
  account: string
  department: string
  budget: number
  spent: number
}

export interface BudgetLine {
  label: string
  forecast: number
  todate: number
  execution: number
  pct: number
  emphasis?: boolean
}

export interface CostGroup {
  name: string
  todate: number
  execution: number
}

export interface DeptCost {
  department: string
  forecast: number
  todate: number
  execution: number
  pct: number
}
