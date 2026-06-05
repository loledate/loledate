import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
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

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { user } = useAuth()
  const { t, locale } = useLanguage()
  const { matches, matchesLoading, refreshMatchesSilent, clearMatchUnread } =
    useApp()
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
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const timeLocale = locale === 'en' ? 'en-US' : 'es-ES'

  function formatMessageTime(iso: string) {
    return new Date(iso).toLocaleTimeString(timeLocale, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function translateError(err: unknown, fallbackKey: string) {
    const message = err instanceof Error ? err.message : fallbackKey
    return t(message)
  }

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

    clearMatchUnread(matchId)

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
          setLoadError(translateError(err, 'messages.loadFailed'))
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
      void markMessagesAsRead(matchId, user.id).then(() => refreshMatchesSilent())
    }
  }, [matchId, user, refreshMatchesSilent, clearMatchUnread])

  useEffect(() => {
    if (!matchId || !user) return

    return subscribeToMessages(matchId, user.id, (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
      if (!message.isOwn) {
        clearMatchUnread(matchId)
        markMessagesAsRead(matchId, user.id)
          .then(() => refreshMatchesSilent())
          .catch(() => {})
      }
    })
  }, [matchId, user, refreshMatchesSilent, clearMatchUnread])

  useEffect(() => {
    if (matchLoading || !match) return
    inputRef.current?.focus()
  }, [matchLoading, match, matchId])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
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
      setError(translateError(err, 'messages.sendFailed'))
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }, [input, match, user, matchId, sending, refreshMatchesSilent, t])

  if (matchLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-muted">{t('messages.loadingChat')}</p>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <p className="text-sm text-muted">{t('messages.matchNotFound')}</p>
        <Link to="/matches" className="btn-primary mt-4">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-theme px-4 py-3">
        <Link to="/matches" className="text-sm text-muted hover:text-heading">
          {t('common.back')}
        </Link>
        <Link
          to={`/user/${match.profile.userId}`}
          state={{ from: `/chat/${matchId}` }}
          className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-rose-100 dark:bg-zinc-900">
            <Avatar
              url={match.profile.photoUrl}
              name={match.profile.name}
              className="h-full w-full"
              fit="contain"
            />
          </div>
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
            <div className="hidden sm:block">
              <ProfileSocials profile={match.profile} compact />
            </div>
          </div>
        </Link>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-4 py-4"
      >
        {messagesLoading ? (
          <p className="py-8 text-center text-sm text-muted">
            {t('messages.loadingMessages')}
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
                    setLoadError(translateError(err, 'messages.loadFailed'))
                  )
                  .finally(() => setMessagesLoading(false))
              }}
              className="btn-primary mt-4"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            {t('messages.emptyChat')}
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] break-words px-4 py-2.5 sm:max-w-[75%] ${
                  msg.isOwn
                    ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-glow dark:bg-white dark:from-white dark:to-white dark:text-black dark:shadow-none'
                    : 'rounded-2xl rounded-bl-md border border-theme bg-white text-heading dark:bg-black dark:text-white'
                }`}
              >
                <p className="break-words text-sm leading-relaxed">{msg.text}</p>
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

      <div className="shrink-0 border-t border-theme p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {error && (
          <p className="mb-2 text-center text-xs text-body">{error}</p>
        )}
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            autoFocus
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSend()
            }}
            placeholder={t('messages.placeholder')}
            className="input-field flex-1"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || sending}
            className="btn-primary px-4 py-3 disabled:opacity-30"
          >
            {sending ? '...' : t('messages.send')}
          </button>
        </div>
      </div>
    </div>
  )
}
