export interface SyncResult {
  runId: string
  year: number
  budgetLinesFetched: number
  budgetRowsUpserted: number
  analyticLinesFetched: number
  actualsRowsUpserted: number
  durationMs: number
}

export interface DbStat {
  label: string
  value: string
}
