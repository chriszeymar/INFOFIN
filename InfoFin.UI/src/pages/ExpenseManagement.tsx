import { Link } from 'react-router-dom'
import {
  FileText,
  Receipt,
  BarChart3,
  ShoppingCart,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const features = [
  {
    title: 'Requests',
    description: 'Submit and track spend requests. Post → Review → Approve → Complete.',
    icon: FileText,
    href: '/expenses/requests',
    active: true,
  },
  {
    title: 'Reimbursements',
    description: 'Submit expense reimbursements with receipt uploads and approval flow.',
    icon: Receipt,
    href: '#',
    active: false,
  },
  {
    title: 'Reports',
    description: 'P&L statements, budget vs actual, department breakdowns.',
    icon: BarChart3,
    href: '#',
    active: false,
  },
  {
    title: 'Purchase Orders',
    description: 'Create and track purchase orders against approved budgets.',
    icon: ShoppingCart,
    href: '#',
    active: false,
  },
]

export default function ExpenseManagement() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Expense Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage all expense-related workflows from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon
          const isActive = feature.active

          const cardContent = (
            <Card
              className={cn(
                'group transition-all',
                isActive
                  ? 'cursor-pointer border-primary/20 hover:border-primary/50 hover:shadow-md'
                  : 'opacity-60',
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-lg',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  {!isActive && (
                    <Lock className="size-4 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription className="text-xs">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              {isActive && (
                <CardContent className="pt-0">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                    Open <ArrowRight className="size-3" />
                  </span>
                </CardContent>
              )}
              {!isActive && (
                <CardContent className="pt-0">
                  <span className="text-xs text-muted-foreground">
                    Coming Soon
                  </span>
                </CardContent>
              )}
            </Card>
          )

          return isActive ? (
            <Link key={feature.title} to={feature.href} className="block">
              {cardContent}
            </Link>
          ) : (
            <div key={feature.title}>{cardContent}</div>
          )
        })}
      </div>
    </div>
  )
}
