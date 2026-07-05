'use client'

import { useState, useEffect, useRef } from 'react'
import { RefreshCw, CheckCircle2, Circle, AlertCircle, Database, Building2, FolderOpen, FileText, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { httpClient } from '@/api/httpClient'

interface SyncStatus {
  companies: number
  categories: number
  journalLines: number
  actualsRows: number
  lastSync: string | null
  availableYears: number[]
}

interface SyncResult {
  companies: number
  categoriesCreated: number
  categoriesUpdated: number
  journalLines: number
  actualsRows: number
}

const STEPS = [
  { key: 'companies', label: 'Companies → Departments', icon: Building2 },
  { key: 'categories', label: 'Accounts → Categories', icon: FolderOpen },
  { key: 'journals', label: 'Journal Lines', icon: FileText },
  { key: 'actuals', label: 'Aggregate to Actuals', icon: Table2 },
]

export default function OdooSyncWizard() {
  const [status, setStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncStep, setSyncStep] = useState(-1)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [healthOk, setHealthOk] = useState<boolean | null>(null)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const { data } = await httpClient.get('/api/odoo/status')
      setStatus(data)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    try {
      const { data } = await httpClient.get('/api/odoo/health')
      setHealthOk(data.connected)
    } catch {
      setHealthOk(false)
    }
  }

  useEffect(() => { fetchStatus(); checkHealth() }, [])

  const runSync = async () => {
    setSyncing(true)
    setSyncStep(0)
    setError(null)
    setSyncResult(null)

    // Simulate step progression while sync runs
    stepTimer.current = setInterval(() => {
      setSyncStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 2000)

    try {
      const { data } = await httpClient.post<SyncResult>('/api/odoo/sync')
      setSyncResult(data)
      setSyncStep(4) // all done
      await fetchStatus()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Sync failed. Check Odoo connectivity.')
      setSyncStep(-1)
    } finally {
      if (stepTimer.current) clearInterval(stepTimer.current)
      setSyncing(false)
    }
  }

  const progressPct = syncStep >= 0 ? Math.round(((syncStep + 1) / STEPS.length) * 100) : 0
  const isComplete = syncResult !== null

  return (
    <div className="flex flex-col gap-6">
      {/* Connection status banner */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <div className={`size-2 rounded-full ${healthOk === true ? 'bg-green-500' : healthOk === false ? 'bg-destructive' : 'bg-muted'}`} />
          <span className="text-sm font-medium">
            {healthOk === true ? 'Odoo Connected' : healthOk === false ? 'Odoo Unreachable' : 'Checking...'}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchStatus(); checkHealth() }} disabled={loading}>
            <RefreshCw className={`size-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={runSync} disabled={syncing || healthOk !== true}>
            <RefreshCw className={`size-3.5 mr-1 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Start Sync'}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {(syncing || isComplete) && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {isComplete ? 'Sync Complete' : 'Sync in Progress...'}
            </h3>
            <Badge variant={isComplete ? 'success' : 'neutral'}>
              {isComplete ? '100%' : `${progressPct}%`}
            </Badge>
          </div>
          <Progress value={isComplete ? 100 : progressPct} className="h-2" />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {STEPS.map((step, i) => {
              const done = isComplete || (syncing && i <= syncStep)
              const active = syncing && i === syncStep
              const Icon = step.icon
              return (
                <div key={step.key} className="flex flex-col items-center gap-1 text-center">
                  <div className={`flex size-8 items-center justify-center rounded-full ${
                    done ? 'bg-green-100 text-green-600' :
                    active ? 'bg-primary/10 text-primary animate-pulse' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {done ? <CheckCircle2 className="size-4" /> :
                     active ? <RefreshCw className="size-4 animate-spin" /> :
                     <Circle className="size-4" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{step.label}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      {/* Sync results */}
      {isComplete && syncResult && (
        <Card>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">Companies mapped</span>
              <Badge variant="neutral">{syncResult.companies}</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">Categories created</span>
              <Badge variant="success">{syncResult.categoriesCreated}</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">Categories updated</span>
              <Badge variant="neutral">{syncResult.categoriesUpdated}</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">Journal lines imported</span>
              <Badge variant="neutral">{syncResult.journalLines}</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">Actuals rows aggregated</span>
              <Badge variant="neutral">{syncResult.actualsRows}</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Current state summary */}
      {status && (
        <Card>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Database className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Current Database State</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 text-sm">
            <div>
              <span className="text-muted-foreground">Companies with Odoo ID</span>
              <p className="font-semibold">{status.companies}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Categories with Odoo ID</span>
              <p className="font-semibold">{status.categories}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Journal lines</span>
              <p className="font-semibold">{status.journalLines.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Actuals rows</span>
              <p className="font-semibold">{status.actualsRows}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last sync</span>
              <p className="font-semibold">{status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Available years</span>
              <p className="font-semibold">{status.availableYears?.join(', ') || 'None'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
