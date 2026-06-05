import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { fetchProfile } from '../lib/profiles'
import { fetchProfileReputation, type ProfileReputation } from '../lib/reputation'
import type { Profile } from '../types'
import ProfileCard from '../components/ProfileCard'
import ProfileLikeButton from '../components/ProfileLikeButton'
import ProfileSongPlayer from '../components/ProfileSongPlayer'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuth()
  const { t } = useLanguage()
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
        <p className="text-sm text-muted">{t('profile.loading')}</p>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <p className="text-sm text-muted">{t('profile.notFound')}</p>
        <Link to={backTo} className="btn-primary mt-4">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  return (
    <div
      className={`mx-auto max-w-2xl px-4 py-6 sm:py-8 ${profile.songUrl ? 'pb-44 sm:pb-48' : ''}`}
    >
      <div className="mb-6">
        <Link to={backTo} className="text-sm text-muted hover:text-heading">
          {t('common.back')}
        </Link>
        <h1 className="mt-2 text-sm font-medium uppercase tracking-widest text-muted">
          {t('profile.title')}
        </h1>
      </div>

      <ProfileCard profile={profile} showOnline />

      <div className="mt-6">
        <ProfileLikeButton
          targetUserId={profile.userId}
          onReputationChange={applyReputation}
        />
      </div>

      <ProfileSongPlayer
        songUrl={profile.songUrl}
        profileName={profile.name}
        photoUrl={profile.photoUrl}
        sticky
      />
    </div>
  )
}
