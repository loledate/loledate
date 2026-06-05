import { usePresence } from '../context/PresenceContext'
import { useLanguage } from '../context/LanguageContext'
import { formatRelativeTime, pickLatestIso } from '../lib/lastSeen'

interface OnlineStatusLabelProps {
  userId: string
  lastSeenAt?: string | null
  className?: string
}

export default function OnlineStatusLabel({
  userId,
  lastSeenAt = null,
  className = '',
}: OnlineStatusLabelProps) {
  const { isOnline, getLastSeen } = usePresence()
  const { t, locale } = useLanguage()
  const online = isOnline(userId)

  if (online) {
    return (
      <span
        className={`text-xs font-medium text-emerald-500 ${className}`}
      >
        {t('presence.online')}
      </span>
    )
  }

  const seenAt = pickLatestIso(getLastSeen(userId), lastSeenAt)

  if (seenAt) {
    const time = formatRelativeTime(seenAt, locale)
    return (
      <span className={`text-xs text-muted ${className}`}>
        {t('presence.lastSeen', { time })}
      </span>
    )
  }

  return (
    <span className={`text-xs text-muted ${className}`}>
      {t('presence.offline')}
    </span>
  )
}
