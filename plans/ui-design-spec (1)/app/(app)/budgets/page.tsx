'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  PanelLeftOpen,
  PanelLeftClose,
  Upload,
  TrendingUp,
  Layers,
  Pencil,
  Save,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useSession } from '@/components/session-provider'
import {
  YEARS,
  getDeptSummary,
  execPct,
  type SectionType,
  type ClassificationType,
  type Department,
  type DepartmentGroup,
} from '@/lib/budget-data'
import {
  cloneGroups,
  setValue,
  renameItem,
  deleteItem,
  addItem,
  buildSavePayload,
} from '@/lib/budget-draft'
import { getBudgetTreeAction, saveBudgetAction } from '@/app/actions/budget'
import { BUGrid, SUGrid, type EditApi } from '@/components/budget/budget-grid'
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
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn('text-lg font-bold tabular-nums leading-none', accent ?? 'text-foreground')}>{value}</span>
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
  const [selection, setSelection] = useState<Selection>({ groupId: 'banking-digital', deptId: 'all' })

  // Editing state
  const [draft, setDraft] = useState<DepartmentGroup[] | null>(null)
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const editing = draft !== null

  const {
    data,
    isLoading,
    mutate,
  } = useSWR<DepartmentGroup[]>(['budget', year], () => getBudgetTreeAction(Number(year)), {
    revalidateOnFocus: false,
  })

  // Active dataset: the draft while editing, otherwise the fetched tree.
  const activeGroups = editing ? draft! : data ?? []

  const group: DepartmentGroup | undefined = useMemo(
    () => activeGroups.find((g) => g.id === selection.groupId) ?? activeGroups[0],
    [activeGroups, selection.groupId],
  )
  const isBU = group?.bucketType === 'BU'

  const visibleDepts: Department[] = useMemo(() => {
    if (!group) return []
    return selection.deptId === 'all'
      ? group.departments
      : group.departments.filter((d) => d.id === selection.deptId)
  }, [group, selection.deptId])

  const summary = useMemo(() => {
    if (!group) return { rev: { f: 0, e: 0 }, gm: { f: 0, e: 0 }, opex: { f: 0, e: 0 }, ebit: { f: 0, e: 0 } }
    return visibleDepts.reduce(
      (acc, d) => {
        const s = getDeptSummary(d, group.bucketType)
        return {
          rev: { f: acc.rev.f + s.rev.forecast, e: acc.rev.e + s.rev.execution },
          gm: { f: acc.gm.f + s.grossMargin.forecast, e: acc.gm.e + s.grossMargin.execution },
          opex: { f: acc.opex.f + s.opex.forecast, e: acc.opex.e + s.opex.execution },
          ebit: { f: acc.ebit.f + s.ebit.forecast, e: acc.ebit.e + s.ebit.execution },
        }
      },
      { rev: { f: 0, e: 0 }, gm: { f: 0, e: 0 }, opex: { f: 0, e: 0 }, ebit: { f: 0, e: 0 } },
    )
  }, [visibleDepts, group])

  const opexPct = execPct(summary.opex.f, summary.opex.e)
  const deptLabel =
    selection.deptId === 'all'
      ? `${visibleDepts.length} department${visibleDepts.length !== 1 ? 's' : ''}`
      : visibleDepts[0]?.name

  // ─── Edit lifecycle ───────────────────────────────────────────────────────────

  function startEdit() {
    if (!data) return
    setDeletedIds([])
    setDraft(cloneGroups(data))
  }

  function discard() {
    setDraft(null)
    setDeletedIds([])
  }

  async function save() {
    if (!draft || !group) return
    setSaving(true)
    try {
      const payload = buildSavePayload(draft, group.id, Number(year), deletedIds)
      await saveBudgetAction(payload)
      await mutate()
      setDraft(null)
      setDeletedIds([])
    } finally {
      setSaving(false)
    }
  }

  // ─── Edit API passed to the grid ────────────────────────────────────────────────

  const edit: EditApi | undefined = useMemo(() => {
    if (!editing || !group) return undefined
    const gid = group.id
    return {
      onValue: (deptId, itemId, field, value) =>
        setDraft((prev) => (prev ? setValue(prev, gid, deptId, itemId, field, value) : prev)),
      onRename: (itemId, label) =>
        setDraft((prev) => (prev ? renameItem(prev, gid, itemId, label) : prev)),
      onDelete: (itemId) => {
        setDraft((prev) => (prev ? deleteItem(prev, gid, itemId) : prev))
        if (!itemId.startsWith('new-')) setDeletedIds((prev) => [...prev, itemId])
      },
      onAdd: (section: SectionType, classification: ClassificationType | null) =>
        setDraft((prev) => (prev ? addItem(prev, gid, section, classification, 'New line item').groups : prev)),
    }
  }, [editing, group])

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
          {navOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
          Navigator
        </Button>

        <Select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-9 w-24"
          disabled={editing}
        >
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </Select>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            isBU ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success',
          )}
        >
          {isBU ? <TrendingUp className="size-3" /> : <Layers className="size-3" />}
          {isBU ? 'Business Unit — Full P&L' : 'Support Unit — OPEX'}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {editing ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Editing {group?.name} · FY {year}
              </span>
              <Button variant="outline" size="sm" onClick={discard} disabled={saving} className="gap-1.5">
                <X className="size-4" />
                Discard
              </Button>
              <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          ) : (
            <>
              {isAdmin && (
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Upload className="size-4" />
                  Upload Budget
                </Button>
              )}
              <Button size="sm" onClick={startEdit} disabled={!data} className="gap-1.5">
                <Pencil className="size-4" />
                Edit budget
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex items-start gap-4">
        {navOpen && (
          <div
            className={cn('sticky top-4 shrink-0', editing && 'pointer-events-none opacity-60')}
            aria-disabled={editing}
          >
            <BudgetNavigator selection={selection} onSelect={setSelection} onClose={() => setNavOpen(false)} />
          </div>
        )}

        <div className="min-w-0 flex-1 flex flex-col gap-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-3.5">
            <div>
              <h2 className="text-sm font-bold tracking-tight">{group?.name ?? 'Budgets'}</h2>
              <p className="text-[11px] text-muted-foreground">
                {deptLabel} · FY {year}
                {editing && <span className="ml-1.5 font-semibold text-primary">· Draft</span>}
              </p>
            </div>

            <div className="flex items-center divide-x divide-border">
              {isBU && (
                <>
                  <Stat label="Revenue" value={fmtK(summary.rev.f)} sub={`${fmtK(summary.rev.e)} to date`} />
                  <Stat label="Gross Margin" value={fmtK(summary.gm.f)} sub={`${fmtK(summary.gm.e)} to date`} />
                </>
              )}
              <Stat label="Total OPEX" value={fmtK(summary.opex.f)} sub={`${fmtK(summary.opex.e)} spent`} />
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
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">OPEX Burn</span>
                  <span className={cn('text-lg font-bold tabular-nums leading-none', healthText(opexPct))}>{opexPct}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          {isLoading || !group ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading budget…</span>
            </div>
          ) : visibleDepts.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
              No departments in this group.
            </div>
          ) : isBU ? (
            <BUGrid departments={visibleDepts} edit={edit} />
          ) : (
            <SUGrid departments={visibleDepts} edit={edit} />
          )}
        </div>
      </div>
    </div>
  )
}
