import { Button } from '@/components/ui/button'
import { useSession } from '@/auth/AuthContext'

export default function ProfilePage() {
  const { name, email, role } = useSession()
  const [firstName, ...rest] = name.split(' ')
  const lastName = rest.join(' ')
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const fields = [
    { label: 'First Name', value: firstName || '—' },
    { label: 'Last Name', value: lastName || '—' },
    { label: 'Is Superadmin', value: role === 'Admin' ? 'Yes' : 'No' },
    { label: 'Roles', value: role },
    { label: 'Email', value: email },
  ]

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="relative h-40 w-full overflow-hidden rounded-xl sm:h-48">
        <img src="/profile-banner.png" alt="" className="h-full w-full object-cover" />
      </div>

      <div className="-mt-14 flex flex-col items-center gap-3">
        <div className="flex size-28 items-center justify-center rounded-full border-4 border-background bg-primary text-3xl font-semibold text-primary-foreground shadow-md">
          {initials || 'U'}
        </div>
        <Button variant="outline" disabled>Upload Photo</Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{name || 'User'}</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {fields.map((field, i) => (
          <div
            key={field.label}
            className={`flex items-center justify-between gap-4 px-5 py-4 ${
              i !== fields.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {field.label}
            </span>
            <span className="text-sm font-medium text-foreground">{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
