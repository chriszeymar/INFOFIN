"use client"

import { PageHeader } from "@/components/odoo/page-header"
import { SyncProgress } from "@/components/odoo/sync-progress"
import { SyncDetails } from "@/components/odoo/sync-details"
import { DatabaseState } from "@/components/odoo/database-state"
import { exportToJson, exportToCsv } from "@/lib/export"
import {
  syncMeta,
  syncStages,
  companyMappings,
  accountStats,
  budgetStats,
  journalLines,
  actualsRows,
  databaseState,
} from "@/lib/odoo-data"

export default function Page() {
  const fullReport = {
    sync: syncMeta,
    stages: syncStages,
    companyMappings,
    accountStats,
    budgetStats,
    journalLines,
    actualsRows,
    databaseState,
  }

  function handleExportAllJson() {
    exportToJson(fullReport, `odoo-sync-${syncMeta.id}`)
  }

  function handleExportAllCsv() {
    // Flatten the database state as the headline summary CSV.
    exportToCsv(databaseState, `odoo-sync-${syncMeta.id}-summary`)
  }

  return (
    <main className="min-h-screen bg-background">
      <PageHeader onExportAllCsv={handleExportAllCsv} onExportAllJson={handleExportAllJson} />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6">
        <SyncProgress />
        <SyncDetails />
        <DatabaseState />
      </div>
    </main>
  )
}
