'use client'

import { useState } from 'react'
import { ChevronDown, BarChart3, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Selection = { groupId: string; deptId: string | 'all' }
type BucketFilter = 'BU' | 'SU' | 'all'

export interface NavDept {
  id: string; name: string; forecast: number; execution: number;
}
export interface NavGroup {
  id: string; name: string; bucketType: 'BU' | 'SU';
  forecast: number; execution: number;
  departments: NavDept[];
}

// ─── Per-group distinct bar colours ────────────────────────────────────────────
const GROUP_BAR: Record<string, string> = {
  '1': 'bg-[#2563eb]',   // Banking & Digital
  '2': 'bg-[#0891b2]',   // IT & Cloud
  '3': 'bg-[#059669]',   // DG, Admin & Fin
  '4': 'bg-[#d97706]',   // Operations (future)
}

const GROUP_DOT: Record<string, string> = {
  '1': 'bg-[#2563eb]',
  '2': 'bg-[#0891b2]',
  '3': 'bg-[#059669]',
  '4': 'bg-[#d97706]',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function execPct(forecast: number, execution: number) {
  if (forecast === 0) return null
  return Math.round((execution / forecast) * 100)
}

function healthColor(pct: number | null) {
  if (pct === null) return 'text-muted-foreground/50'
  if (pct > 100) return 'text-destructive'
  if (pct >= 80) return 'text-warning'
  return 'text-success'
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
  groups,
  selection,
  onSelect,
  onClose,
  onBucketChange,
}: {
  groups: NavGroup[]
  selection: Selection | null
  onSelect: (s: Selection | null) => void
  onClose: () => void
  onBucketChange?: (bucket: 'BU' | 'SU' | 'all') => void
}) {
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>('all')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const visibleGroups = bucketFilter === 'all'
    ? groups
    : groups.filter((g) => g.bucketType === bucketFilter)

  // Portfolio burn for current bucket filter
  const portfolio = visibleGroups.reduce(
    (acc, g) => ({ forecast: acc.forecast + g.forecast, execution: acc.execution + g.execution }),
    { forecast: 0, execution: 0 },
  )
  const portfolioPct = execPct(portfolio.forecast, portfolio.execution)

  const TABS: { key: BucketFilter; label: string }[] = [
    { key: 'all', label: 'All' },
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
              {portfolioPct !== null ? `${portfolioPct}%` : '—'}
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
              onBucketChange?.(t.key)
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
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-100',
            !selection && 'bg-gray-100',
          )}
        >
          <BarChart3 className="size-3.5 text-gray-400" />
          <span className={cn('text-xs font-semibold', !selection ? 'text-gray-900' : 'text-gray-500')}>Overview</span>
        </button>

        {visibleGroups.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-gray-400">
            No groups for {bucketFilter} view.
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {visibleGroups.map((group) => {
              const gPct = execPct(group.forecast, group.execution)
              const isOpen = expanded[group.id] ?? false
              const groupSelected =
                selection?.groupId === group.id && selection?.deptId === 'all'
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
                      onClick={() => {
                        onSelect({ groupId: group.id, deptId: 'all' })
                        setExpanded((p) => ({ ...p, [group.id]: !(p[group.id] ?? false) }))
                      }}
                      className={cn(
                        'flex-1 truncate text-left text-sm font-semibold',
                        groupSelected ? 'text-gray-900' : 'text-gray-700',
                      )}
                    >
                      {group.name}
                    </button>
                    <span className={cn('shrink-0 text-xs font-bold tabular-nums', healthColor(gPct))}>
                      {gPct !== null ? `${gPct}%` : '—'}
                    </span>
                    <ChevronDown
                      className={cn('size-3.5 text-gray-400 transition-transform', !isOpen && '-rotate-90')}
                    />
                  </div>

                  {/* Departments */}
                  {isOpen && (
                    <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-gray-200 pl-2">
                      {group.departments.map((dept) => {
                        const dPct = execPct(dept.forecast, dept.execution)
                        const selected =
                          selection?.groupId === group.id && selection?.deptId === dept.id

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
                                {dPct !== null ? `${dPct}%` : '—'}
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
        )}
      </div>
    </div>
  )
}