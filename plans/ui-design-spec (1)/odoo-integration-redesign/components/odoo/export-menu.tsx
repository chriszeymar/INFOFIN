"use client"

import { useEffect, useRef, useState } from "react"
import { Download, FileJson, FileSpreadsheet, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExportMenuProps {
  onCsv: () => void
  onJson: () => void
  label?: string
  size?: "sm" | "default"
  align?: "start" | "end"
}

export function ExportMenu({
  onCsv,
  onJson,
  label = "Export",
  size = "default",
  align = "end",
}: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card font-medium text-foreground transition-colors hover:bg-muted",
          size === "sm" ? "h-7 px-2 text-xs" : "h-8 px-2.5 text-sm",
        )}
      >
        <Download className={size === "sm" ? "size-3.5" : "size-4"} />
        {label}
        <ChevronDown className={cn("opacity-60", size === "sm" ? "size-3" : "size-3.5")} />
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-20 mt-1.5 min-w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onCsv()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-popover-foreground transition-colors hover:bg-muted"
          >
            <FileSpreadsheet className="size-4 text-success" />
            Export as CSV
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onJson()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-popover-foreground transition-colors hover:bg-muted"
          >
            <FileJson className="size-4 text-primary" />
            Export as JSON
          </button>
        </div>
      )}
    </div>
  )
}
