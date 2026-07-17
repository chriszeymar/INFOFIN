"use client"

import { useState, useEffect, useRef } from "react"
import { RefreshCw, AlertCircle, FileSpreadsheet, Layers, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { httpClient } from "@/api/httpClient"
import { cn } from "@/lib/utils"
import { SyncProgress } from "@/components/odoo/sync-progress"
import { DatabaseState } from "@/components/odoo/database-state"
import { ExportMenu } from "@/components/odoo/export-menu"
import { exportToCsv, exportToJson, exportToExcel } from "@/lib/export"
import type { SyncResult, DbStat } from "@/lib/odoo-data"

function fmtMs(ms: number) { return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s` }
function money(n: number) { return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function Section({ icon, title, subtitle, onCsv, onJson, onExcel, children, defaultOpen }: {
  icon: React.ReactNode; title: string; subtitle: string
  onCsv: () => void; onJson: () => void; onExcel: () => void
  children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent">{icon}</span>
        <button type="button" onClick={() => setOpen(o => !o)} className="flex flex-1 items-center justify-between text-left">
          <span><span className="block text-sm font-semibold">{title}</span><span className="block text-xs text-muted-foreground">{subtitle}</span></span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        <ExportMenu size="sm" onCsv={onCsv} onJson={onJson} onExcel={onExcel} />
      </div>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export default function OdooSyncWizard() {
  const [healthOk, setHealthOk] = useState<boolean | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dbStats, setDbStats] = useState<DbStat[]>([])
  const [progressPct, setProgressPct] = useState(0)
  const [stepLabel, setStepLabel] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const [budgetRows, setBudgetRows] = useState<any[]>([])
  const [actualsRows, setActualsRows] = useState<any[]>([])

  const checkHealth = async () => {
    try { const { data } = await httpClient.get('/api/odoo/health'); setHealthOk(data.connected) }
    catch { setHealthOk(false) }
  }

  const loadLastSync = async () => {
    try {
      const { data } = await httpClient.get<SyncResult & { hasData?: boolean }>('/api/odoo/last-sync')
      if (data.hasData === false) return
      setSyncResult(data as SyncResult)
    } catch { /* */ }
  }

  const loadExportData = async () => {
    try {
      const [bRes, aRes] = await Promise.all([
        httpClient.get('/api/odoo/budget-rows?year=2026'),
        httpClient.get('/api/odoo/actuals-rows?year=2026'),
      ])
      setBudgetRows(bRes.data ?? [])
      setActualsRows(aRes.data ?? [])
    } catch { /* */ }
  }

  const loadDbStats = async () => {
    try {
      const { data } = await httpClient.get<{ budgetRows: number; actualsRows: number }>('/api/odoo/status')
      setDbStats([
        { label: "Budget rows (active)", value: String(data?.budgetRows ?? 0) },
        { label: "Actuals rows", value: String(data?.actualsRows ?? 0) },
      ])
    } catch { setDbStats([]) }
  }

  useEffect(() => { checkHealth(); loadLastSync(); loadDbStats(); loadExportData() }, [])

  const runSync = async () => {
    setSyncing(true); setError(null); setProgressPct(0); setStepLabel("Connecting to Odoo…")
    timer.current = setInterval(() => setProgressPct(p => Math.min(p + 8, 90)), 800)
    try {
      setStepLabel("Fetching budgets & execution data…")
      const { data } = await httpClient.post<SyncResult>('/api/odoo/sync?year=2026')
      setSyncResult(data)
      setProgressPct(100); setStepLabel(null)
      await Promise.all([loadDbStats(), loadExportData()])
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Sync failed')
    } finally {
      if (timer.current) clearInterval(timer.current)
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Connection banner */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={cn('size-2 rounded-full', healthOk === true ? 'bg-emerald-500' : healthOk === false ? 'bg-destructive' : 'bg-muted')} />
          <span className="text-sm font-medium">{healthOk === true ? 'Odoo Connected' : healthOk === false ? 'Odoo Unreachable' : 'Checking…'}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { checkHealth(); loadDbStats(); loadExportData() }}><RefreshCw className="size-3.5 mr-1" />Refresh</Button>
          <Button size="sm" onClick={runSync} disabled={syncing || healthOk !== true}>
            <RefreshCw className={cn('size-3.5 mr-1', syncing && 'animate-spin')} />
            {syncing ? 'Syncing…' : 'Start Sync'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4" />{error}
        </div>
      )}

      {/* Progress Bar */}
      {(syncing || syncResult) && (
        <SyncProgress isRunning={syncing} progressPct={progressPct} stepLabel={stepLabel} />
      )}

      {/* Sync Details */}
      {syncResult && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
            <span className="font-mono text-sm font-semibold">Sync #{syncResult.runId}</span>
            <span className="text-xs text-muted-foreground">Year {syncResult.year} · {fmtMs(syncResult.durationMs)}</span>
            <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">Complete</span>
          </div>

          <Section icon={<FileSpreadsheet className="size-4" />}
            title="Forecast" defaultOpen
            subtitle={`${syncResult.budgetRowsUpserted} rows upserted from ${syncResult.budgetLinesFetched} Odoo lines`}
            onCsv={() => exportToCsv(budgetRows, "odoo-forecast")}
            onJson={() => exportToJson(budgetRows, "odoo-forecast")}
            onExcel={() => exportToExcel(budgetRows, "odoo-forecast")}>
            {budgetRows.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/60 sticky top-0">
                    {["Department","Account","FG","Forecast Amount"].map(h => (
                      <th key={h} className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-left">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {budgetRows.slice(0, 100).map((r: any, i: number) => (
                      <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                        <td className="px-2 py-1 text-xs max-w-[140px] truncate">{r.Department}</td>
                        <td className="px-2 py-1 text-xs max-w-[200px] truncate">{r.Account}</td>
                        <td className="px-2 py-1 text-xs">{r.FinancialGroup}</td>
                        <td className="px-2 py-1 font-mono text-xs text-right">{money(r.ForecastAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section icon={<Layers className="size-4" />}
            title="Execution" defaultOpen
            subtitle={`${syncResult.actualsRowsUpserted} rows upserted from ${syncResult.analyticLinesFetched} Odoo lines`}
            onCsv={() => exportToCsv(actualsRows, "odoo-execution")}
            onJson={() => exportToJson(actualsRows, "odoo-execution")}
            onExcel={() => exportToExcel(actualsRows, "odoo-execution")}>
            {actualsRows.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/60 sticky top-0">
                    {["Department","Account","FG","Month","Amount"].map(h => (
                      <th key={h} className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-left">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {actualsRows.slice(0, 100).map((r: any, i: number) => (
                      <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                        <td className="px-2 py-1 text-xs max-w-[140px] truncate">{r.Department}</td>
                        <td className="px-2 py-1 text-xs max-w-[200px] truncate">{r.Account}</td>
                        <td className="px-2 py-1 text-xs">{r.FinancialGroup}</td>
                        <td className="px-2 py-1 font-mono text-xs">{r.Year}-{String(r.Month).padStart(2,'0')}</td>
                        <td className="px-2 py-1 font-mono text-xs text-right">{money(r.Amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
      )}

      {dbStats.length > 0 && <DatabaseState stats={dbStats} />}
    </div>
  )
}
