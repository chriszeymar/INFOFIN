'use client'

import { cn } from '@/lib/utils'
import type { Department, BucketType } from '@/lib/budget-data'
import { getDeptSummary, execPct } from '@/lib/budget-data'

interface BudgetKPICardsProps {
  groupName: string
  deptCount: number
  year: number
  month: number | null
  bucketType: BucketType | 'all'
  departments: Department[]
  editing?: boolean
}

function periodLabel(month: number | null): string {
  if (month === null) return 'to date'
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `Jan–${names[month] ?? month}`
}

function fmtK(n: number) {
  if (n === 0) return '$0'
  const abs = Math.abs(n)
  const s =
    abs >= 1_000_000
      ? `$${(abs / 1_000_000).toFixed(1)}M`
      : abs >= 1_000
      ? `$${(abs / 1_000).toFixed(0)}K`
      : `$${abs}`
  return n < 0 ? `-${s}` : s
}

function healthText(pct: number | null) {
  if (pct === null) return 'text-muted-foreground'
  if (pct > 100) return 'text-destructive'
  if (pct >= 80) return 'text-warning'
  return 'text-success'
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 first:pl-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn('text-lg font-bold tabular-nums leading-none', accent ?? 'text-foreground')}>{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  )
}

export function BudgetKPICards({ groupName, deptCount, year, month, bucketType, departments, editing }: BudgetKPICardsProps) {
  if (departments.length === 0) return null

  const isBU = bucketType === 'BU' || bucketType === 'all'
  const period = periodLabel(month)

  // Aggregate across all departments (use 'BU' for getDeptSummary — same math, 'all' depts may lack rev/cos)
  const effectiveType: BucketType = bucketType === 'all' ? 'BU' : bucketType

  const summary = departments.reduce(
    (acc, d) => {
      const s = getDeptSummary(d, effectiveType)
      return {
        rev: { f: acc.rev.f + s.rev.forecast, e: acc.rev.e + s.rev.execution },
        gm: { f: acc.gm.f + s.grossMargin.forecast, e: acc.gm.e + s.grossMargin.execution },
        opex: { f: acc.opex.f + s.opex.forecast, e: acc.opex.e + s.opex.execution },
        ebit: { f: acc.ebit.f + s.ebit.forecast, e: acc.ebit.e + s.ebit.execution },
      }
    },
    {
      rev: { f: 0, e: 0 },
      gm: { f: 0, e: 0 },
      opex: { f: 0, e: 0 },
      ebit: { f: 0, e: 0 },
    },
  )

  const opexPct = execPct(summary.opex.f, summary.opex.e)

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-3.5">
      {/* Left: group header */}
      <div>
        <h2 className="text-base font-bold tracking-tight">{groupName || 'Budgets'}</h2>
        <p className="text-sm text-muted-foreground">
          {deptCount} department{deptCount !== 1 ? 's' : ''} · FY {year}
          {editing && <span className="ml-1.5 font-semibold text-primary">· Draft</span>}
        </p>
      </div>

      {/* Right: stat chips */}
      <div className="flex items-center divide-x divide-border">
        {isBU && (
          <>
            <Stat label="Revenue" value={fmtK(summary.rev.f)} sub={`${fmtK(summary.rev.e)} ${period}`} />
            <Stat label="Gross Margin" value={fmtK(summary.gm.f)} sub={`${fmtK(summary.gm.e)} ${period}`} />
          </>
        )}
        <Stat label="Total OPEX" value={fmtK(summary.opex.f)} sub={`${fmtK(summary.opex.e)} spent`} />
        {isBU ? (
          <Stat
            label="EBIT"
            value={fmtK(summary.ebit.f)}
            sub={`${fmtK(summary.ebit.e)} ${period}`}
            accent={summary.ebit.f < 0 ? 'text-destructive' : 'text-success'}
          />
        ) : (
          <Stat
            label="Variance"
            value={fmtK(summary.opex.f - summary.opex.e)}
            sub="budget − spent"
            accent={summary.opex.e > summary.opex.f ? 'text-destructive' : 'text-success'}
          />
        )}
        {opexPct !== null && (
          <div className="flex flex-col gap-0.5 px-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">OPEX Burn</span>
            <span className={cn('text-lg font-bold tabular-nums leading-none', healthText(opexPct))}>{opexPct}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
