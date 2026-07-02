import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  FileText,
  BarChart3,
  Settings,
  Users,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/auth/AuthContext'

type NavItem = {
  href?: string
  label: string
  icon: typeof LayoutGrid
  adminOnly?: boolean
  subItems?: { href: string; label: string; icon: typeof LayoutGrid }[]
}

const primaryNav: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  {
    label: 'Expenses',
    icon: CreditCard,
    subItems: [
      { href: '/expenses/requests', label: 'Requests', icon: FileText },
    ],
  },
  { href: '/budgets', label: 'Budgets', icon: BarChart3 },
  { href: '/master-data', label: 'Master Data', icon: Settings, adminOnly: true },
]

const secondaryNav = [
  { href: '/users', label: 'User Management', icon: Users, adminOnly: true },
  { href: '/profile', label: 'Profile', icon: UserCircle },
]

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const { pathname } = useLocation()
  const { role } = useSession()
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    pathname.startsWith('/expenses') ? new Set(['Expenses']) : new Set(),
  )

  function toggleGroup(label: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  const iconCls = 'size-5 shrink-0'

  function renderLink(href: string, label: string, Icon: typeof LayoutGrid) {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
    return (
      <Link
        key={href}
        to={href}
        title={collapsed ? label : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
          collapsed && 'justify-center px-0',
        )}
      >
        <Icon className={iconCls} />
        {!collapsed && <span>{label}</span>}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'flex flex-col bg-[linear-gradient(160deg,var(--sidebar-gradient-from),var(--sidebar-gradient-to))] text-sidebar-foreground transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center border-b border-sidebar-border px-2 py-3">
        <div className={cn(
          'flex items-center justify-center rounded-lg bg-white shadow-sm',
          collapsed ? 'h-10 w-10 p-1' : 'w-full py-1.5',
        )}>
          <img
            src="/infoset-logo.png"
            alt="INFOSET"
            className={cn('w-3/5 h-auto', collapsed ? 'h-6' : '')}
          />
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {primaryNav
          .filter((item) => !item.adminOnly || role === 'Admin')
          .map((item) => {
            if (item.subItems) {
              const isExpanded = expanded.has(item.label)
              const groupActive = item.subItems.some(
                (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/'),
              )

              if (collapsed) {
                return (
                  <Link key={item.label} to="/expenses" title={item.label}>
                    <div
                      className={cn(
                        'flex cursor-pointer items-center justify-center rounded-md py-2.5 text-sm font-medium',
                        groupActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
                      )}
                    >
                      <item.icon className={iconCls} />
                    </div>
                  </Link>
                )
              }

              return (
                <div key={item.label}>
                  <div
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      groupActive
                        ? 'text-sidebar-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
                    )}
                  >
                    <Link
                      to="/expenses"
                      className="flex flex-1 items-center gap-3"
                    >
                      <item.icon className={iconCls} />
                      <span className="flex-1 text-left">{item.label}</span>
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); toggleGroup(item.label); }}
                      className="ml-auto rounded p-1 hover:bg-sidebar-foreground/10"
                    >
                      <ChevronDown
                        className={cn(
                          'size-4 transition-transform',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-sidebar-border pl-3">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className={cn(
                            'rounded-md px-3 py-2 text-sm transition-colors',
                            (pathname === sub.href || pathname.startsWith(sub.href + '/'))
                              ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/60 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return renderLink(item.href!, item.label, item.icon)
          })}
      </nav>

      {/* Secondary nav */}
      <nav className="flex flex-col gap-1 border-t border-sidebar-border p-3">
        {secondaryNav
          .filter((item) => !item.adminOnly || role === 'Admin')
          .map((item) => renderLink(item.href!, item.label, item.icon))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center gap-3 border-t border-sidebar-border px-4 py-3 text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <>
            <PanelLeftClose className="size-5" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  )
}
