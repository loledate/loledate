import { Link, useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

interface MessagesNavLinkProps {
  className?: string
  onClick?: () => void
  showLabel?: boolean
}

export default function MessagesNavLink({
  className = '',
  onClick,
  showLabel = false,
}: MessagesNavLinkProps) {
  const location = useLocation()
  const { unreadMessageCount } = useApp()
  const { t } = useLanguage()
  const active =
    location.pathname === '/matches' || location.pathname.startsWith('/chat/')

  const badge =
    unreadMessageCount > 0
      ? unreadMessageCount > 99
        ? '99+'
        : String(unreadMessageCount)
      : null

  return (
    <Link
      to="/matches"
      onClick={onClick}
      aria-label={
        unreadMessageCount > 0
          ? t('nav.messagesUnread', { n: unreadMessageCount })
          : t('nav.messages')
      }
      className={`relative inline-flex items-center gap-1.5 ${className}`}
    >
      <span className="relative inline-flex">
        <MessageCircle className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
        {badge && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white dark:bg-white dark:text-black">
            {badge}
          </span>
        )}
      </span>
      {showLabel && <span>{t('nav.messages')}</span>}
    </Link>
  )
}
