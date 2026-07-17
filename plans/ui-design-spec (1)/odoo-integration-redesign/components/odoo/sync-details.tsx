"use client"

import { useState } from "react"
import {
  Building2,
  BookOpen,
  FileText,
  Layers,
  Target,
  ChevronDown,
  CornerDownRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportMenu } from "@/components/odoo/export-menu"
import { exportToCsv, exportToJson } from "@/lib/export"
import {
  companyMappings,
  accountStats,
  budgetStats,
  journalLines,
  actualsRows,
  syncMeta,
  type AccountStat,
} from "@/lib/odoo-data"

const toneClasses: Record<AccountStat["tone"], string> = {
  success: "border-success/20 bg-success/8 text-success",
  info: "border-primary/20 bg-primary/8 text-primary",
  warning: "border-warning/30 bg-warning/10 text-warning-foreground",
  danger: "border-destructive/20 bg-destructive/8 text-destructive",
  neutral: "border-border bg-muted text-foreground",
}

function StatTile({ stat }: { stat: AccountStat }) {
  return (
    <div className={cn("rounded-lg border px-4 py-3", toneClasses[stat.tone])}>
      <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{stat.label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{stat.value.toLocaleString()}</p>
    </div>
  )
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  defaultOpen?: boolean
  onCsv: () => void
  onJson: () => void
  children: React.ReactNode
}

function Section({ icon, title, subtitle, defaultOpen = false, onCsv, onJson, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex flex-1 items-center justify-between text-left"
        >
          <span>
            <span className="block text-sm font-semibold text-foreground">{title}</span>
            <span className="block text-xs text-muted-foreground">{subtitle}</span>
          </span>
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>
        <ExportMenu size="sm" label="Export" onCsv={onCsv} onJson={onJson} />
      </div>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            {headers.map((h, i) => (
              <th
                key={h}
                className={cn(
                  "px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                  i === 0 ? "text-left" : "text-right",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-b-0 hover:bg-muted/40">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "px-3 py-2",
                    ci === 0 ? "font-medium text-foreground" : "text-right font-mono tabular-nums text-muted-foreground",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function money(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function SyncDetails() {
  const companyRows = companyMappings.flatMap((c) =>
    c.departments.map((d) => ({ company: c.company, department: d })),
  )

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">Sync #{syncMeta.id}</span>
          <span className="text-xs text-muted-foreground">
            {syncMeta.finishedAt} · {syncMeta.durationLabel}
          </span>
        </div>
        <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
          {syncMeta.status}
        </span>
      </div>

      {/* Companies → Departments */}
      <Section
        icon={<Building2 className="size-4" />}
        title="Companies → Departments"
        subtitle={`${companyMappings.length} mapped`}
        defaultOpen
        onCsv={() => exportToCsv(companyRows, "odoo-company-mappings")}
        onJson={() => exportToJson(companyMappings, "odoo-company-mappings")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {companyMappings.map((c) => (
            <div key={c.company} className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm font-semibold text-foreground">{c.company}</p>
              <ul className="mt-2 space-y-1">
                {c.departments.map((d) => (
                  <li key={d} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CornerDownRight className="size-3 text-primary/70" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Odoo Accounts */}
      <Section
        icon={<BookOpen className="size-4" />}
        title="Odoo Accounts"
        subtitle="0 created · 883 updated"
        defaultOpen
        onCsv={() => exportToCsv(accountStats, "odoo-accounts-summary")}
        onJson={() => exportToJson(accountStats, "odoo-accounts-summary")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {accountStats.map((s) => (
            <StatTile key={s.label} stat={s} />
          ))}
        </div>
      </Section>

      {/* Journal Lines */}
      <Section
        icon={<FileText className="size-4" />}
        title="Journal Lines"
        subtitle="6,363 imported"
        onCsv={() => exportToCsv(journalLines, "odoo-journal-lines")}
        onJson={() => exportToJson(journalLines, "odoo-journal-lines")}
      >
        <p className="mb-2 text-xs text-muted-foreground">Showing latest {journalLines.length} of 6,363 lines</p>
        <DataTable
          headers={["ID", "Account", "Company", "Period", "Debit", "Credit"]}
          rows={journalLines.map((l) => [l.id, l.account, l.company, l.period, money(l.debit), money(l.credit)])}
        />
      </Section>

      {/* Actuals Aggregated */}
      <Section
        icon={<Layers className="size-4" />}
        title="Actuals Aggregated"
        subtitle="922 rows"
        onCsv={() => exportToCsv(actualsRows, "odoo-actuals")}
        onJson={() => exportToJson(actualsRows, "odoo-actuals")}
      >
        <p className="mb-2 text-xs text-muted-foreground">Showing top {actualsRows.length} of 922 rows</p>
        <DataTable
          headers={["Account", "Department", "Year", "Amount"]}
          rows={actualsRows.map((r) => [r.account, r.department, r.year, money(r.amount)])}
        />
      </Section>

      {/* Budget Forecasts */}
      <Section
        icon={<Target className="size-4" />}
        title="Budget Forecasts"
        subtitle="91 mapped · 125 Odoo lines"
        defaultOpen
        onCsv={() => exportToCsv(budgetStats, "odoo-budget-forecasts")}
        onJson={() => exportToJson(budgetStats, "odoo-budget-forecasts")}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {budgetStats.map((s) => (
            <StatTile key={s.label} stat={s} />
          ))}
        </div>
      </Section>
    </section>
  )
}
