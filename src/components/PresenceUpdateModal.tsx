import { useEffect, useState } from 'react'
import { Radio } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

const PRESENCE_KEY = 'lol-edate-presence-update-v1'
const FAVORITE_SONG_KEY = 'lol-edate-favorite-song-update-v1'

export default function PresenceUpdateModal() {
  const { user } = useAuth()
  const { hasChosenTheme } = useTheme()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user || !hasChosenTheme) return
    if (localStorage.getItem(PRESENCE_KEY)) return
    setOpen(true)
  }, [user, hasChosenTheme])

  if (!open) return null

  const dismiss = () => {
    localStorage.setItem(PRESENCE_KEY, '1')
    setOpen(false)
  }

  const favoriteStillShowing = !localStorage.getItem(FAVORITE_SONG_KEY)

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/70 p-4 pb-safe backdrop-blur-sm ${
        favoriteStillShowing ? 'z-[98]' : 'z-[99]'
      }`}
    >
      <div className="w-full max-w-md animate-slide-up rounded-2xl border border-sky-500/30 bg-gradient-to-b from-zinc-900 to-black p-6 shadow-2xl sm:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
          {t('updates.badge')}
        </p>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
            <Radio className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            {t('updates.presenceTitle')}
          </h2>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-zinc-300">
          {t('updates.presenceBody')}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="btn-primary w-full bg-sky-500 text-black hover:brightness-105"
        >
          {t('updates.presenceCta')}
        </button>
      </div>
    </div>
  )
}
