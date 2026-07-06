'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { BudgetNavigator, type Selection, type NavGroup } from '@/components/budgets/BudgetNavigator'
import { BudgetKPICards } from '@/components/budgets/BudgetKPICards'
import { BUGrid, SUGrid, type EditApi } from '@/components/budgets/BudgetGrid'
import type { Department, SectionType, ClassificationType } from '@/lib/budget-data'
import { httpClient } from '@/api/httpClient'
import { Button } from '@/components/ui/button'
import { Loader2, PanelLeftClose, PanelLeftOpen, TrendingUp, Layers, Pencil, Save, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select } from '@/components/ui/select'

const YEARS = [2026, 2025, 2024]

function cloneDepts(depts: Department[]): Department[] {
  return JSON.parse(JSON.stringify(depts))
}

let _idCounter = Date.now()
function uid(): string {
  return `new-${++_idCounter}`
}

export default function BudgetPage() {
  const [year, setYear] = useState(2026)
  const [buSu, setBuSu] = useState<'BU' | 'SU'>('BU')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [showNav, setShowNav] = useState(false)
  const [depts, setDepts] = useState<Department[]>([])
  const [navGroups, setNavGroups] = useState<NavGroup[]>([])
  const [loading, setLoading] = useState(true)

  // Draft editing state
  const [draft, setDraft] = useState<Department[] | null>(null)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const editing = draft !== null

  // Fetch grid data
  useEffect(() => {
    setLoading(true)
    httpClient.get(`/api/budgets/grid/${year}`, { params: { buSu } })
      .then(({ data }) => setDepts(Array.isArray(data) ? data : []))
      .catch(() => setDepts([]))
      .finally(() => setLoading(false))
  }, [year, buSu])

  // Fetch navigator data
  useEffect(() => {
    httpClient.get(`/api/budgets/navigator/${year}`)
      .then(({ data }) => setNavGroups(Array.isArray(data) ? data : []))
      .catch(() => setNavGroups([]))
  }, [year])

  // Filter departments by selection
  const filteredDepts = selection?.deptId && selection.deptId !== 'all'
    ? depts.filter((d) => d.id === selection.deptId)
    : depts

  // KPI context: group name from navigator selection
  const kpiGroupName = useMemo(() => {
    if (!selection) return ''
    const g = navGroups.find((ng) => ng.id === selection.groupId)
    return g?.name ?? ''
  }, [selection, navGroups])

  // ─── Edit mode actions ─────────────────────────────────────────────

  const startEdit = useCallback(() => {
    setDraft(cloneDepts(filteredDepts))
    setDeletedIds(new Set())
  }, [filteredDepts])

  const discard = useCallback(() => {
    setDraft(null)
    setDeletedIds(new Set())
  }, [])

  const save = useCallback(async () => {
    if (!draft) return
    try {
      await httpClient.put('/api/budgets/draft', {
        year,
        departments: draft,
        deletedIds: Array.from(deletedIds),
      })
      setDraft(null)
      setDeletedIds(new Set())
      // Re-fetch to get real IDs for new items
      setLoading(true)
      const { data } = await httpClient.get(`/api/budgets/grid/${year}`, { params: { buSu } })
      setDepts(Array.isArray(data) ? data : [])
    } catch {
      // save failed — keep draft
    } finally {
      setLoading(false)
    }
  }, [draft, deletedIds, year, buSu])

  // Display data: draft while editing, live data otherwise
  const displayDepts = editing ? (draft ?? []) : filteredDepts

  // ─── Edit API handlers ─────────────────────────────────────────────

  const editApi: EditApi = useMemo(() => ({
    onValue(deptId, itemId, field, value) {
      setDraft((prev) => {
        if (!prev) return prev
        return prev.map((d) => {
          if (d.id !== deptId) return d
          return {
            ...d,
            sections: d.sections.map((s) => ({
              ...s,
              items: s.items?.map((i) => i.id === itemId ? { ...i, [field]: value } : i),
              classifications: s.classifications?.map((c) => ({
                ...c,
                items: c.items.map((i) => i.id === itemId ? { ...i, [field]: value } : i),
              })),
            })),
          }
        })
      })
    },
    onRename(itemId, label) {
      setDraft((prev) => {
        if (!prev) return prev
        return prev.map((d) => ({
          ...d,
          sections: d.sections.map((s) => ({
            ...s,
            items: s.items?.map((i) => i.id === itemId ? { ...i, label } : i),
            classifications: s.classifications?.map((c) => ({
              ...c,
              items: c.items.map((i) => i.id === itemId ? { ...i, label } : i),
            })),
          })),
        }))
      })
    },
    onDelete(itemId) {
      setDeletedIds((prev) => new Set(prev).add(itemId))
      setDraft((prev) => {
        if (!prev) return prev
        return prev.map((d) => ({
          ...d,
          sections: d.sections.map((s) => ({
            ...s,
            items: s.items?.filter((i) => i.id !== itemId),
            classifications: s.classifications?.map((c) => ({
              ...c,
              items: c.items.filter((i) => i.id !== itemId),
            })),
          })),
        }))
      })
    },
    onAdd(section, classification) {
      const newItem = { id: uid(), label: 'New line item', forecast: 0, execution: 0 }
      setDraft((prev) => {
        if (!prev) return prev
        return prev.map((d) => ({
          ...d,
          sections: d.sections.map((s) => {
            if (s.type !== section) return s
            if (classification) {
              return {
                ...s,
                classifications: s.classifications?.map((c) =>
                  c.type === classification ? { ...c, items: [...c.items, { ...newItem }] } : c,
                ),
              }
            }
            return { ...s, items: [...(s.items ?? []), { ...newItem }] }
          }),
        }))
      })
    },
  }), [])

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Top Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-5 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNav((v) => !v)}
          aria-pressed={showNav}
          className="gap-1.5"
          disabled={editing}
        >
          {showNav ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
          Navigator
        </Button>

        <Select
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
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
            buSu === 'BU' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success',
          )}
        >
          {buSu === 'BU' ? <TrendingUp className="size-3" /> : <Layers className="size-3" />}
          {buSu === 'BU' ? 'Business Unit — Full P&L' : 'Support Unit — OPEX'}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {editing ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Editing · FY {year}
              </span>
              <Button variant="outline" size="sm" onClick={discard} className="gap-1.5">
                <X className="size-4" />
                Discard
              </Button>
              <Button size="sm" onClick={save} className="gap-1.5">
                <Save className="size-4" />
                Save changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="gap-1.5">
                <RefreshCw className="size-4" />
                Odoo Sync
              </Button>
              <Button size="sm" onClick={startEdit} className="gap-1.5">
                <Pencil className="size-4" />
                Edit budget
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ─── Main Layout ─────────────────────────────────────────────── */}
      <div className="flex gap-4">
        {showNav && !editing && (
          <div className="shrink-0">
            <BudgetNavigator
              groups={navGroups}
              selection={selection}
              onSelect={setSelection}
              onClose={() => setShowNav(false)}
              onBucketChange={setBuSu}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* KPI Cards */}
          {!loading && filteredDepts.length > 0 && (
            <div className="mb-4">
              <BudgetKPICards
                groupName={kpiGroupName}
                deptCount={filteredDepts.length}
                year={year}
                bucketType={buSu}
                departments={filteredDepts}
                editing={editing}
              />
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : displayDepts.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No actuals data for {year}. Run Odoo Sync from Master Data.
            </div>
          ) : buSu === 'BU' ? (
            <BUGrid departments={displayDepts} edit={editing ? editApi : undefined} />
          ) : (
            <SUGrid departments={displayDepts} edit={editing ? editApi : undefined} />
          )}
        </div>
      </div>
    </div>
  )
}
