"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { CheckCircle2, Loader2 } from "lucide-react"

interface SyncProgressProps {
  isRunning: boolean
  progressPct: number
  stepLabel: string | null
}

export function SyncProgress({ isRunning, progressPct, stepLabel }: SyncProgressProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/40">
        {isRunning ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : (
          <CheckCircle2 className="size-4 text-emerald-500" />
        )}
        <span className="text-sm font-semibold">
          {isRunning ? (stepLabel ?? "Syncing…") : "Sync Complete"}
        </span>
        {isRunning && <span className="ml-auto text-xs text-muted-foreground">{progressPct}%</span>}
      </div>
      <div className="px-4 py-3">
        <Progress value={isRunning ? progressPct : 100} className={cn("h-2", !isRunning && "[&>div]:bg-emerald-500")} />
      </div>
    </div>
  )
}
