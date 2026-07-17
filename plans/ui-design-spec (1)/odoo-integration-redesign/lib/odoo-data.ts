export type StageStatus = "complete" | "running" | "pending" | "error"

export interface SyncStage {
  id: string
  label: string
  status: StageStatus
  durationMs: number
  records: number
}

export interface CompanyMapping {
  company: string
  departments: string[]
}

export interface SyncMeta {
  id: string
  startedAt: string
  finishedAt: string
  durationLabel: string
  triggeredBy: string
  status: "Complete" | "Running" | "Failed"
  odooVersion: string
  database: string
}

export const syncMeta: SyncMeta = {
  id: "b0ce10f7",
  startedAt: "7/13/2026, 9:47:04 PM",
  finishedAt: "7/13/2026, 9:47:51 PM",
  durationLabel: "47.1s",
  triggeredBy: "Manual · admin@finance.io",
  status: "Complete",
  odooVersion: "17.0 Enterprise",
  database: "prod-finance-2026",
}

export const syncStages: SyncStage[] = [
  { id: "companies", label: "Companies → Departments", status: "complete", durationMs: 1200, records: 11 },
  { id: "accounts", label: "Gross Accounts", status: "complete", durationMs: 8400, records: 883 },
  { id: "journal", label: "Journal Lines", status: "complete", durationMs: 21600, records: 6363 },
  { id: "actuals", label: "Aggregate to Actuals", status: "complete", durationMs: 9100, records: 922 },
  { id: "budget", label: "Budget Forecasts", status: "complete", durationMs: 6800, records: 91 },
]

export const companyMappings: CompanyMapping[] = [
  { company: "AGMUX SA", departments: ["AGMUX", "AGMUX SA"] },
  { company: "GENISYS", departments: ["GENISYS - CLOUD", "GENISYS"] },
  { company: "INFOSET PAYROLL", departments: ["INFOSET PAYROLL"] },
  {
    company: "INFOSET SARL",
    departments: [
      "CIRRUS - DIGITAL",
      "INFOSET SARL - MONETIQUE",
      "DG",
      "EPA",
      "ADMIN & ACCOUNTING",
      "INFOSET SARL",
    ],
  },
]

export interface AccountStat {
  label: string
  value: number
  tone: "success" | "info" | "warning" | "danger" | "neutral"
}

export const accountStats: AccountStat[] = [
  { label: "New", value: 0, tone: "success" },
  { label: "Updated", value: 883, tone: "info" },
]

export const budgetStats: AccountStat[] = [
  { label: "Mapped", value: 91, tone: "success" },
  { label: "Skipped", value: 1, tone: "warning" },
  { label: "No account", value: 35, tone: "danger" },
]

export interface JournalLine {
  id: string
  account: string
  company: string
  period: string
  debit: number
  credit: number
}

export const journalLines: JournalLine[] = [
  { id: "JL-4471", account: "6011 · Purchases of goods", company: "INFOSET SARL", period: "2026-06", debit: 12450.0, credit: 0 },
  { id: "JL-4472", account: "7011 · Sales of services", company: "GENISYS", period: "2026-06", debit: 0, credit: 38900.5 },
  { id: "JL-4473", account: "6411 · Salaries", company: "INFOSET PAYROLL", period: "2026-06", debit: 54210.0, credit: 0 },
  { id: "JL-4474", account: "5121 · Bank", company: "AGMUX SA", period: "2026-06", debit: 0, credit: 12450.0 },
  { id: "JL-4475", account: "6063 · Supplies", company: "INFOSET SARL", period: "2026-05", debit: 1820.75, credit: 0 },
  { id: "JL-4476", account: "7061 · Service revenue", company: "GENISYS", period: "2026-05", debit: 0, credit: 21030.0 },
]

export interface ActualsRow {
  account: string
  department: string
  year: number
  amount: number
}

export const actualsRows: ActualsRow[] = [
  { account: "7011 · Sales of services", department: "GENISYS - CLOUD", year: 2026, amount: 421900.0 },
  { account: "6411 · Salaries", department: "INFOSET PAYROLL", year: 2026, amount: -318400.0 },
  { account: "6011 · Purchases of goods", department: "INFOSET SARL", year: 2026, amount: -142600.5 },
  { account: "6063 · Supplies", department: "ADMIN & ACCOUNTING", year: 2026, amount: -18220.75 },
  { account: "7061 · Service revenue", department: "CIRRUS - DIGITAL", year: 2026, amount: 96540.0 },
]

export interface DbStat {
  label: string
  value: string
}

export const databaseState: DbStat[] = [
  { label: "Companies with Odoo ID", value: "11" },
  { label: "Accounts with Odoo ID", value: "420" },
  { label: "Journal lines", value: "6,363" },
  { label: "Actuals rows", value: "922" },
  { label: "Budget rows (2026)", value: "91" },
  { label: "Last sync", value: "7/13/2026, 9:47:51 PM" },
  { label: "Available years", value: "2026" },
]
