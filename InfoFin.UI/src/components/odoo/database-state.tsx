"use client"

import { Database } from "lucide-react"
import { ExportMenu } from "@/components/odoo/export-menu"
import { exportToCsv, exportToJson } from "@/lib/export"
import type { DbStat } from "@/lib/odoo-data"

interface DatabaseStateProps {
  stats: DbStat[]
}

export function DatabaseState({ stats }: DatabaseStateProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Current Database State</h2>
        </div>
        <ExportMenu size="sm" onCsv={() => exportToCsv(stats, "odoo-database-state")} onJson={() => exportToJson(stats, "odoo-database-state")} />
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-background px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
