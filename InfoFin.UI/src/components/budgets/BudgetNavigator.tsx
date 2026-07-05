'use client'

import { useState } from 'react'
import { ChevronDown, BarChart3, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Selection = { groupId: string; deptId: string | 'all' }
type BucketFilter = 'All' | 'BU' | 'SU'

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
  '1': 'bg-[#2563eb]',
  '2': 'bg-[#0891b2]',
  '3': 'bg-[#059669]',
  '4': 'bg-[#d97706]',
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
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
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
  onSelect: (s: Selection) => void
  onClose: () => void
  onBucketChange?: (bucket: 'BU' | 'SU') => void
}) {
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>('All')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const visibleGroups = bucketFilter === 'All'
    ? groups
    : groups.filter((g) => g.bucketType === bucketFilter)

  // Portfolio burn for visible groups
  const portfolio = visibleGroups.reduce(
    (acc, g) => ({ forecast: acc.forecast + g.forecast, execution: acc.execution + g.execution }),
    { forecast: 0, execution: 0 },
  )
  const portfolioPct = execPct(portfolio.forecast, portfolio.execution)

  const TABS: { key: BucketFilter; label: string }[] = [
    { key: 'All', label: 'All' },
    { key: 'BU', label: 'BU' },
    { key: 'SU', label: 'SU' },
  ]

  return (
    <div className="flex h-full w-64 flex-col overflow-hidden bg-card">
      {/* Portfolio burn header */}
      <div className="border-b border-border px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Portfolio Burn
          </span>
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-bold tabular-nums', healthColor(portfolioPct))}>
              {portfolioPct !== null ? `${portfolioPct}%` : '—'}
            </span>
            <button
              onClick={onClose}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Hide navigator"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-2">
          <Bar pct={portfolioPct} colour="bg-[#0f3d66]" />
        </div>
      </div>

      {/* All / BU / SU filter tabs */}
      <div className="flex gap-1 border-b border-border px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setBucketFilter(t.key)
              if (t.key !== 'All') onBucketChange?.(t.key)
            }}
            className={cn(
              'flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors',
              bucketFilter === t.key
                ? 'bg-[#0f3d66] text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <BarChart3 className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Overview</span>
        </div>

        {visibleGroups.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No groups for this view.
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {visibleGroups.map((group, gIdx) => {
              const gPct = execPct(group.forecast, group.execution)
              const isOpen = expanded[group.id] ?? true
              const groupSelected =
                selection?.groupId === group.id && selection?.deptId === 'all'
              const bar = GROUP_BAR[String(gIdx + 1)] ?? 'bg-[#64748b]'
              const dot = GROUP_DOT[String(gIdx + 1)] ?? 'bg-[#64748b]'

              return (
                <div key={group.id}>
                  {/* Group row */}
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors cursor-pointer',
                      groupSelected ? 'bg-muted' : 'hover:bg-muted/50',
                    )}
                    onClick={() => onSelect({ groupId: group.id, deptId: 'all' })}
                  >
                    <span className={cn('size-2 shrink-0 rounded-full', dot)} />
                    <span
                      className={cn(
                        'flex-1 truncate text-left text-[13px] font-semibold',
                        groupSelected ? 'text-foreground' : 'text-foreground/80',
                      )}
                    >
                      {group.name}
                    </span>
                    <span className={cn('shrink-0 text-xs font-bold tabular-nums', healthColor(gPct))}>
                      {gPct !== null ? `${gPct}%` : '—'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpanded((p) => ({ ...p, [group.id]: !isOpen }))
                      }}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                      <ChevronDown
                        className={cn('size-3.5 transition-transform', !isOpen && '-rotate-90')}
                      />
                    </button>
                  </div>

                  {/* Departments */}
                  {isOpen && (
                    <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
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
                                ? 'bg-muted ring-1 ring-border'
                                : 'hover:bg-muted/50',
                            )}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate text-[11px] font-medium text-foreground/80">
                                {dept.name}
                              </span>
                              <span
                                className={cn(
                                  'shrink-0 text-[10px] font-bold tabular-nums',
                                  selected ? 'text-foreground' : healthColor(dPct),
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