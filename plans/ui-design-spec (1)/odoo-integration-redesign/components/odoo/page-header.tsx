"use client"

import { ArrowLeft, RefreshCw, Play, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExportMenu } from "@/components/odoo/export-menu"
import { syncMeta } from "@/lib/odoo-data"

interface PageHeaderProps {
  onExportAllCsv: () => void
  onExportAllJson: () => void
}

export function PageHeader({ onExportAllCsv, onExportAllJson }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Go back"
            className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Odoo Integration</h1>
            <p className="text-xs text-muted-foreground">
              {syncMeta.odooVersion} · {syncMeta.database}
            </p>
          </div>
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <Circle className="size-2 fill-current" />
            Connected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu label="Export all" onCsv={onExportAllCsv} onJson={onExportAllJson} />
          <Button variant="outline" size="sm">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          <Button size="sm">
            <Play className="size-3.5" />
            Start Sync
          </Button>
        </div>
      </div>
    </div>
  )
}
