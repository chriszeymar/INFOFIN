import { Check, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { syncStages, type StageStatus } from "@/lib/odoo-data"

function StageIcon({ status }: { status: StageStatus }) {
  if (status === "complete") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-success text-success-foreground">
        <Check className="size-4" />
      </span>
    )
  }
  if (status === "running") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Loader2 className="size-4 animate-spin" />
      </span>
    )
  }
  return (
    <span className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
      <Clock className="size-4" />
    </span>
  )
}

export function SyncProgress() {
  const completed = syncStages.filter((s) => s.status === "complete").length
  const percent = Math.round((completed / syncStages.length) * 100)
  const allDone = percent === 100

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {allDone ? "Sync Complete" : "Sync In Progress"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {completed} of {syncStages.length} stages finished
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            allDone ? "bg-success/10 text-success" : "bg-primary/10 text-primary",
          )}
        >
          {percent}%
        </span>
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", allDone ? "bg-success" : "bg-primary")}
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="grid grid-cols-2 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
        {syncStages.map((stage) => (
          <li key={stage.id} className="flex flex-col items-center gap-2 text-center">
            <StageIcon status={stage.status} />
            <div>
              <p className="text-xs font-medium leading-tight text-foreground text-balance">{stage.label}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {stage.records.toLocaleString()} · {(stage.durationMs / 1000).toFixed(1)}s
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
