import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { isNewMatchPlaceholder } from '../lib/chatConstants'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'

export default function MatchesPage() {
  const { matches, matchesLoading, refreshMatchesSilent, clearMatchUnread } =
    useApp()
  const { t } = useLanguage()

  useEffect(() => {
    void refreshMatchesSilent()
  }, [refreshMatchesSilent])

  function formatTime(iso: string) {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return t('messages.now')
    if (diffHours < 24) return t('messages.hoursAgo', { n: diffHours })
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return t('messages.yesterday')
    return t('messages.daysAgo', { n: diffDays })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 sm:py-8">
      <h1 className="mb-2 text-sm font-medium uppercase tracking-widest text-muted">
        {t('messages.title')}
      </h1>
      <p className="mb-8 text-sm text-muted">{t('messages.subtitle')}</p>

      {matchesLoading ? (
        <div className="flex flex-col items-center rounded border border-theme py-20 text-center">
          <p className="text-sm text-muted">{t('messages.loading')}</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center rounded border border-theme py-20 text-center">
          <h2 className="mb-2 text-sm font-medium text-heading">
            {t('messages.emptyTitle')}
          </h2>
          <p className="max-w-xs text-sm text-muted">{t('messages.emptyBody')}</p>
          <Link to="/discover" className="btn-primary mt-6">
            {t('nav.discover')}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-rose-100 border border-theme">
          {matches.map((match) => (
            <Link
              key={match.id}
              to={`/chat/${match.id}`}
              onClick={() => clearMatchUnread(match.id)}
              className="group flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.02]"
            >
              <div className="relative shrink-0 overflow-hidden rounded bg-rose-100 dark:bg-zinc-900">
                <Avatar
                  url={match.profile.photoUrl}
                  name={match.profile.name}
                  className="h-12 w-12"
                  fit="contain"
                />
                {match.unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white dark:bg-white dark:text-black">
                    {match.unreadCount > 99 ? '99+' : match.unreadCount}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-heading">
                    {match.profile.name}
                  </h3>
                  <span className="text-xs text-heading/30">
                    {formatTime(match.lastMessageAt)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  {match.profile.city}
                  {match.profile.elo && (
                    <Badge className="!px-1.5 !py-0 text-[10px]">
                      {match.profile.elo}
                    </Badge>
                  )}
                </div>
                <p
                  className={`mt-1 truncate text-sm ${
                    match.unread ? 'font-medium text-heading' : 'text-muted'
                  }`}
                >
                  {isNewMatchPlaceholder(match.lastMessage)
                    ? t('messages.newMatch')
                    : match.lastMessage}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
