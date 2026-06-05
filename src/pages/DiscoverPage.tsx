import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import ProfileCard from '../components/ProfileCard'
import ActionButtons from '../components/ActionButtons'
import FiltersPanel from '../components/FiltersPanel'
import LikeAnimation from '../components/LikeAnimation'

export default function DiscoverPage() {
  const {
    discoverProfiles,
    currentIndex,
    passProfile,
    likeProfile,
    discoverLoading,
  } = useApp()
  const { t } = useLanguage()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [likeAnim, setLikeAnim] = useState<{
    show: boolean
    type: 'like' | 'super_like' | 'match'
  }>({ show: false, type: 'like' })

  const currentProfile = discoverProfiles[currentIndex]
  const noMoreProfiles = !currentProfile

  const handleLike = async (type: 'like' | 'super_like') => {
    const isMatch = await likeProfile(type)
    setLikeAnim({ show: true, type: isMatch ? 'match' : type })
    setTimeout(() => setLikeAnim({ show: false, type: 'like' }), isMatch ? 1500 : 800)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 sm:py-8">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="text-sm font-medium uppercase tracking-widest text-muted">
          {t('discover.title')}
        </h1>
        <button
          onClick={() => setFiltersOpen(true)}
          className="inline-flex min-h-11 items-center px-3 py-2 text-sm text-body hover:text-heading"
        >
          {t('discover.filters')}
        </button>
      </div>

      {discoverLoading ? (
        <div className="flex flex-col items-center rounded border border-theme py-20 text-center">
          <p className="text-sm text-muted">{t('discover.loading')}</p>
        </div>
      ) : noMoreProfiles ? (
        <div className="flex flex-col items-center rounded border border-theme py-20 text-center">
          <h2 className="mb-2 text-sm font-medium text-heading">
            {t('discover.emptyTitle')}
          </h2>
          <p className="mb-6 max-w-xs text-sm text-muted">
            {t('discover.emptyBodyBefore')}{' '}
            <Link to="/profile" className="underline underline-offset-2">
              {t('nav.profile')}
            </Link>
            {t('discover.emptyBodyAfter')}
          </p>
          <Link to="/profile" className="btn-primary">
            {t('discover.completeProfile')}
          </Link>
        </div>
      ) : (
        <div className="relative">
          <LikeAnimation type={likeAnim.type} show={likeAnim.show} />
          <ProfileCard profile={currentProfile} />
          <div className="mt-4 text-center">
            <Link
              to={`/user/${currentProfile.userId}`}
              state={{ from: '/discover' }}
              className="text-sm text-muted underline underline-offset-2 hover:text-heading"
            >
              {t('discover.viewProfile')}
            </Link>
          </div>

          <div className="mt-8">
            <ActionButtons
              onPass={passProfile}
              onLike={() => handleLike('like')}
              onSuperLike={() => handleLike('super_like')}
            />
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            {currentIndex + 1} / {discoverProfiles.length}
          </p>
        </div>
      )}

      <FiltersPanel isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </div>
  )
}
