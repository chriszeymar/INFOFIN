'use client'

import { useState } from 'react'
import { ChevronDown, BarChart3, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  departmentGroups,
  BUCKET_GROUPS,
  getDeptSummary,
  execPct,
  type DepartmentGroup,
  type BucketType,
} from '@/lib/budget-data'

export type Selection = { groupId: string; deptId: string | 'all' }
type BucketFilter = 'ALL' | 'BU' | 'SU'

// ─── Per-group distinct bar colours ────────────────────────────────────────────
const GROUP_BAR: Record<string, string> = {
  'banking-digital': 'bg-[#2563eb]',
  'it-cloud': 'bg-[#0891b2]',
  'dg-admin-fin': 'bg-[#059669]',
  'operations': 'bg-[#d97706]',
}

const GROUP_DOT: Record<string, string> = {
  'banking-digital': 'bg-[#2563eb]',
  'it-cloud': 'bg-[#0891b2]',
  'dg-admin-fin': 'bg-[#059669]',
  'operations': 'bg-[#d97706]',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function healthColor(pct: number | null) {
  if (pct === null) return 'text-muted-foreground/50'
  if (pct > 100) return 'text-destructive'
  if (pct >= 80) return 'text-warning'
  return 'text-success'
}

function groupBurn(group: DepartmentGroup) {
  return group.departments.reduce(
    (acc, d) => {
      const s = getDeptSummary(d, group.bucketType)
      return { forecast: acc.forecast + s.opex.forecast, execution: acc.execution + s.opex.execution }
    },
    { forecast: 0, execution: 0 },
  )
}

function deptOpex(group: DepartmentGroup, deptId: string) {
  const dept = group.departments.find((d) => d.id === deptId)!
  return getDeptSummary(dept, group.bucketType).opex
}

// ─── Mini bar ─────────────────────────────────────────────────────────────────

function Bar({ pct, colour }: { pct: number | null; colour: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={cn('h-full rounded-full transition-all duration-300', colour)}
        style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
      />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetNavigator({
  selection,
  onSelect,
  onClose,
}: {
  selection: Selection
  onSelect: (s: Selection) => void
  onClose: () => void
}) {
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>('ALL')
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(departmentGroups.map((g) => [g.id, true])),
  )

  const visibleGroups =
    bucketFilter === 'ALL'
      ? departmentGroups
      : BUCKET_GROUPS[bucketFilter as BucketType]

  // Portfolio burn across all groups
  const portfolio = departmentGroups.reduce(
    (acc, g) => {
      const b = groupBurn(g)
      return { forecast: acc.forecast + b.forecast, execution: acc.execution + b.execution }
    },
    { forecast: 0, execution: 0 },
  )
  const portfolioPct = execPct(portfolio.forecast, portfolio.execution)

  const TABS: { key: BucketFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'BU', label: 'BU' },
    { key: 'SU', label: 'SU' },
  ]

  return (
    <div className="flex max-h-[calc(100vh-8rem)] w-64 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      {/* Portfolio burn header */}
      <div className="border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Portfolio Burn
          </span>
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-bold tabular-nums', healthColor(portfolioPct))}>
              {portfolioPct}%
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Hide navigator"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-2">
          <Bar pct={portfolioPct} colour="bg-gray-700" />
        </div>
      </div>

      {/* BU / SU / All filter tabs */}
      <div className="flex gap-1 border-b border-gray-100 px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setBucketFilter(t.key)
              const groups =
                t.key === 'ALL' ? departmentGroups : BUCKET_GROUPS[t.key as BucketType]
              if (groups.length && !groups.find((g) => g.id === selection.groupId)) {
                onSelect({ groupId: groups[0].id, deptId: 'all' })
              }
            }}
            className={cn(
              'flex-1 rounded-md py-1 text-[11px] font-semibold transition-colors',
              bucketFilter === t.key
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <BarChart3 className="size-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500">Overview</span>
        </div>

        <div className="flex flex-col gap-0.5">
          {visibleGroups.map((group) => {
            const gb = groupBurn(group)
            const gPct = execPct(gb.forecast, gb.execution)
            const isOpen = expanded[group.id]
            const groupSelected =
              selection.groupId === group.id && selection.deptId === 'all'
            const bar = GROUP_BAR[group.id] ?? 'bg-gray-400'
            const dot = GROUP_DOT[group.id] ?? 'bg-gray-400'

            return (
              <div key={group.id}>
                {/* Group row */}
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                    groupSelected ? 'bg-gray-100' : 'hover:bg-gray-50',
                  )}
                >
                  <span className={cn('size-2 shrink-0 rounded-full', dot)} />
                  <button
                    onClick={() => onSelect({ groupId: group.id, deptId: 'all' })}
                    className={cn(
                      'flex-1 truncate text-left text-sm font-semibold',
                      groupSelected ? 'text-gray-900' : 'text-gray-700',
                    )}
                  >
                    {group.name}
                  </button>
                  <span className={cn('shrink-0 text-xs font-bold tabular-nums', healthColor(gPct))}>
                    {gPct}%
                  </span>
                  <button
                    onClick={() =>
                      setExpanded((p) => ({ ...p, [group.id]: !p[group.id] }))
                    }
                    className="text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={isOpen ? 'Collapse' : 'Expand'}
                  >
                    <ChevronDown
                      className={cn('size-3.5 transition-transform', !isOpen && '-rotate-90')}
                    />
                  </button>
                </div>

                {/* Departments */}
                {isOpen && (
                  <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-gray-200 pl-2">
                    {group.departments.map((dept) => {
                      const db = deptOpex(group, dept.id)
                      const dPct = execPct(db.forecast, db.execution)
                      const selected =
                        selection.groupId === group.id && selection.deptId === dept.id

                      return (
                        <button
                          key={dept.id}
                          onClick={() => onSelect({ groupId: group.id, deptId: dept.id })}
                          className={cn(
                            'flex flex-col gap-1 rounded-lg px-2.5 py-1.5 text-left transition-colors',
                            selected
                              ? 'bg-gray-100 ring-1 ring-gray-300'
                              : 'hover:bg-gray-50',
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-[11px] font-medium text-gray-700">
                              {dept.name}
                            </span>
                            <span
                              className={cn(
                                'shrink-0 text-[10px] font-bold tabular-nums',
                                selected ? 'text-gray-900' : healthColor(dPct),
                              )}
                            >
                              {dPct}%
                            </span>
                          </div>
                          <Bar pct={dPct} colour={bar} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}