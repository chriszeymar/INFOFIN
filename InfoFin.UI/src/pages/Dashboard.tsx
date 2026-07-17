'use client'

import { useState, useCallback, useEffect } from 'react'
import { Settings2, X, Eye, EyeOff, Loader2, Download, FileText } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { OverspentTable } from '@/components/dashboard/overspent-table'
import { BasicDashboard } from '@/components/dashboard/basic-dashboard'
import {
  YearlyBudgetPerformance,
  MonthlyBudgetPerformance,
  CostsAnalysis,
  CostAnalysisByDept,
} from '@/components/dashboard/finance-charts'
import { useSession } from '@/auth/AuthContext'
import { fetchDashboard, fetchDashboardDepartments, type DeptOption } from '@/api/dashboardService'
import type { DashboardResponse } from '@/lib/dashboard-data'
import { exportDashboardToPdf } from '@/lib/export/dashboard-export-pdf'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const YEARS = [2026, 2025, 2024]
const MONTHS = [
  { value: null as number | null, label: 'All months' },
  { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' },
]

type WidgetId =
  | 'kpi-cards'
  | 'execution-forecast'
  | 'overspent-table'
  | 'yearly-budget'
  | 'monthly-budget'
  | 'costs-analysis'
  | 'cost-by-dept'

type Widget = {
  id: WidgetId
  label: string
  description: string
}

const WIDGETS: Widget[] = [
  { id: 'kpi-cards',        label: 'KPI Summary',                description: 'Total budget, spent, remaining and EBIT' },
  { id: 'execution-forecast', label: 'Execution vs Forecast',   description: 'Revenue and OPEX by month with cost breakdown donut' },
  { id: 'overspent-table',  label: 'Top Overspent Accounts',   description: 'Accounts currently exceeding approved budget' },
  { id: 'yearly-budget',    label: 'Yearly Budget Performance',  description: 'Forecast vs to-date vs execution for FY' },
  { id: 'monthly-budget',   label: 'Monthly Budget Performance', description: 'Current month budget snapshot' },
  { id: 'costs-analysis',   label: 'Costs Analysis',             description: 'To-date vs execution across cost groups' },
  { id: 'cost-by-dept',     label: 'Cost Analysis by Dept',      description: 'Execution per department' },
]

const DEFAULT_VISIBLE: WidgetId[] = ['kpi-cards', 'execution-forecast', 'overspent-table']
const STORAGE_KEY = 'dashboard-visible-widgets'

function loadVisible(): Set<WidgetId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const ids: unknown = JSON.parse(raw)
      if (Array.isArray(ids) && ids.every((id): id is WidgetId => typeof id === 'string')) {
        return new Set(ids as WidgetId[])
      }
    }
  } catch { /* ignore corrupt data */ }
  return new Set(DEFAULT_VISIBLE)
}

