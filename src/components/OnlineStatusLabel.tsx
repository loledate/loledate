import { usePresence } from '../context/PresenceContext'
import { useLanguage } from '../context/LanguageContext'

interface OnlineStatusLabelProps {
  userId: string
  className?: string
}

export default function OnlineStatusLabel({
  userId,
  className = '',
}: OnlineStatusLabelProps) {
  const { isOnline } = usePresence()
  const { t } = useLanguage()
  const online = isOnline(userId)

  return (
    <span
      className={`text-xs ${online ? 'font-medium text-emerald-500' : 'text-muted'} ${className}`}
    >
      {online ? t('presence.online') : t('presence.offline')}
    </span>
  )
}
