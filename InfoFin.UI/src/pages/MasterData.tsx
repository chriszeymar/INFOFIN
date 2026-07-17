'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FolderOpen,
  Building2,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Tags,
  Layers,
  FolderTree,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useSession } from '@/auth/AuthContext'
import { httpClient } from '@/api/httpClient'
import OdooSyncWizard from '@/components/master-data/OdooSyncWizard'

type Section =
  | null
  | 'Accounts'
  | 'Departments'
  | 'Classifications'
  | 'FinancialGroups'
  | 'DepartmentGroups'
  | 'Currencies'
  | 'OdooSync'

const SINGULAR: Record<NonNullable<Section>, string> = {
  Accounts: 'Account',
  Departments: 'Department',
  Classifications: 'Classification',
  FinancialGroups: 'Financial Group',
  DepartmentGroups: 'Department Group',
  Currencies: 'Currency',
  OdooSync: 'Sync',
}

const CARDS: {
  id: NonNullable<Section>
  label: string
  icon: typeof Building2
  description: string
  count: number
  color: string
  bg: string
}[] = [
  { id: 'Accounts', label: 'Accounts', icon: FolderOpen, description: 'Chart of accounts (P&L)', count: 0, color: 'bg-blue-600', bg: 'bg-blue-600' },
  { id: 'Departments', label: 'Departments', icon: Building2, description: 'Business units and organisational groups', count: 0, color: 'bg-violet-600', bg: 'bg-violet-600' },
  { id: 'Classifications', label: 'Classifications', icon: Tags, description: 'Cost groupings: Admin, Tech, Marketing', count: 0, color: 'bg-emerald-600', bg: 'bg-emerald-600' },
  { id: 'FinancialGroups', label: 'Financial Groups', icon: Layers, description: 'P&L structure: Revenue, COS, OPEX', count: 0, color: 'bg-amber-600', bg: 'bg-amber-600' },
  { id: 'DepartmentGroups', label: 'Dept Groups', icon: FolderTree, description: 'BU/SU groupings for departments', count: 0, color: 'bg-rose-600', bg: 'bg-rose-600' },
  { id: 'Currencies', label: 'Currencies', icon: DollarSign, description: 'Supported currencies and exchange rates', count: 0, color: 'bg-purple-600', bg: 'bg-purple-600' },
  { id: 'OdooSync', label: 'Odoo Sync', icon: RefreshCw, description: 'Sync actuals from Odoo ERP and manage integration', count: 0, color: 'bg-cyan-600', bg: 'bg-cyan-600' },
]

export default function MasterDataPage() {
  const { role } = useSession()
  const [section, setSection] = useState<Section>(null)
  const [addTrigger, setAddTrigger] = useState(0) // increment to trigger add modal

  if (role !== 'Admin') {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <ShieldAlert className="size-10 text-muted-foreground" />
        <p className="text-lg font-medium">Admin access required</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Switch to the Admin role using the selector in the top bar to manage
          master data.
        </p>
      </div>
    )
  }

  if (section === null) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-base font-semibold">Configuration Hub</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage the core data that drives spend requests, budgets, and approvals.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => {
            const Icon = c.icon
            return (
              <button
                key={c.id}
                onClick={() => setSection(c.id)}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-left transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className={cn('flex size-11 items-center justify-center rounded-xl', c.bg)}>
                    <Icon className="size-5 text-white" />
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{c.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>
                </div>
                <div className={cn('inline-flex items-center gap-1 self-start rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90', c.color)}>
                  Manage
                  <ChevronRight className="size-3.5" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSection(null)}
            aria-label="Back to Master Data"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className="text-base font-semibold">{section === 'OdooSync' ? 'Odoo Integration' : section}</h2>
        </div>
        {section !== 'OdooSync' && (
          <Button size="sm" onClick={() => setAddTrigger((p) => p + 1)}>
            <Plus className="size-4" />
            Add {SINGULAR[section]}
          </Button>
        )}
      </div>

      {section === 'Accounts' && <AccountsGrid addTrigger={addTrigger} />}
      {section === 'Departments' && <DepartmentsGrid addTrigger={addTrigger} />}
      {section === 'Classifications' && <ClassificationsGrid addTrigger={addTrigger} />}
      {section === 'FinancialGroups' && <FinancialGroupsGrid addTrigger={addTrigger} />}
      {section === 'DepartmentGroups' && <DepartmentGroupsGrid addTrigger={addTrigger} />}
      {section === 'Currencies' && <CurrenciesGrid />}
      {section === 'OdooSync' && <OdooSyncWizard />}
    </div>
  )
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={onEdit}>
        <Pencil className="size-4 text-amber-500" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={onDelete}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  )
}

