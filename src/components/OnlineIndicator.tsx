import { usePresence } from '../context/PresenceContext'

interface OnlineIndicatorProps {
  userId: string
  className?: string
  size?: 'sm' | 'md'
}

export default function OnlineIndicator({
  userId,
  className = '',
  size = 'md',
}: OnlineIndicatorProps) {
  const { isOnline } = usePresence()

  if (!isOnline(userId)) return null

  const sizeClass = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'

  return (
    <span
      className={`absolute bottom-0 right-0 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950 ${sizeClass} ${className}`}
      aria-hidden
    />
  )
}
