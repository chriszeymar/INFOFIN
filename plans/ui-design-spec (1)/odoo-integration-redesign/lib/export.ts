function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsv(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) {
    triggerDownload("", `${filename}.csv`, "text/csv;charset=utf-8;")
    return
  }
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
  ]
  triggerDownload(lines.join("\n"), `${filename}.csv`, "text/csv;charset=utf-8;")
}

export function exportToJson(data: unknown, filename: string) {
  triggerDownload(
    JSON.stringify(data, null, 2),
    `${filename}.json`,
    "application/json;charset=utf-8;",
  )
}
