'use client'

import { useState, useCallback } from 'react'
import { Settings2, X, Eye, EyeOff } from 'lucide-react'
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
import { departments } from '@/lib/mock-data'

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
  { id: 'overspent-table',  label: 'Top Overspent Categories',   description: 'Categories currently exceeding approved budget' },
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
  const [view, setView] = useState<'BU' | 'SU'>('BU')
  const [panelOpen, setPanelOpen] = useState(false)
  const [visible, setVisible] = useState<Set<WidgetId>>(loadVisible)

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

  const visibleWidgets = WIDGETS.filter((w) => visible.has(w.id))

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <Select defaultValue="2026" className="h-9 w-28">
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </Select>
        <Select defaultValue="all" className="h-9 w-48">
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-md border border-border p-0.5">
            {(['BU', 'SU'] as const).map((option) => (
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
                {option}
              </Button>
            ))}
          </div>
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

      {/* KPI cards */}
      {visible.has('kpi-cards') && <KpiCards />}

      {/* Execution vs forecast + cost breakdown */}
      {visible.has('execution-forecast') && <DashboardCharts />}

      {/* Overspent categories table */}
      {visible.has('overspent-table') && <OverspentTable />}

      {/* Budget performance row */}
      {(visible.has('yearly-budget') || visible.has('monthly-budget')) && (
        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            visible.has('yearly-budget') && visible.has('monthly-budget')
              ? 'xl:grid-cols-2'
              : '',
          )}
        >
          {visible.has('yearly-budget') && <YearlyBudgetPerformance />}
          {visible.has('monthly-budget') && <MonthlyBudgetPerformance />}
        </div>
      )}

      {/* Costs analysis — full width */}
      {visible.has('costs-analysis') && <CostsAnalysis />}

      {/* Cost by dept — full width */}
      {visible.has('cost-by-dept') && <CostAnalysisByDept />}

      {/* Empty state */}
      {visible.size === 0 && (
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
