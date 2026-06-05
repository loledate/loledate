import { useCallback, useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchProfileReputation,
  toggleProfileLike,
  type ProfileReputation,
} from '../lib/reputation'
import ReputationBadge from './ReputationBadge'

interface ProfileLikeButtonProps {
  targetUserId: string
  onReputationChange?: (reputation: ProfileReputation) => void
}

export default function ProfileLikeButton({
  targetUserId,
  onReputationChange,
}: ProfileLikeButtonProps) {
  const { user } = useAuth()
  const [reputation, setReputation] = useState<ProfileReputation | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    let cancelled = false
    setLoading(true)
    setError('')

    fetchProfileReputation(targetUserId, user.id)
      .then((rep) => {
        if (!cancelled) {
          setReputation(rep)
          onReputationChange?.(rep)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'No se pudo cargar la reputación.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [targetUserId, user, onReputationChange])

  const handleToggle = useCallback(async () => {
    if (!user || !reputation || toggling) return

    setToggling(true)
    setError('')

    try {
      const next = await toggleProfileLike(
        targetUserId,
        user.id,
        reputation.likedByMe
      )
      setReputation(next)
      onReputationChange?.(next)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar el like.'
      )
    } finally {
      setToggling(false)
    }
  }, [user, reputation, toggling, targetUserId, onReputationChange])

  if (!user || user.id === targetUserId) return null

  if (loading) {
    return (
      <p className="text-center text-sm text-muted">Cargando reputación...</p>
    )
  }

  if (!reputation) {
    return error ? <p className="text-center text-sm text-body">{error}</p> : null
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <ReputationBadge count={reputation.count} tier={reputation.tier} />
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={toggling}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors disabled:opacity-40 ${
          reputation.likedByMe
            ? 'border-rose-400 bg-rose-50 text-rose-700 dark:border-white dark:bg-white dark:text-black'
            : 'border-theme text-heading hover:border-white/30'
        }`}
      >
        <Heart
          className={`h-4 w-4 ${reputation.likedByMe ? 'fill-current' : ''}`}
        />
        {toggling
          ? '...'
          : reputation.likedByMe
            ? 'Quitar like'
            : 'Dar like al perfil'}
      </button>
      {error && <p className="text-xs text-body">{error}</p>}
    </div>
  )
}
