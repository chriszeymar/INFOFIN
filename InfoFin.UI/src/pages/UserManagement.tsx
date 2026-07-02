'use client'

import { useMemo, useState } from 'react'
import {
  UserPlus,
  Search,
  Users as UsersIcon,
  UserCheck,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { masterUsers, masterDepartments } from '@/lib/mock-data'
import { ROLES } from '@/auth/AuthContext'

type User = {
  name: string
  email: string
  role: string
  department: string
  active: boolean
}

function nameFromEmail(email: string) {
  const [local] = email.split('@')
  return local
    .split('.')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

const initialUsers: User[] = masterUsers.map((u) => ({
  name: nameFromEmail(u.email),
  email: u.email,
  role: u.role,
  department: u.department,
  active: u.active,
}))

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showInvite, setShowInvite] = useState(false)

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchesQuery =
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
        const matchesRole = roleFilter === 'all' || u.role === roleFilter
        return matchesQuery && matchesRole
      }),
    [users, query, roleFilter],
  )

  const stats = [
    { label: 'Total Users', value: users.length, icon: UsersIcon, tint: 'bg-primary/10 text-primary' },
    { label: 'Active', value: users.filter((u) => u.active).length, icon: UserCheck, tint: 'bg-success/12 text-success' },
    { label: 'Administrators', value: users.filter((u) => u.role === 'Admin').length, icon: ShieldCheck, tint: 'bg-accent text-accent-foreground' },
  ]

  function toggleActive(email: string) {
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, active: !u.active } : u)),
    )
  }

  function changeRole(email: string, role: string) {
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, role } : u)),
    )
  }

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') || '')
    if (!email) return
    setUsers((prev) => [
      {
        name: String(form.get('name') || nameFromEmail(email)),
        email,
        role: String(form.get('role') || 'Requester'),
        department: String(form.get('department') || 'Marketing'),
        active: true,
      },
      ...prev,
    ])
    setShowInvite(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {s.value}
                  </span>
                </div>
                <div className={`flex size-10 items-center justify-center rounded-lg ${s.tint}`}>
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:min-w-64 sm:flex-none">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="pl-9 sm:w-72"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 w-44"
        >
          <option value="all">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
        <Button className="ml-auto" onClick={() => setShowInvite(true)}>
          <UserPlus className="size-4" />
          Invite User
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => {
              const initials = u.name
                .split(' ')
                .map((n) => n[0])
                .join('')
              return (
                <TableRow key={u.email}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {initials}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{u.department}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onChange={(e) => changeRole(u.email, e.target.value)}
                      className="h-8 w-40 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.active ? 'success' : 'neutral'}>
                      {u.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(u.email)}
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No users match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setShowInvite(false)}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">
                  Invite User
                </h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close"
                  onClick={() => setShowInvite(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <form onSubmit={handleInvite} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" placeholder="Jane Cooper" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane.cooper@infoset.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select id="role" name="role" defaultValue="Financial Analyst">
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select id="department" name="department">
                      {masterDepartments.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInvite(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Send Invite</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