// ─── Department CRUD ──────────────────────────────────────────────────────────

interface DeptRow { id: number; name: string; unit: string; group: string; departmentGroupId: number; bucketTypeId: number }
interface LookupItem { id: number; name: string }

function DepartmentsGrid({ addTrigger }: { addTrigger: number }) {
  const [depts, setDepts] = useState<DeptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deptGroups, setDeptGroups] = useState<LookupItem[]>([])
  const [editModal, setEditModal] = useState<DeptRow | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const [dRes, dgRes, btRes] = await Promise.all([
        httpClient.get('/api/departments', { params: { isActive: true } }),
        httpClient.get('/api/departmentgroups'),
        httpClient.get('/api/buckettypes'),
      ])
      const dgMap = new Map((dgRes.data as any[]).map((g: any) => [g.id, g]))
      const btMap = new Map((btRes.data as any[]).map((b: any) => [b.id, b]))
      setDeptGroups((dgRes.data as any[]).map((g: any) => ({ id: g.id, name: g.name })))
      setDepts((dRes.data as any[]).map((d: any) => {
        const dg = dgMap.get(d.departmentGroupId)
        const bt = dg ? btMap.get(dg.bucketTypeId) : null
        return {
          id: d.id, name: d.name,
          departmentGroupId: d.departmentGroupId,
          bucketTypeId: dg?.bucketTypeId ?? 0,
          unit: bt?.name ?? '—', group: dg?.name ?? '—',
        }
      }))
    } catch { /* fallback if API down */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Listen for add trigger
  useEffect(() => {
    if (addTrigger > 0) {
      setEditModal({ id: 0, name: '', unit: '', group: '', departmentGroupId: deptGroups[0]?.id ?? 1, bucketTypeId: 0 })
    }
  }, [addTrigger])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await httpClient.delete(`/api/departments/${deleteId}`)
      setDepts((prev) => prev.filter((d) => d.id !== deleteId))
    } catch { /* ignore */ }
    finally { setDeleteId(null) }
  }

  const handleSave = async (form: { name: string; departmentGroupId: number }) => {
    if (editModal && editModal.id > 0) {
      // Update
      await httpClient.put(`/api/departments/${editModal.id}`, {
        id: editModal.id, name: form.name, departmentGroupId: form.departmentGroupId, isActive: true,
      })
    } else {
      // Create
      await httpClient.post('/api/departments', {
        name: form.name, departmentGroupId: form.departmentGroupId, isActive: true,
      })
    }
    setEditModal(null)
    await load()
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>

  const totalPages = Math.max(1, Math.ceil(depts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedDepts = depts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 w-20">Actions</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="pr-6">Group</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {depts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No departments found. Click "Add Department" to create one.
                </TableCell>
              </TableRow>
            )}
            {paginatedDepts.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="pl-6">
                  <RowActions onEdit={() => setEditModal(d)} onDelete={() => setDeleteId(d.id)} />
                </TableCell>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>
                  <Badge variant={d.unit === 'BU' ? 'default' : 'neutral'}>{d.unit}</Badge>
                </TableCell>
                <TableCell className="pr-6 text-muted-foreground">{d.group}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {depts.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedDepts.length} of {depts.length} departments
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="icon-sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit/Create Modal */}
      {editModal !== null && (
        <DepartmentModal
          initial={editModal.id > 0 ? editModal : null}
          groups={deptGroups}
          onSave={handleSave}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeleteId(null)}>
          <div className="bg-card border rounded-lg shadow-xl p-5 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">Delete Department?</h3>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DepartmentModal({
  initial, groups, onSave, onClose,
}: {
  initial: DeptRow | null; groups: LookupItem[]; onSave: (f: { name: string; departmentGroupId: number }) => void; onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [groupId, setGroupId] = useState(initial?.departmentGroupId ?? groups[0]?.id ?? 1)
  const isCreate = !initial

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-card border rounded-lg shadow-xl p-5 w-96" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-4">{isCreate ? 'Add Department' : 'Edit Department'}</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department name" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium">Group</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(Number(e.target.value))}
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => onSave({ name, departmentGroupId: groupId })} disabled={!name.trim()}>
            {isCreate ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Account CRUD ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

interface CatRow { id: number; name: string; financialGroup: string; classification: string; financialGroupId: number; classificationId: number | null }

function AccountsGrid({ addTrigger }: { addTrigger: number }) {
  const [cats, setCats] = useState<CatRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fgList, setFgList] = useState<LookupItem[]>([])
  const [clList, setClList] = useState<LookupItem[]>([])
  const [editModal, setEditModal] = useState<CatRow | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const [cRes, fgRes, clRes] = await Promise.all([
        httpClient.get('/api/accounts', { params: { isActive: true } }),
        httpClient.get('/api/financialgroups'),
        httpClient.get('/api/classifications'),
      ])
      const fgMap = new Map((fgRes.data as any[]).map((f: any) => [f.id, f]))
      const clMap = new Map((clRes.data as any[]).map((c: any) => [c.id, c]))
      setFgList((fgRes.data as any[]).map((f: any) => ({ id: f.id, name: f.name })))
      setClList((clRes.data as any[]).map((c: any) => ({ id: c.id, name: c.name })))
      setCats((cRes.data as any[]).map((c: any) => ({
        id: c.id, name: c.name,
        financialGroupId: c.financialGroupId,
        classificationId: c.classificationId,
        financialGroup: fgMap.get(c.financialGroupId)?.name ?? '—',
        classification: clMap.get(c.classificationId)?.name ?? '—',
      })))
    } catch { /* fallback if API down */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (addTrigger > 0) setEditModal({ id: 0, name: '', financialGroup: '', classification: '', financialGroupId: fgList[0]?.id ?? 1, classificationId: null }) }, [addTrigger])

  const handleDelete = async () => {
    if (!deleteId) return
    try { await httpClient.delete(`/api/accounts/${deleteId}`); setCats((p) => p.filter((c) => c.id !== deleteId)) } catch {}
    setDeleteId(null)
  }

  const handleSave = async (form: { name: string; financialGroupId: number; classificationId: number | null }) => {
    if (editModal && editModal.id > 0) {
      await httpClient.put(`/api/accounts/${editModal.id}`, { id: editModal.id, name: form.name, financialGroupId: form.financialGroupId, classificationId: form.classificationId, isActive: true })
    } else {
      await httpClient.post('/api/accounts', { name: form.name, financialGroupId: form.financialGroupId, classificationId: form.classificationId, isActive: true })
    }
    setEditModal(null)
    await load()
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>

  const totalPages = Math.max(1, Math.ceil(cats.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedCats = cats.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 w-20">Actions</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Financial Group</TableHead>
              <TableHead className="pr-6">Classification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cats.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No accounts found. Click "Add Account" to create one.</TableCell></TableRow>
            )}
            {paginatedCats.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-6"><RowActions onEdit={() => setEditModal(c)} onDelete={() => setDeleteId(c.id)} /></TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><Badge variant="neutral">{c.financialGroup}</Badge></TableCell>
                <TableCell className="pr-6 text-muted-foreground">{c.classification}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {cats.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedCats.length} of {cats.length} accounts
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="icon-sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {editModal !== null && (
        <AccountModal initial={editModal.id > 0 ? editModal : null} fgList={fgList} clList={clList} onSave={handleSave} onClose={() => setEditModal(null)} />
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeleteId(null)}>
          <div className="bg-card border rounded-lg shadow-xl p-5 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">Delete Account?</h3>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AccountModal({ initial, fgList, clList, onSave, onClose }: {
  initial: CatRow | null; fgList: LookupItem[]; clList: LookupItem[]; onSave: (f: { name: string; financialGroupId: number; classificationId: number | null }) => void; onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [fgId, setFgId] = useState(initial?.financialGroupId ?? fgList[0]?.id ?? 1)
  const [clId, setClId] = useState<number | null>(initial?.classificationId ?? null)
  const isCreate = !initial

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-card border rounded-lg shadow-xl p-5 w-96" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-4">{isCreate ? 'Add Account' : 'Edit Account'}</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Account name" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium">Financial Group</label>
            <select value={fgId} onChange={(e) => setFgId(Number(e.target.value))} className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
              {fgList.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Classification</label>
            <select value={clId ?? ''} onChange={(e) => setClId(e.target.value ? Number(e.target.value) : null)} className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
              <option value="">— None —</option>
              {clList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => onSave({ name, financialGroupId: fgId, classificationId: clId })} disabled={!name.trim()}>
            {isCreate ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Simple lookup grids (Classifications, Financial Groups, Department Groups) ─

function LookupGrid({ title, rows, addTrigger, onSave, onDelete }: {
  title: string; rows: LookupItem[]; addTrigger: number;
  onSave: (form: { name: string }) => Promise<void>; onDelete: (id: number) => Promise<void>;
}) {
  const [editModal, setEditModal] = useState<LookupItem | null>(null)
  const [delId, setDelId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { if (addTrigger > 0) setEditModal({ id: 0, name: '' }) }, [addTrigger])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 w-20">Actions</TableHead>
              <TableHead>{title}</TableHead>
              <TableHead className="pr-6 w-20">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No entries found.</TableCell></TableRow>
            )}
            {paginatedRows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-6">
                  <RowActions onEdit={() => { setEditModal(r); setName(r.name) }} onDelete={() => setDelId(r.id)} />
                </TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="pr-6 text-xs text-muted-foreground">{r.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedRows.length} of {rows.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="icon-sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setEditModal(null)}>
          <div className="bg-card border rounded-lg shadow-xl p-5 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">{editModal.id > 0 ? 'Edit' : 'Add'} {title}</h3>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="mb-4" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditModal(null)}>Cancel</Button>
              <Button size="sm" onClick={async () => { await onSave({ name }); setEditModal(null) }} disabled={!name.trim()}>
                {editModal.id > 0 ? 'Save' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDelId(null)}>
          <div className="bg-card border rounded-lg shadow-xl p-5 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">Delete?</h3>
            <p className="text-sm text-muted-foreground mb-4">This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDelId(null)}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={async () => { await onDelete(delId); setDelId(null) }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Reusable hook for simple lookup CRUD
function useLookupCrud(endpoint: string) {
  const [rows, setRows] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true)
    try { const { data } = await httpClient.get(endpoint); setRows((data as any[]).map((r: any) => ({ id: r.id, name: r.name }))) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  const save = async (form: { name: string }, editId?: number) => {
    if (editId && editId > 0) {
      await httpClient.put(`${endpoint}/${editId}`, { id: editId, name: form.name, isActive: true })
    } else {
      await httpClient.post(endpoint, { name: form.name, isActive: true })
    }
    await load()
  }
  const del = async (id: number) => { try { await httpClient.delete(`${endpoint}/${id}`) } catch {}; await load() }
  return { rows, loading, save, del }
}

function ClassificationsGrid({ addTrigger }: { addTrigger: number }) {
  const { rows, loading, save, del } = useLookupCrud('/api/classifications')
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
  return <LookupGrid title="Classification" rows={rows} addTrigger={addTrigger}
    onSave={async (f) => save(f)} onDelete={async (id) => del(id)} />
}

function FinancialGroupsGrid({ addTrigger }: { addTrigger: number }) {
  const { rows, loading, save, del } = useLookupCrud('/api/financialgroups')
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
  return <LookupGrid title="Financial Group" rows={rows} addTrigger={addTrigger}
    onSave={async (f) => save(f)} onDelete={async (id) => del(id)} />
}

function DepartmentGroupsGrid({ addTrigger }: { addTrigger: number }) {
  const { rows, loading, save, del } = useLookupCrud('/api/departmentgroups')
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
  return <LookupGrid title="Department Group" rows={rows} addTrigger={addTrigger}
    onSave={async (f) => save(f)} onDelete={async (id) => del(id)} />
}

function CurrenciesGrid() {
  const [rows, setRows] = useState<{ id: number; code: string; rate: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await httpClient.get('/api/currencies')
      setRows((data as any[]).map((c: any) => ({ id: c.id, code: c.code, rate: c.exchangeRateToUSD })))
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const saveRate = async (id: number, rate: number) => {
    try { await httpClient.put(`/api/currencies/${id}`, { id, code: rows.find(r => r.id === id)?.code, exchangeRateToUSD: rate, updateDT: new Date().toISOString() }); await load() } catch {}
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Code</TableHead>
            <TableHead className="pr-6">Exchange Rate (to USD)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="pl-6 font-mono font-medium">{c.code}</TableCell>
              <TableCell className="pr-6">
                <Input type="number" step="0.000001" value={c.rate}
                  onChange={(e) => setRows((prev) => prev.map((p) => p.id === c.id ? { ...p, rate: Number(e.target.value) } : p))}
                  onBlur={() => saveRate(c.id, c.rate)}
                  className="h-8 w-40" disabled={c.code === 'USD'} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedRows.length} of {rows.length} currencies
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="icon-sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
