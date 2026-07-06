'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { UploadCloud, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  spendRequests,
  departments,
  categoryTree,
  vendors,
  currencies,
} from '@/lib/mock-data'

export function RequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const existing = editId
    ? spendRequests.find((r) => r.id === editId)
    : undefined

  const [currency, setCurrency] = useState<'USD' | 'FC'>(
    existing?.currency ?? 'USD',
  )
  const [rate, setRate] = useState(
    existing?.exchangeRate ?? currencies.find((c) => c.code === 'FC')!.rate,
  )
  const [files, setFiles] = useState<string[]>(
    existing?.attachments.map((a) => a.name) ?? [],
  )
  const [dragging, setDragging] = useState(false)

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files).map((f) => f.name)
    setFiles((prev) => [...prev, ...dropped])
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back"
          onClick={() => router.push('/requests')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {existing ? `Edit ${existing.ref}` : 'New Spend Request'}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          className="grid grid-cols-1 gap-6 lg:col-span-2 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            router.push('/requests')
          }}
        >
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Department">
                <Select defaultValue={existing?.department ?? ''} required>
                  <option value="" disabled>
                    Select department
                  </option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Category">
                <Select defaultValue={existing?.category ?? ''} required>
                  <option value="" disabled>
                    Select category
                  </option>
                  {categoryTree.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.classifications.flatMap((c) =>
                        c.items.map((item) => (
                          <option key={item} value={item}>
                            {c.name} › {item}
                          </option>
                        )),
                      )}
                    </optgroup>
                  ))}
                </Select>
              </Field>

              <Field label="Vendor">
                <Select defaultValue={existing?.vendor ?? ''}>
                  <option value="" disabled>
                    Select vendor
                  </option>
                  {vendors.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                  <option value="__new">+ Add new vendor…</option>
                </Select>
              </Field>

              <Field label="Currency">
                <div className="inline-flex h-10 w-full rounded-md border border-border p-0.5">
                  {(['USD', 'FC'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={cn(
                        'flex-1 rounded-[6px] text-sm font-medium transition-colors',
                        currency === c
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Amount">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={existing?.amount ?? ''}
                  placeholder="0.00"
                  required
                />
              </Field>

              {currency === 'FC' && (
                <Field label="Exchange rate (FC per USD)">
                  <Input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                  />
                </Field>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Justification &amp; Attachments</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field label="Description / Justification">
                <Textarea
                  defaultValue={existing?.description ?? ''}
                  placeholder="Explain the business need for this spend…"
                  className="min-h-32"
                  required
                />
              </Field>

              <div className="flex flex-col gap-2">
                <Label>Attachments</Label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
                    dragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/40',
                  )}
                >
                  <UploadCloud className="size-7 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag &amp; drop files here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, XLSX, PNG up to 10 MB
                  </p>
                </div>
                {files.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {files.map((name, i) => (
                      <li
                        key={`${name}-${i}`}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <span className="flex-1 truncate">{name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove"
                          onClick={() =>
                            setFiles((prev) => prev.filter((_, j) => j !== i))
                          }
                        >
                          <X className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button variant="secondary" type="button">
              Save as Draft
            </Button>
            <Button type="submit">Submit for Approval</Button>
          </div>
        </form>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Approval Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-4">
              {['Submitted', 'Director', 'FP&A', 'Managing Director'].map(
                (step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                        i === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        'text-sm',
                        i === 0 ? 'font-medium' : 'text-muted-foreground',
                      )}
                    >
                      {step}
                    </span>
                  </li>
                ),
              )}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              Requests route through each approver in sequence once submitted.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
