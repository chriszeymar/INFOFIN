import { Suspense } from 'react'
import { RequestForm } from '@/components/requests/request-form'

export default function NewRequestPage() {
  return (
    <Suspense fallback={null}>
      <RequestForm />
    </Suspense>
  )
}
