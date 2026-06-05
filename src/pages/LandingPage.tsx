import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

export default function LandingPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { coverImage, theme, hasCustomBackground } = useTheme()

  const steps = [
    { title: t('landing.step1Title'), desc: t('landing.step1Desc') },
    { title: t('landing.step2Title'), desc: t('landing.step2Desc') },
    { title: t('landing.step3Title'), desc: t('landing.step3Desc') },
    { title: t('landing.step4Title'), desc: t('landing.step4Desc') },
  ]

  return (
    <div className="animate-fade-in">
      <section className="relative min-h-[88dvh] overflow-hidden">
        <img
          src={coverImage}
          alt="LoL E-DATE"
          className="absolute inset-0 h-full w-full bg-black object-contain object-center sm:object-cover sm:object-[center_30%]"
        />

        {theme === 'light' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/20 via-transparent to-pink-900/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-lol-cream via-rose-50/30 to-transparent" />
          </>
        )}
        {theme === 'dark' && (
          <div className="absolute inset-0 bg-black/50" />
        )}

        <div className="relative mx-auto flex min-h-[88dvh] max-w-6xl flex-col justify-end px-4 pb-10 pt-[max(6rem,calc(env(safe-area-inset-top)+4rem))] sm:pb-14">
          <div className="max-w-xl">
            <p
              className={`mb-2 text-sm font-medium uppercase tracking-[0.2em] ${
                theme === 'dark' ? 'text-white/50' : 'text-body/80'
              }`}
            >
              {t('landing.eyebrow')}
            </p>
            <p
              className={`mb-8 text-lg leading-relaxed sm:text-xl ${
                theme === 'dark' ? 'text-white/90' : 'text-heading/90'
              }`}
            >
              {t('landing.hero')}
            </p>

            <div className="flex flex-wrap gap-3">
              {user ? (
                <>
                  <Link to="/discover" className="btn-primary px-8 py-4">
                    {t('landing.discover')}
                  </Link>
                  <Link to="/profile" className="btn-secondary px-8 py-4">
                    {t('landing.myProfile')}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary px-8 py-4">
                    {t('landing.signUp')}
                  </Link>
                  <Link to="/login" className="btn-secondary px-8 py-4">
                    {t('landing.logIn')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`relative px-4 py-20 ${
          hasCustomBackground ? 'bg-transparent' : theme === 'dark' ? 'bg-black' : ''
        }`}
      >
        {theme === 'light' && !hasCustomBackground && (
          <div className="pointer-events-none absolute inset-0 bg-page-glow" />
        )}
        <div className="relative mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-sm font-semibold uppercase tracking-[0.25em] text-muted">
            {t('landing.howItWorks')}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="glass-card animate-shimmer">
                <p className="mb-3 text-xs font-bold text-lol-gold-dark dark:text-white/40">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mb-2 font-semibold text-heading">{step.title}</h3>
                <p className="text-sm text-body">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className={`border-t border-theme px-4 py-8 backdrop-blur-sm dark:border-white/10 ${
          hasCustomBackground
            ? 'bg-black/20 dark:bg-black/30'
            : 'bg-white/60 dark:bg-black'
        }`}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium text-heading">Lol-edate</span>
          <p className="text-xs text-muted">{t('landing.footerDisclaimer')}</p>
        </div>
      </footer>
    </div>
  )
}
