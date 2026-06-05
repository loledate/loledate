import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import type { Match } from '../types'
import { fetchMatchById } from '../lib/profiles'
import {
  fetchMessages,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
} from '../lib/messages'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import ProfileSocials from '../components/ProfileSocials'

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { user } = useAuth()
  const { matches, matchesLoading, refreshMatchesSilent } = useApp()
  const [match, setMatch] = useState<Match | null>(null)
  const [matchLoading, setMatchLoading] = useState(true)
  const [messages, setMessages] = useState<
    Awaited<ReturnType<typeof fetchMessages>>
  >([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!matchId || !user) {
      setMatch(null)
      setMatchLoading(!matchId)
      return
    }

    const fromList = matches.find((m) => m.id === matchId)
    if (fromList) {
      setMatch(fromList)
      setMatchLoading(false)
      return
    }

    if (matchesLoading) return

    let cancelled = false
    setMatchLoading(true)

    fetchMatchById(matchId, user.id)
      .then((loaded) => {
        if (!cancelled) setMatch(loaded)
      })
      .catch(() => {
        if (!cancelled) setMatch(null)
      })
      .finally(() => {
        if (!cancelled) setMatchLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [matchId, user, matches, matchesLoading])

  useEffect(() => {
    if (!matchId || !user) return

    const fromList = matches.find((m) => m.id === matchId)
    if (fromList) setMatch(fromList)
  }, [matchId, matches])

  useEffect(() => {
    if (!matchId || !user) return

    let cancelled = false
    setMessagesLoading(true)
    setLoadError('')

    fetchMessages(matchId, user.id)
      .then((rows) => {
        if (!cancelled) setMessages(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setMessages([])
          setLoadError(
            err instanceof Error
              ? err.message
              : 'No se pudieron cargar los mensajes.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false)
      })

    markMessagesAsRead(matchId, user.id)
      .then(() => refreshMatchesSilent())
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [matchId, user, refreshMatchesSilent])

  useEffect(() => {
    if (!matchId || !user) return

    return subscribeToMessages(matchId, user.id, (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
      if (!message.isOwn) {
        markMessagesAsRead(matchId, user.id)
          .then(() => refreshMatchesSilent())
          .catch(() => {})
      }
    })
  }, [matchId, user, refreshMatchesSilent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || !match || !user || !matchId || sending) return

    setSending(true)
    setError('')

    try {
      const message = await sendMessage(matchId, user.id, input.trim())
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
      setInput('')
      await refreshMatchesSilent()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo enviar el mensaje.'
      )
    } finally {
      setSending(false)
    }
  }, [input, match, user, matchId, sending, refreshMatchesSilent])

  if (matchLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-muted">Cargando chat...</p>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <p className="text-sm text-muted">Match no encontrado</p>
        <Link to="/matches" className="btn-primary mt-4">
          Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-2xl flex-col">
      <div className="flex items-center gap-3 border-b border-theme px-4 py-3">
        <Link to="/matches" className="text-sm text-muted hover:text-heading">
          Volver
        </Link>
        <Avatar
          url={match.profile.photoUrl}
          name={match.profile.name}
          className="h-8 w-8 rounded"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium text-heading">
            {match.profile.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted">
            {match.profile.city}
            {match.profile.elo && (
              <Badge className="!px-1.5 !py-0 text-[10px]">
                {match.profile.elo}
              </Badge>
            )}
          </div>
          <ProfileSocials profile={match.profile} compact />
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messagesLoading ? (
          <p className="py-8 text-center text-sm text-muted">
            Cargando mensajes...
          </p>
        ) : loadError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-body">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                if (!matchId || !user) return
                setMessagesLoading(true)
                setLoadError('')
                fetchMessages(matchId, user.id)
                  .then(setMessages)
                  .catch((err) =>
                    setLoadError(
                      err instanceof Error
                        ? err.message
                        : 'No se pudieron cargar los mensajes.'
                    )
                  )
                  .finally(() => setMessagesLoading(false))
              }}
              className="btn-primary mt-4"
            >
              Reintentar
            </button>
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Sin mensajes. Escribe el primero.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 ${
                  msg.isOwn
                    ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-glow dark:bg-white dark:from-white dark:to-white dark:text-black dark:shadow-none'
                    : 'rounded-2xl rounded-bl-md border border-theme bg-white text-heading dark:bg-black dark:text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    msg.isOwn ? 'text-white/70 dark:text-black/50' : 'text-muted'
                  }`}
                >
                  {formatMessageTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-theme p-4">
        {error && (
          <p className="mb-2 text-center text-xs text-body">{error}</p>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSend()
            }}
            placeholder="Escribe un mensaje..."
            className="input-field flex-1"
            disabled={sending}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || sending}
            className="btn-primary px-4 py-3 disabled:opacity-30"
          >
            {sending ? '...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}
