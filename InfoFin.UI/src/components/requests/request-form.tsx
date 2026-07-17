'use client'

import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { UploadCloud, X, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  createSpendRequest,
  getSpendRequestById,
  getDepartments,
  getAccounts,
  getCurrencies,
  getVendors,
  getUsers,
} from '@/api/spendRequestService'
import type {
  Department,
  Account,
  Currency,
  Vendor,
  User,
} from '@/types/spend-request'

export function RequestForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<Account[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [users, setUsers] = useState<User[]>([])

  const [departmentId, setDepartmentId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [assignedToUserId, setAssignedToUserId] = useState('')
  const [currencyId, setCurrencyId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  // Load lookups
  useEffect(() => {
    setLoading(true)
    Promise.all([
      getDepartments(),
      getAccounts(),
      getCurrencies(),
      getVendors(),
      getUsers({ isActive: true }),
      editId ? getSpendRequestById(Number(editId)) : null,
    ])
      .then(([depts, cats, curs, vends, usrs, existing]) => {
        setDepartments(depts)
        setCategories(cats)
        setCurrencies(curs)
        setVendors(vends)
        setUsers(usrs)
        if (existing) {
          setDepartmentId(String(existing.departmentId))
          setCategoryId(String(existing.categoryId))
          setVendorId(existing.vendorId ? String(existing.vendorId) : '')
          setAssignedToUserId(existing.assignedToUserId ? String(existing.assignedToUserId) : '')
          setCurrencyId(String(existing.currencyId))
          setAmount(String(existing.amount))
          setDescription(existing.description ?? '')
        } else if (curs.length > 0) {
          setCurrencyId(String(curs[0].id))
        }
      })
      .finally(() => setLoading(false))
  }, [editId])

  const selectedCurrency = currencies.find((c) => c.id === Number(currencyId))
  const fcRate = selectedCurrency?.exchangeRateToUSD ?? 1

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files).map((f) => f.name)
    setFiles((prev) => [...prev, ...dropped])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await createSpendRequest({
        departmentId: Number(departmentId),
        categoryId: Number(categoryId),
        amount: Number(amount),
        currencyId: Number(currencyId),
        vendorId: vendorId ? Number(vendorId) : null,
        assignedToUserId: assignedToUserId ? Number(assignedToUserId) : null,
        description,
      })
      navigate('/expenses/requests')
    } catch {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back"
          onClick={() => navigate('/expenses/requests')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {editId ? 'Edit Spend Request' : 'New Spend Request'}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          className="grid grid-cols-1 gap-6 lg:col-span-2 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Department">
                <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                  <option value="" disabled>Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Account">
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  <option value="" disabled>Select Account</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Vendor">
                <Select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                  <option value="">None</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Assigned To">
                <Select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)}>
                  <option value="">None</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.email}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Currency">
                <Select value={currencyId} onChange={(e) => setCurrencyId(e.target.value)} required>
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} (rate: {c.exchangeRateToUSD})
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Amount">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>

              {selectedCurrency && selectedCurrency.code !== 'USD' && (
                <Field label={`Amount in USD (rate: ${fcRate})`}>
                  <Input
                    type="text"
                    readOnly
                    value={amount ? (Number(amount) / fcRate).toFixed(2) : '0.00'}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the business need for this spend\u2026"
                  className="min-h-32"
                  required
                />
              </Field>

              <div className="flex flex-col gap-2">
                <Label>Attachments</Label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
                    dragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/40',
                  )}
                >
                  <UploadCloud className="size-7 text-muted-foreground" />
                  <p className="text-sm font-medium">Drag &amp; drop files here</p>
                  <p className="text-xs text-muted-foreground">PDF, XLSX, PNG up to 10 MB</p>
                </div>
                {files.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {files.map((name, i) => (
                      <li key={`${name}-${i}`} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                        <span className="flex-1 truncate">{name}</span>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove"
                          onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}>
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
            <Button variant="secondary" type="button" onClick={() => navigate('/expenses/requests')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting\u2026' : 'Submit for Approval'}
            </Button>
          </div>
        </form>

        <Card className="h-fit">
          <CardHeader><CardTitle>Approval Flow</CardTitle></CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-4">
              {['Posted', 'Under Review', 'Approved', 'Completed'].map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className={cn(
                    'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                    i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}>
                    {i + 1}
                  </span>
                  <span className={cn('text-sm', i === 0 ? 'font-medium' : 'text-muted-foreground')}>
                    {step}
                  </span>
                </li>
              ))}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
