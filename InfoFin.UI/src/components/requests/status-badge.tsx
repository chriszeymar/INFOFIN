import { Badge } from '@/components/ui/badge'
import { STATUS_META, type SpendRequestStatus } from '@/types/spend-request'

export function StatusBadge({ status }: { status: SpendRequestStatus }) {
  const meta = STATUS_META[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}
