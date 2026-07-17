"use client"

import { useEffect, useRef, useState } from "react"
import { Download, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExportMenuProps {
  onCsv: () => void
  onJson: () => void
  onExcel?: () => void
  label?: string
  size?: "sm" | "default"
  align?: "start" | "end"
}

export function ExportMenu({ onCsv, onJson, onExcel, label = "Export", size = "default", align = "end" }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open} className={cn("inline-flex items-center gap-1.5 rounded-lg border border-border bg-card font-medium text-foreground transition-colors hover:bg-muted", size === "sm" ? "h-7 px-2 text-xs" : "h-8 px-2.5 text-sm")}>
        <Download className={size === "sm" ? "size-3.5" : "size-4"} />{label}<ChevronDown className={cn("opacity-60", size === "sm" ? "size-3" : "size-3.5")} />
      </button>
      {open && (
        <div className={cn("absolute z-50 mt-1 w-36 rounded-lg border border-border bg-card py-1 shadow-lg", align === "end" ? "right-0" : "left-0")}>
          {onExcel && <button type="button" onClick={() => { onExcel(); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted">Export Excel</button>}
          <button type="button" onClick={() => { onCsv(); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted">Export CSV</button>
          <button type="button" onClick={() => { onJson(); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted">Export JSON</button>
        </div>
      )}
    </div>
  )
}
