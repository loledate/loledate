import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase'
import { touchLastSeen } from '../lib/lastSeen'

interface PresenceContextType {
  isOnline: (userId: string) => boolean
  getLastSeen: (userId: string) => string | null
}

const PresenceContext = createContext<PresenceContextType | null>(null)

function collectOnlineIds(
  state: Record<string, { user_id?: string }[]>
): Set<string> {
  const ids = new Set<string>()
  for (const key of Object.keys(state)) {
    ids.add(key)
    for (const entry of state[key] ?? []) {
      if (entry.user_id) ids.add(entry.user_id)
    }
  }
  return ids
}

function markLeftUsers(
  previous: Set<string>,
  next: Set<string>,
  at: string
): Record<string, string> {
  const updates: Record<string, string> = {}
  for (const id of previous) {
    if (!next.has(id)) updates[id] = at
  }
  return updates
}

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setOnlineIds(new Set())
      return
    }

    const client = requireSupabase()
    const channel = client.channel('global-online', {
      config: { presence: { key: user.id } },
    })

    let previousOnline = new Set<string>()

    const sync = () => {
      const nextOnline = collectOnlineIds(channel.presenceState())
      const leftAt = new Date().toISOString()
      const leftUpdates = markLeftUsers(previousOnline, nextOnline, leftAt)

      if (Object.keys(leftUpdates).length > 0) {
        setLastSeenMap((current) => ({ ...current, ...leftUpdates }))
      }

      previousOnline = nextOnline
      setOnlineIds(nextOnline)
    }

    channel.on('presence', { event: 'sync' }, sync)
    channel.on('presence', { event: 'join' }, sync)
    channel.on('presence', { event: 'leave' }, sync)

    const ping = () => {
      void touchLastSeen(user.id)
    }

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        })
        ping()
        sync()
      }
    })

    const heartbeat = window.setInterval(() => {
      void channel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
      })
      ping()
    }, 30_000)

    const handlePageHide = () => {
      ping()
    }

    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      window.clearInterval(heartbeat)
      ping()
      void channel.untrack()
      client.removeChannel(channel)
      setOnlineIds(new Set())
    }
  }, [user?.id])

  const isOnline = useCallback(
    (userId: string) => onlineIds.has(userId),
    [onlineIds]
  )

  const getLastSeen = useCallback(
    (userId: string) => lastSeenMap[userId] ?? null,
    [lastSeenMap]
  )

  return (
    <PresenceContext.Provider value={{ isOnline, getLastSeen }}>
      {children}
    </PresenceContext.Provider>
  )
}

export function usePresence() {
  const ctx = useContext(PresenceContext)
  if (!ctx) {
    return {
      isOnline: () => false,
      getLastSeen: () => null,
    }
  }
  return ctx
}
