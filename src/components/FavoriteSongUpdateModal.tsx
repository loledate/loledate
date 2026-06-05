import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Music2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

const SEEN_KEY = 'lol-edate-favorite-song-update-v1'

export default function FavoriteSongUpdateModal() {
  const { user } = useAuth()
  const { hasChosenTheme } = useTheme()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user || !hasChosenTheme) return
    if (localStorage.getItem(SEEN_KEY)) return
    setOpen(true)
  }, [user, hasChosenTheme])

  if (!open) return null

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, '1')
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/70 p-4 pb-safe backdrop-blur-sm">
      <div className="w-full max-w-md animate-slide-up rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900 to-black p-6 shadow-2xl sm:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
          {t('updates.badge')}
        </p>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Music2 className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            {t('updates.favoriteSongTitle')}
          </h2>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-zinc-300">
          {t('updates.favoriteSongBody')}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/profile"
            onClick={dismiss}
            className="btn-primary flex-1 bg-emerald-500 text-center text-black hover:brightness-105"
          >
            {t('updates.favoriteSongCta')}
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="btn-secondary flex-1 border-zinc-700 bg-zinc-900 text-zinc-300"
          >
            {t('updates.favoriteSongLater')}
          </button>
        </div>
      </div>
    </div>
  )
}
