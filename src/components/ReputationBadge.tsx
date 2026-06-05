import type { ReputationTier } from '../lib/reputation'

interface ReputationBadgeProps {
  count: number
  tier: ReputationTier
  compact?: boolean
}

export default function ReputationBadge({
  count,
  tier,
  compact = false,
}: ReputationBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-theme ${
        compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
      }`}
    >
      <span className="font-medium text-heading">{count}</span>
      <span className="text-muted">·</span>
      <span className={compact ? 'text-muted' : 'text-body'}>{tier}</span>
    </div>
  )
}