export default function DashboardPage() {
  const { isElevated } = useSession()
  const [year, setYear] = useState(2026)
  const [view, setView] = useState<'BU' | 'SU' | 'all'>('all')
  const [month, setMonth] = useState<number | null>(null)
  const [deptId, setDeptId] = useState<number | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [visible, setVisible] = useState<Set<WidgetId>>(loadVisible)

  // Dashboard data from API
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Department list for filter dropdown
  const [depts, setDepts] = useState<DeptOption[]>([])

  // Fetch department list on mount
  useEffect(() => {
    fetchDashboardDepartments().then(setDepts).catch(() => setDepts([]))
  }, [])

  // Fetch dashboard data when filters change
  useEffect(() => {
    setLoading(true)
    fetchDashboard({
      year,
      buSu: view === 'all' ? null : view,
      month,
      departmentId: deptId,
    })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [year, view, month, deptId])

  if (!isElevated) {
    return <BasicDashboard />
  }

  const toggle = useCallback((id: WidgetId) => {
    setVisible((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const deptName = deptId ? depts.find(d => d.id === deptId)?.name ?? '' : 'All Departments'
      await exportDashboardToPdf([...visible], {
        year,
        view,
        month,
        departmentName: deptName,
      })
    } catch (err) {
      console.error('Dashboard export failed:', err)
    } finally {
      setExporting(false)
    }
  }, [visible, year, view, month, deptId, depts])

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <Select
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-9 w-28"
        >
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </Select>
        <Select
          value={month === null ? 'all' : String(month)}
          onChange={(e) => {
            const v = e.target.value
            setMonth(v === 'all' ? null : Number(v))
          }}
          className="h-9 w-36"
        >
          <option value="all">YTD (all months)</option>
          {MONTHS.filter(m => m.value !== null).map((m) => (
            <option key={m.value} value={String(m.value)}>
              Through {m.label}
            </option>
          ))}
        </Select>
        <Select
          value={deptId === null ? 'all' : String(deptId)}
          onChange={(e) => {
            const v = e.target.value
            setDeptId(v === 'all' ? null : Number(v))
          }}
          className="h-9 w-52"
        >
          <option value="all">All Departments</option>
          {depts.map((d) => (
            <option key={d.id} value={String(d.id)}>{d.name}</option>
          ))}
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-md border border-border p-0.5">
            {(['all', 'BU', 'SU'] as const).map((option) => (
              <Button
                key={option}
                variant="ghost"
                size="sm"
                onClick={() => setView(option)}
                className={cn(
                  'rounded-[6px]',
                  view === option && 'bg-primary text-primary-foreground',
                )}
              >
                {option === 'all' ? 'All' : option}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting || !data || visible.size === 0}
            className="gap-2"
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPanelOpen((v) => !v)}
            className={cn(
              'gap-2',
              panelOpen && 'border-primary text-primary',
            )}
          >
            <Settings2 className="size-4" />
            Customise
            {visible.size > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                {visible.size}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Customise panel */}
      {panelOpen && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Customise Dashboard</p>
              <p className="text-xs text-muted-foreground">
                Choose which charts and tables appear on your dashboard
              </p>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {WIDGETS.map((w) => {
              const on = visible.has(w.id)
              return (
                <button
                  key={w.id}
                  onClick={() => toggle(w.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors',
                    on
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background text-foreground hover:border-muted-foreground/40 hover:bg-muted/40',
                  )}
                >
                  {on ? (
                    <Eye className="size-3.5 shrink-0" />
                  ) : (
                    <EyeOff className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate font-medium">{w.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading dashboard…</span>
        </div>
      )}

      {/* No data state */}
      {!loading && !data && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <p className="text-sm font-medium text-muted-foreground">No dashboard data available</p>
          <p className="text-xs text-muted-foreground/70">
            Ensure Odoo Sync has been run for the selected year.
          </p>
        </div>
      )}

      {/* Widgets — only render when data is loaded */}
      {!loading && data && (
        <>
          {/* KPI cards */}
          {visible.has('kpi-cards') && (
            <div data-widget="kpi-cards">
              <KpiCards data={data.kpis} />
            </div>
          )}

          {/* Execution vs forecast + cost breakdown */}
          {visible.has('execution-forecast') && (
            <div data-widget="execution-forecast">
              <DashboardCharts monthlyBars={data.monthlyBars} costBreakdown={data.costBreakdown} />
            </div>
          )}

          {/* Overspent categories table */}
          {visible.has('overspent-table') && (
            <div data-widget="overspent-table">
              <OverspentTable data={data.overspent} />
            </div>
          )}

          {/* Budget performance row */}
          {(visible.has('yearly-budget') || visible.has('monthly-budget')) && (
            <div
              data-widget="budget-performance"
              className={cn(
                'grid grid-cols-1 gap-4',
                visible.has('yearly-budget') && visible.has('monthly-budget')
                  ? 'xl:grid-cols-2'
                  : '',
              )}
            >
              {visible.has('yearly-budget') && (
                <div data-widget="yearly-budget">
                  <YearlyBudgetPerformance data={data.yearlyPerformance} />
                </div>
              )}
              {visible.has('monthly-budget') && (
                <div data-widget="monthly-budget">
                  <MonthlyBudgetPerformance data={data.yearlyPerformance} />
                </div>
              )}
            </div>
          )}

          {/* Costs analysis — full width */}
          {visible.has('costs-analysis') && (
            <div data-widget="costs-analysis">
              <CostsAnalysis data={data.costsAnalysis} />
            </div>
          )}

          {/* Cost by dept — full width */}
          {visible.has('cost-by-dept') && (
            <div data-widget="cost-by-dept">
              <CostAnalysisByDept data={data.costByDept} />
            </div>
          )}
        </>
      )}

      {/* Empty widgets state */}
      {!loading && data && visible.size === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <Settings2 className="size-9 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No widgets visible
          </p>
          <p className="text-xs text-muted-foreground/70">
            Open Customise to add charts and tables to your dashboard.
          </p>
          <button
            onClick={() => setPanelOpen(true)}
            className="mt-1 text-xs font-medium text-primary hover:underline"
          >
            Open Customise
          </button>
        </div>
      )}
    </div>
  )
}
