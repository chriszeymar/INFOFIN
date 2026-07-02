import { Badge } from '@/components/ui/badge'
import { STATUS_META, type RequestStatus } from '@/lib/mock-data'

export function StatusBadge({ status }: { status: RequestStatus }) {
  const meta = STATUS_META[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}
