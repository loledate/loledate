import { useLanguage } from '../context/LanguageContext'

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <div
      className="flex items-center rounded-full border border-theme p-0.5 text-[10px] font-semibold uppercase tracking-wider"
      role="group"
      aria-label={t('lang.switchTo', {
        lang: locale === 'es' ? 'English' : 'Español',
      })}
    >
      {(['es', 'en'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded-full px-2 py-1 transition-colors ${
            locale === code
              ? 'bg-heading text-white dark:bg-white dark:text-black'
              : 'text-muted hover:text-heading'
          }`}
          aria-pressed={locale === code}
        >
          {t(`lang.${code}`)}
        </button>
      ))}
    </div>
  )
}
