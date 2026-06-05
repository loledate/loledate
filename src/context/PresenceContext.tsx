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

interface PresenceContextType {
  isOnline: (userId: string) => boolean
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

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setOnlineIds(new Set())
      return
    }

    const client = requireSupabase()
    const channel = client.channel('global-online', {
      config: { presence: { key: user.id } },
    })

    const sync = () => {
      setOnlineIds(collectOnlineIds(channel.presenceState()))
    }

    channel.on('presence', { event: 'sync' }, sync)
    channel.on('presence', { event: 'join' }, sync)
    channel.on('presence', { event: 'leave' }, sync)

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        })
        sync()
      }
    })

    const heartbeat = window.setInterval(() => {
      void channel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
      })
    }, 30_000)

    return () => {
      window.clearInterval(heartbeat)
      void channel.untrack()
      client.removeChannel(channel)
      setOnlineIds(new Set())
    }
  }, [user?.id])

  const isOnline = useCallback(
    (userId: string) => onlineIds.has(userId),
    [onlineIds]
  )

  return (
    <PresenceContext.Provider value={{ isOnline }}>
      {children}
    </PresenceContext.Provider>
  )
}

export function usePresence() {
  const ctx = useContext(PresenceContext)
  if (!ctx) {
    return { isOnline: () => false }
  }
  return ctx
}
