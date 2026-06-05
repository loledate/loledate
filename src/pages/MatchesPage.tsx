import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'

function formatTime(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return 'Ahora'
  if (diffHours < 24) return `Hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Ayer'
  return `Hace ${diffDays}d`
}

export default function MatchesPage() {
  const { matches } = useApp()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-sm font-medium uppercase tracking-widest text-rose-400">
        Matches
      </h1>
      <p className="mb-8 text-sm text-rose-400">Conversaciones activas.</p>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center rounded border border-rose-200 py-20 text-center">
          <h2 className="mb-2 text-sm font-medium text-rose-900">Sin matches</h2>
          <p className="max-w-xs text-sm text-rose-400">
            Cuando haya usuarios y hagas match, aparecerán aquí.
          </p>
          <Link to="/discover" className="btn-primary mt-6">
            Descubrir
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-rose-100 border border-rose-200">
          {matches.map((match) => (
            <Link
              key={match.id}
              to={`/chat/${match.id}`}
              className="group flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.02]"
            >
              <div className="relative flex-shrink-0">
                <Avatar
                  url={match.profile.photoUrl}
                  name={match.profile.name}
                  className="h-12 w-12 rounded"
                />
                {match.unread && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-white" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-rose-900">
                    {match.profile.name}
                  </h3>
                  <span className="text-xs text-rose-900/30">
                    {formatTime(match.lastMessageAt)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-rose-400">
                  {match.profile.city}
                  {match.profile.elo && (
                    <Badge className="!px-1.5 !py-0 text-[10px]">
                      {match.profile.elo}
                    </Badge>
                  )}
                </div>
                <p
                  className={`mt-1 truncate text-sm ${
                    match.unread ? 'text-rose-800' : 'text-rose-400'
                  }`}
                >
                  {match.lastMessage}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
