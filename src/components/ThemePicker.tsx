import { useLanguage } from '../context/LanguageContext'
import { useTheme, type Theme } from '../context/ThemeContext'

export default function ThemePicker() {
  const { hasChosenTheme, setTheme } = useTheme()
  const { t } = useLanguage()

  if (hasChosenTheme) return null

  const choose = (theme: Theme) => {
    setTheme(theme)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-slide-up rounded-2xl border border-rose-200 bg-white p-8 shadow-card dark:border-white/10 dark:bg-zinc-950">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-400 dark:text-rose-300">
          {t('theme.welcome')}
        </p>
        <h2 className="mb-3 text-2xl font-semibold text-rose-900 dark:text-white">
          {t('theme.pickTitle')}
        </h2>
        <p className="mb-8 text-sm text-rose-600 dark:text-white/50">
          {t('theme.pickBody')}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => choose('light')}
            className="group overflow-hidden rounded-xl border-2 border-rose-200 bg-rose-50 p-4 text-left transition-all hover:border-rose-400 hover:shadow-glow"
          >
            <div className="mb-3 h-20 overflow-hidden rounded-lg border border-rose-200">
              <img
                src="/fotoportada.png"
                alt=""
                className="h-full w-full object-cover object-left"
              />
            </div>
            <span className="block font-semibold text-rose-900">{t('theme.light')}</span>
            <span className="text-xs text-rose-500">{t('theme.lightDesc')}</span>
          </button>

          <button
            type="button"
            onClick={() => choose('dark')}
            className="group overflow-hidden rounded-xl border-2 border-zinc-700 bg-zinc-900 p-4 text-left transition-all hover:border-rose-500/50 hover:shadow-glow"
          >
            <div className="mb-3 h-20 overflow-hidden rounded-lg border border-zinc-700">
              <img
                src="/fotoportada-dark.png"
                alt=""
                className="h-full w-full object-cover object-left"
              />
            </div>
            <span className="block font-semibold text-white">{t('theme.dark')}</span>
            <span className="text-xs text-white/50">{t('theme.darkDesc')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
