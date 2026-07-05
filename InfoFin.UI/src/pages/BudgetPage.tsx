'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BudgetNavigator, type Selection, type NavGroup } from '@/components/budgets/BudgetNavigator'
import { BUGrid, SUGrid, type CellEdit, type RowAdd, type RowRemove } from '@/components/budgets/BudgetGrid'
import type { Department, BudgetLineItem, ClassificationType } from '@/lib/budget-data'
import { getDeptSummary } from '@/lib/budget-data'
import { httpClient } from '@/api/httpClient'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2, LayoutGrid, RefreshCw, X, Check } from 'lucide-react'

const YEARS = [2026, 2025, 2024]

// ─── KPI formatting ─────────────────────────────────────────────────────────

function fmtKpi(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

export default function BudgetPage() {
  const [year, setYear] = useState(2026)
  const [buSu, setBuSu] = useState<'BU' | 'SU'>('BU')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [showNav, setShowNav] = useState(true)
  const [depts, setDepts] = useState<Department[]>([])
  const [navGroups, setNavGroups] = useState<NavGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [editable, setEditable] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Keep a snapshot for cancel
  const [snapshot, setSnapshot] = useState<Department[]>([])

  // Fetch grid data
  useEffect(() => {
    setLoading(true)
    httpClient.get(`/api/budgets/grid/${year}`, { params: { buSu } })
      .then(({ data }) => {
        const d = Array.isArray(data) ? data : []
        setDepts(d)
        setSnapshot(structuredClone(d))
      })
      .catch(() => { setDepts([]); setSnapshot([]) })
      .finally(() => setLoading(false))
  }, [year, buSu])

  // Fetch navigator data
  useEffect(() => {
    httpClient.get(`/api/budgets/navigator/${year}`)
      .then(({ data }) => setNavGroups(Array.isArray(data) ? data : []))
      .catch(() => setNavGroups([]))
  }, [year, buSu])

  // Filter departments by selection
  const filteredDepts = selection?.deptId && selection.deptId !== 'all'
    ? depts.filter((d) => d.id === selection.deptId)
    : depts

  // ─── KPI summaries ────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    if (filteredDepts.length === 0) return null
    const summaries = filteredDepts.map((d) => getDeptSummary(d, buSu))
    const revenue = summaries.reduce((a, s) => ({ forecast: a.forecast + s.rev.forecast, execution: a.execution + s.rev.execution }), { forecast: 0, execution: 0 })
    const grossMargin = summaries.reduce((a, s) => ({ forecast: a.forecast + s.grossMargin.forecast, execution: a.execution + s.grossMargin.execution }), { forecast: 0, execution: 0 })
    const opex = summaries.reduce((a, s) => ({ forecast: a.forecast + s.opex.forecast, execution: a.execution + s.opex.execution }), { forecast: 0, execution: 0 })
    const ebit = summaries.reduce((a, s) => ({ forecast: a.forecast + s.ebit.forecast, execution: a.execution + s.ebit.execution }), { forecast: 0, execution: 0 })
    const opexBurn = opex.forecast > 0 ? Math.round((opex.execution / opex.forecast) * 100) : 0
    return { revenue, grossMargin, opex, ebit, opexBurn, deptCount: filteredDepts.length }
  }, [filteredDepts, buSu])

  // Get selected group name
  const selectedGroupName = useMemo(() => {
    if (!selection) return buSu === 'BU' ? 'Business Unit' : 'Support Unit'
    const group = navGroups.find((g) => g.id === selection.groupId)
    return group?.name ?? (buSu === 'BU' ? 'Business Unit' : 'Support Unit')
  }, [selection, navGroups, buSu])

  // ─── Edit handlers ────────────────────────────────────────────────────────

  const handleCellEdit = useCallback((edit: CellEdit) => {
    setDepts((prev) =>
      prev.map((dept) => {
        if (dept.id !== edit.deptId) return dept
        return {
          ...dept,
          sections: dept.sections.map((sec) => ({
            ...sec,
            items: sec.items?.map((item) =>
              item.id === edit.itemId ? { ...item, [edit.field]: edit.value } : item
            ),
            classifications: sec.classifications?.map((cls) => ({
              ...cls,
              items: cls.items.map((item) =>
                item.id === edit.itemId ? { ...item, [edit.field]: edit.value } : item
              ),
            })),
          })),
        }
      })
    )
    setHasChanges(true)
  }, [])

  const handleRowAdd = useCallback((add: RowAdd) => {
    const newItem: BudgetLineItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: add.label,
      forecast: 0,
      execution: 0,
    }
    setDepts((prev) =>
      prev.map((dept) => ({
        ...dept,
        sections: dept.sections.map((sec) => {
          if (sec.type !== add.sectionType) return sec
          if (add.classType) {
            return {
              ...sec,
              classifications: sec.classifications?.map((cls) =>
                cls.type === add.classType
                  ? { ...cls, items: [...cls.items, { ...newItem, id: `${dept.id}-${newItem.id}` }] }
                  : cls
              ),
            }
          }
          return { ...sec, items: [...(sec.items ?? []), { ...newItem, id: `${dept.id}-${newItem.id}` }] }
        }),
      }))
    )
    setHasChanges(true)
  }, [])

  const handleRowRemove = useCallback((remove: RowRemove) => {
    setDepts((prev) =>
      prev.map((dept) => ({
        ...dept,
        sections: dept.sections.map((sec) => {
          if (sec.type !== remove.sectionType) return sec
          if (remove.classType) {
            return {
              ...sec,
              classifications: sec.classifications?.map((cls) =>
                cls.type === remove.classType
                  ? { ...cls, items: cls.items.filter((_, i) => i !== remove.itemIndex) }
                  : cls
              ),
            }
          }
          return { ...sec, items: sec.items?.filter((_, i) => i !== remove.itemIndex) }
        }),
      }))
    )
    setHasChanges(true)
  }, [])

  const handleLabelEdit = useCallback((itemId: string, newLabel: string) => {
    setDepts((prev) =>
      prev.map((dept) => ({
        ...dept,
        sections: dept.sections.map((sec) => ({
          ...sec,
          items: sec.items?.map((item) =>
            item.id === itemId ? { ...item, label: newLabel } : item
          ),
          classifications: sec.classifications?.map((cls) => ({
            ...cls,
            items: cls.items.map((item) =>
              item.id === itemId ? { ...item, label: newLabel } : item
            ),
          })),
        })),
      }))
    )
    setHasChanges(true)
  }, [])

  // ─── Save & Cancel ────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true)
    try {
      await httpClient.put(`/api/budgets/grid/${year}`, { buSu, departments: depts })
      setSnapshot(structuredClone(depts))
      setHasChanges(false)
      setEditable(false)
    } catch {
      // Keep editing on error
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDepts(structuredClone(snapshot))
    setHasChanges(false)
    setEditable(false)
  }

  const handleEditToggle = () => {
    if (!editable) {
      setSnapshot(structuredClone(depts))
    }
    setEditable(true)
  }

  return (
    <div className="flex flex-col gap-0">
      {/* ─── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        {/* Left: Navigator toggle + Year + View label */}
        <button
          onClick={() => setShowNav((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <LayoutGrid className="size-4 text-muted-foreground" />
          <span>Navigator</span>
        </button>

        <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))} className="h-8 w-24 text-sm">
          {YEARS.map((y) => (<option key={y} value={String(y)}>{y}</option>))}
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="size-3.5" />
          <span className="font-medium text-foreground">
            {buSu === 'BU' ? 'Business Unit — Full P&L' : 'Support Unit — OPEX'}
          </span>
        </div>

        {/* Right: Edit status + actions */}
        <div className="ml-auto flex items-center gap-3">
          {editable ? (
            <>
              <span className="text-sm text-muted-foreground">
                Editing {selectedGroupName} · FY {year}
              </span>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Save changes
              </button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleEditToggle} className="gap-1.5">
              Edit Budget
            </Button>
          )}
        </div>
      </div>

      {/* ─── KPI Summary Cards ──────────────────────────────────────────────── */}
      {kpis && (
        <div className="flex items-stretch border-b border-border bg-card">
          {/* Group info */}
          <div className="flex flex-col justify-center border-r border-border px-5 py-3">
            <span className="text-sm font-semibold text-foreground">{selectedGroupName}</span>
            <span className="text-xs text-muted-foreground">
              {kpis.deptCount} department{kpis.deptCount !== 1 ? 's' : ''} · FY {year} · {editable ? <span className="text-amber-600 font-medium">Draft</span> : <span className="text-emerald-600 font-medium">Published</span>}
            </span>
          </div>
          {/* KPI cards */}
          {buSu === 'BU' && (
            <div className="flex flex-col justify-center border-r border-border px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Revenue</span>
              <span className="text-lg font-bold text-foreground">{fmtKpi(kpis.revenue.forecast)}</span>
              <span className="text-[10px] text-muted-foreground">{fmtKpi(kpis.revenue.execution)} to date</span>
            </div>
          )}
          {buSu === 'BU' && (
            <div className="flex flex-col justify-center border-r border-border px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Gross Margin</span>
              <span className="text-lg font-bold text-foreground">{fmtKpi(kpis.grossMargin.forecast)}</span>
              <span className="text-[10px] text-muted-foreground">{fmtKpi(kpis.grossMargin.execution)} to date</span>
            </div>
          )}
          <div className="flex flex-col justify-center border-r border-border px-5 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total OPEX</span>
            <span className="text-lg font-bold text-foreground">{fmtKpi(kpis.opex.forecast)}</span>
            <span className="text-[10px] text-muted-foreground">{fmtKpi(kpis.opex.execution)} spent</span>
          </div>
          {buSu === 'BU' && (
            <div className="flex flex-col justify-center border-r border-border px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">EBIT</span>
              <span className="text-lg font-bold text-foreground">{fmtKpi(kpis.ebit.forecast)}</span>
              <span className="text-[10px] text-muted-foreground">{fmtKpi(kpis.ebit.execution)} to date</span>
            </div>
          )}
          <div className="flex flex-col justify-center px-5 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">OPEX Burn</span>
            <span className="text-lg font-bold text-foreground">{kpis.opexBurn}%</span>
          </div>
        </div>
      )}

      {/* ─── Main content ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {showNav && (
          <div className="shrink-0 border-r border-border">
            <BudgetNavigator
              groups={navGroups}
              selection={selection}
              onSelect={setSelection}
              onClose={() => setShowNav(false)}
              onBucketChange={setBuSu}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 overflow-auto">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          ) : filteredDepts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">No actuals data for {year}. Run Odoo Sync from Master Data.</div>
          ) : buSu === 'BU' ? (
            <BUGrid
              departments={filteredDepts}
              editable={editable}
              onCellEdit={handleCellEdit}
              onRowAdd={handleRowAdd}
              onRowRemove={handleRowRemove}
              onLabelEdit={handleLabelEdit}
            />
          ) : (
            <SUGrid
              departments={filteredDepts}
              editable={editable}
              onCellEdit={handleCellEdit}
              onRowAdd={handleRowAdd}
              onRowRemove={handleRowRemove}
              onLabelEdit={handleLabelEdit}
            />
          )}
        </div>
      </div>
    </div>
  )
}
