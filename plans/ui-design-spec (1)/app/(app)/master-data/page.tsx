'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  FolderTree,
  ShieldAlert,
  FolderOpen,
  Building2,
  Users,
  Store,
  DollarSign,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { useSession } from '@/components/session-provider'
import {
  categoryTree,
  masterDepartments,
  masterUsers,
  masterVendors,
  currencies,
} from '@/lib/mock-data'

type Section =
  | null
  | 'Categories'
  | 'Departments'
  | 'Users'
  | 'Vendors'
  | 'Currencies'

const SINGULAR: Record<NonNullable<Section>, string> = {
  Categories: 'Category',
  Departments: 'Department',
  Users: 'User',
  Vendors: 'Vendor',
  Currencies: 'Currency',
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
  {
    id: 'Categories',
    label: 'Categories',
    icon: FolderOpen,
    description: 'Expense types and classification groups',
    count: 3,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'Departments',
    label: 'Departments',
    icon: Building2,
    description: 'Business units and organisational groups',
    count: masterDepartments.length,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    id: 'Users',
    label: 'Users',
    icon: Users,
    description: 'System users, roles and access',
    count: masterUsers.length,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    id: 'Vendors',
    label: 'Vendors',
    icon: Store,
    description: 'Approved suppliers and service providers',
    count: masterVendors.length,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    id: 'Currencies',
    label: 'Currencies',
    icon: DollarSign,
    description: 'Supported currencies and exchange rates',
    count: currencies.length,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
]

export default function MasterDataPage() {
  const { role } = useSession()
  const [section, setSection] = useState<Section>(null)

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
                    <Icon className={cn('size-5', c.color)} />
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-foreground">
                    {c.count}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{c.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>
                </div>
                <div className={cn('flex items-center gap-1 text-xs font-medium', c.color)}>
                  Manage
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
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
          <h2 className="text-base font-semibold">{section}</h2>
        </div>
        <Button size="sm">
          <Plus className="size-4" />
          Add {SINGULAR[section]}
        </Button>
      </div>

      {section === 'Categories' && <CategoriesGrid />}
      {section === 'Departments' && <DepartmentsGrid />}
      {section === 'Users' && <UsersGrid />}
      {section === 'Vendors' && <VendorsGrid />}
      {section === 'Currencies' && <CurrenciesGrid />}
    </div>
  )
}

function RowActions() {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Edit">
        <Pencil className="size-4 text-amber-500" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Delete">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  )
}

function CategoriesGrid() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-5">
        {categoryTree.map((group) => (
          <div key={group.group} className="rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
              <FolderTree className="size-4 text-primary" />
              <span className="text-sm font-semibold">{group.group}</span>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {group.classifications.map((c) => (
                <div key={c.name} className="px-4 py-3">
                  <p className="mb-2 text-sm font-medium">{c.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                      >
                        <ChevronRight className="size-3" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function DepartmentsGrid() {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Actions</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="pr-6">Group</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {masterDepartments.map((d) => (
            <TableRow key={d.name}>
              <TableCell className="pl-6">
                <RowActions />
              </TableCell>
              <TableCell className="font-medium">{d.name}</TableCell>
              <TableCell>
                <Badge variant={d.unit === 'BU' ? 'default' : 'neutral'}>
                  {d.unit}
                </Badge>
              </TableCell>
              <TableCell className="pr-6 text-muted-foreground">{d.group}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function UsersGrid() {
  const [users, setUsers] = useState(masterUsers)
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Actions</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="pr-6">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u, i) => (
            <TableRow key={u.email}>
              <TableCell className="pl-6">
                <RowActions />
              </TableCell>
              <TableCell className="font-medium">{u.email}</TableCell>
              <TableCell>
                <Badge variant="neutral">{u.role}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{u.department}</TableCell>
              <TableCell className="pr-6">
                <button
                  onClick={() =>
                    setUsers((prev) =>
                      prev.map((p, j) =>
                        j === i ? { ...p, active: !p.active } : p,
                      ),
                    )
                  }
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    u.active ? 'bg-success' : 'bg-muted-foreground/30',
                  )}
                  aria-label="Toggle active"
                >
                  <span
                    className={cn(
                      'absolute top-0.5 size-4 rounded-full bg-card transition-transform',
                      u.active ? 'translate-x-4' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function VendorsGrid() {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Actions</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="pr-6">Country</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {masterVendors.map((v) => (
            <TableRow key={v.name}>
              <TableCell className="pl-6">
                <RowActions />
              </TableCell>
              <TableCell className="font-medium">{v.name}</TableCell>
              <TableCell className="text-muted-foreground">{v.category}</TableCell>
              <TableCell className="pr-6 text-muted-foreground">{v.country}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function CurrenciesGrid() {
  const [rows, setRows] = useState(currencies)
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Actions</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="pr-6 w-48">Exchange Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c, i) => (
            <TableRow key={c.code}>
              <TableCell className="pl-6">
                <RowActions />
              </TableCell>
              <TableCell className="font-mono font-medium">{c.code}</TableCell>
              <TableCell className="text-muted-foreground">{c.name}</TableCell>
              <TableCell className="pr-6">
                <Input
                  type="number"
                  step="0.01"
                  value={c.rate}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((p, j) =>
                        j === i ? { ...p, rate: Number(e.target.value) } : p,
                      ),
                    )
                  }
                  className="h-8 w-32"
                  disabled={c.code === 'USD'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
