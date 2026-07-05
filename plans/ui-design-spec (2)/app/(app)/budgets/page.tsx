'use client'

import { useMemo, useState } from 'react'
import { PanelLeftOpen, PanelLeftClose, Upload, TrendingUp, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useSession } from '@/components/session-provider'
import {
  departmentGroups,
  YEARS,
  getDeptSummary,
  execPct,
  type Department,
  type DepartmentGroup,
} from '@/lib/budget-data'
import { BUGrid, SUGrid } from '@/components/budget/budget-grid'
import { BudgetNavigator, type Selection } from '@/components/budget/budget-navigator'

// ─── Format ───────────────────────────────────────────────────────────────────

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

// ─── Minimalist stat chip ─────────────────────────────────────────────────────

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
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn('text-lg font-bold tabular-nums leading-none', accent ?? 'text-foreground')}>
        {value}
      </span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BudgetsPage() {
  const { role } = useSession()
  const isAdmin = role === 'Admin' || role === 'FP&A'

  const [navOpen, setNavOpen] = useState(true)
  const [year, setYear] = useState('2026')
  const [selection, setSelection] = useState<Selection>({
    groupId: departmentGroups[0].id,
    deptId: 'all',
  })

  const group: DepartmentGroup = useMemo(
    () => departmentGroups.find((g) => g.id === selection.groupId) ?? departmentGroups[0],
    [selection.groupId],
  )
  const isBU = group.bucketType === 'BU'

  const visibleDepts: Department[] = useMemo(
    () =>
      selection.deptId === 'all'
        ? group.departments
        : group.departments.filter((d) => d.id === selection.deptId),
    [group, selection.deptId],
  )

  const summary = useMemo(() => {
    return visibleDepts.reduce(
      (acc, d) => {
        const s = getDeptSummary(d, group.bucketType)
        return {
          rev:  { f: acc.rev.f  + s.rev.forecast,         e: acc.rev.e  + s.rev.execution },
          gm:   { f: acc.gm.f   + s.grossMargin.forecast,  e: acc.gm.e   + s.grossMargin.execution },
          opex: { f: acc.opex.f + s.opex.forecast,         e: acc.opex.e + s.opex.execution },
          ebit: { f: acc.ebit.f + s.ebit.forecast,         e: acc.ebit.e + s.ebit.execution },
        }
      },
      { rev: { f: 0, e: 0 }, gm: { f: 0, e: 0 }, opex: { f: 0, e: 0 }, ebit: { f: 0, e: 0 } },
    )
  }, [visibleDepts, group.bucketType])

  const opexPct  = execPct(summary.opex.f,  summary.opex.e)
  const deptLabel =
    selection.deptId === 'all'
      ? `${visibleDepts.length} department${visibleDepts.length !== 1 ? 's' : ''}`
      : visibleDepts[0]?.name

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNavOpen((v) => !v)}
          aria-pressed={navOpen}
          className="gap-1.5"
        >
          {navOpen
            ? <PanelLeftClose className="size-4" />
            : <PanelLeftOpen className="size-4" />}
          Navigator
        </Button>

        <Select value={year} onChange={(e) => setYear(e.target.value)} className="h-9 w-24">
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </Select>

        {/* BU / SU badge */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            isBU
              ? 'bg-primary/10 text-primary'
              : 'bg-success/10 text-success',
          )}
        >
          {isBU
            ? <TrendingUp className="size-3" />
            : <Layers className="size-3" />}
          {isBU ? 'Business Unit — Full P&L' : 'Support Unit — OPEX'}
        </span>

        {isAdmin && (
          <Button size="sm" className="ml-auto gap-1.5">
            <Upload className="size-4" />
            Upload Budget
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="flex items-start gap-4">
        {/* Floating navigator */}
        {navOpen && (
          <div className="sticky top-4 shrink-0">
            <BudgetNavigator
              selection={selection}
              onSelect={setSelection}
              onClose={() => setNavOpen(false)}
            />
          </div>
        )}

        <div className="min-w-0 flex-1 flex flex-col gap-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-3.5">
            <div>
              <h2 className="text-sm font-bold tracking-tight">{group.name}</h2>
              <p className="text-[11px] text-muted-foreground">{deptLabel} · FY {year}</p>
            </div>

            <div className="flex items-center divide-x divide-border">
              {isBU && (
                <>
                  <Stat
                    label="Revenue"
                    value={fmtK(summary.rev.f)}
                    sub={`${fmtK(summary.rev.e)} to date`}
                  />
                  <Stat
                    label="Gross Margin"
                    value={fmtK(summary.gm.f)}
                    sub={`${fmtK(summary.gm.e)} to date`}
                  />
                </>
              )}
              <Stat
                label="Total OPEX"
                value={fmtK(summary.opex.f)}
                sub={`${fmtK(summary.opex.e)} spent`}
              />
              {isBU ? (
                <Stat
                  label="EBIT"
                  value={fmtK(summary.ebit.f)}
                  sub={`${fmtK(summary.ebit.e)} to date`}
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
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    OPEX Burn
                  </span>
                  <span className={cn('text-lg font-bold tabular-nums leading-none', healthText(opexPct))}>
                    {opexPct}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          {isBU ? (
            <BUGrid departments={visibleDepts} />
          ) : (
            <SUGrid departments={visibleDepts} />
          )}
        </div>
      </div>
    </div>
  )
}
