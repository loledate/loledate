import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchProfile } from '../lib/profiles'
import { fetchProfileReputation, type ProfileReputation } from '../lib/reputation'
import type { Profile } from '../types'
import ProfileCard from '../components/ProfileCard'
import ProfileLikeButton from '../components/ProfileLikeButton'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuth()
  const location = useLocation()
  const backTo =
    (location.state as { from?: string } | null)?.from ?? '/matches'
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const applyReputation = useCallback((reputation: ProfileReputation) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            reputationCount: reputation.count,
            reputationTier: reputation.tier,
            reputationLikedByMe: reputation.likedByMe,
          }
        : prev
    )
  }, [])

  useEffect(() => {
    if (!userId || !user) {
      if (!userId) {
        setNotFound(true)
        setLoading(false)
      }
      return
    }

    let cancelled = false
    setLoading(true)
    setNotFound(false)

    Promise.all([fetchProfile(userId), fetchProfileReputation(userId, user.id)])
      .then(([loaded, reputation]) => {
        if (cancelled) return
        if (!loaded) {
          setNotFound(true)
          setProfile(null)
          return
        }
        setProfile({
          ...loaded,
          reputationCount: reputation.count,
          reputationTier: reputation.tier,
          reputationLikedByMe: reputation.likedByMe,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true)
          setProfile(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, user])

  if (userId && user?.id === userId) {
    return <Navigate to="/profile" replace />
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-muted">Cargando perfil...</p>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <p className="text-sm text-muted">Perfil no encontrado</p>
        <Link to={backTo} className="btn-primary mt-4">
          Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <Link to={backTo} className="text-sm text-muted hover:text-heading">
          Volver
        </Link>
        <h1 className="mt-2 text-sm font-medium uppercase tracking-widest text-muted">
          Perfil
        </h1>
      </div>

      <ProfileCard profile={profile} />

      <div className="mt-6">
        <ProfileLikeButton
          targetUserId={profile.userId}
          onReputationChange={applyReputation}
        />
      </div>
    </div>
  )
}
