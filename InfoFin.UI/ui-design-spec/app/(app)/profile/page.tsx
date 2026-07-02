'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useSession } from '@/components/session-provider'

export default function ProfilePage() {
  const { name, email, role } = useSession()
  const [firstName, ...rest] = name.split(' ')
  const lastName = rest.join(' ')
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')

  const fields = [
    { label: 'First Name', value: firstName },
    { label: 'Last Name', value: lastName },
    { label: 'Is Superadmin', value: role === 'Admin' ? 'Yes' : 'No' },
    { label: 'Roles', value: role },
    { label: 'Email', value: email },
  ]

  return (
    <div className="mx-auto max-w-2xl pb-10">
      {/* Banner */}
      <div className="relative h-40 w-full overflow-hidden rounded-xl sm:h-48">
        <Image
          src="/profile-banner.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Avatar + identity */}
      <div className="-mt-14 flex flex-col items-center gap-3">
        <div className="flex size-28 items-center justify-center rounded-full border-4 border-background bg-primary text-3xl font-semibold text-primary-foreground shadow-md">
          {initials}
        </div>
        <Button variant="outline">Upload Photo</Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      {/* Field list */}
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
            <span className="text-sm font-medium text-foreground">
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
