'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  UserPlus,
  Search,
  Users as UsersIcon,
  UserCheck,
  ShieldCheck,
  X,
  Loader2,
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
import { httpClient } from '@/api/httpClient'

// ─── Types matching backend User model (with nested includes) ──────────────

interface ApiRole {
  id: number
  name: string
}

interface ApiDepartment {
  id: number
  name: string
}

interface ApiUser {
  id: number
  email: string
  roleId: number
  departmentId: number | null
  isActive: boolean
  role?: ApiRole
  department?: ApiDepartment
}

// ─── Display model ──────────────────────────────────────────────────────────

interface DisplayUser {
  id: number
  name: string
  email: string
  roleId: number
  roleName: string
  departmentId: number | null
  departmentName: string
  isActive: boolean
}

function nameFromEmail(email: string) {
  const [local] = email.split('@')
  return local
    .split('.')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

// ─── Role name mapping (matches DB Role table) ──────────────────────────────

const ROLE_NAMES = ['Financial Analyst', 'FPA Reviewer', 'FPA Approver', 'Administrateur']

export default function UsersPage() {
  const [users, setUsers] = useState<DisplayUser[]>([])
  const [departments, setDepartments] = useState<ApiDepartment[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showInvite, setShowInvite] = useState(false)

  // Fetch users and departments from API on mount
  useEffect(() => {
    setLoading(true)
    Promise.all([
      httpClient.get<ApiUser[]>('/api/users', { params: { isActive: undefined } }),
      httpClient.get<ApiDepartment[]>('/api/departments', { params: { isActive: true } }),
    ])
      .then(([usersRes, deptsRes]) => {
        const apiUsers: ApiUser[] = Array.isArray(usersRes.data) ? usersRes.data : []
        setUsers(apiUsers.map(mapUser))
        setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : [])
      })
      .catch(() => {
        setUsers([])
        setDepartments([])
      })
      .finally(() => setLoading(false))
  }, [])

  function mapUser(u: ApiUser): DisplayUser {
    return {
      id: u.id,
      name: nameFromEmail(u.email),
      email: u.email,
      roleId: u.roleId,
      roleName: u.role?.name ?? ROLE_NAMES[u.roleId - 1] ?? `Role #${u.roleId}`,
      departmentId: u.departmentId,
      departmentName: u.department?.name ?? '—',
      isActive: u.isActive,
    }
  }

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchesQuery =
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
        const matchesRole = roleFilter === 'all' || u.roleName === roleFilter
        return matchesQuery && matchesRole
      }),
    [users, query, roleFilter],
  )

  const stats = [
    { label: 'Total Users', value: users.length, icon: UsersIcon, tint: 'bg-primary/10 text-primary' },
    { label: 'Active', value: users.filter((u) => u.isActive).length, icon: UserCheck, tint: 'bg-success/12 text-success' },
    { label: 'Administrators', value: users.filter((u) => u.roleName === 'Administrateur').length, icon: ShieldCheck, tint: 'bg-accent text-accent-foreground' },
  ]

  async function toggleActive(userId: number, currentActive: boolean) {
    try {
      await httpClient.put(`/api/users/${userId}`, {
        id: userId,
        isActive: !currentActive,
      })
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentActive } : u)),
      )
    } catch (err) {
      console.error('Failed to toggle user active status:', err)
    }
  }

  async function changeRole(userId: number, newRoleName: string) {
    const newRoleId = ROLE_NAMES.indexOf(newRoleName) + 1
    if (newRoleId < 1) return
    try {
      await httpClient.put(`/api/users/${userId}`, {
        id: userId,
        roleId: newRoleId,
      })
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, roleId: newRoleId, roleName: newRoleName } : u,
        ),
      )
    } catch (err) {
      console.error('Failed to change user role:', err)
    }
  }

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') || '')
    const roleName = String(form.get('role') || ROLE_NAMES[0])
    const deptId = form.get('department')
      ? Number(form.get('department'))
      : null
    if (!email) return

    try {
      const { data } = await httpClient.post<ApiUser>('/api/users', {
        email,
        roleId: ROLE_NAMES.indexOf(roleName) + 1,
        departmentId: deptId,
        isActive: true,
      })
      setUsers((prev) => [...prev, mapUser(data)])
      setShowInvite(false)
    } catch (err) {
      console.error('Failed to invite user:', err)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading users…</span>
        </div>
      ) : (
        <>
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
              {ROLE_NAMES.map((r) => (
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
                    <TableRow key={u.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {initials}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>{u.departmentName}</TableCell>
                      <TableCell>
                        <Select
                          value={u.roleName}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="h-8 w-40 text-xs"
                        >
                          {ROLE_NAMES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.isActive ? 'success' : 'neutral'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(u.id, u.isActive)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
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
        </>
      )}

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
                    <Select id="role" name="role" defaultValue={ROLE_NAMES[0]}>
                      {ROLE_NAMES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select id="department" name="department">
                      <option value="">None</option>
                      {departments.map((d) => (
                        <option key={d.id} value={String(d.id)}>
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
