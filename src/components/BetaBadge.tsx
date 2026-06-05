import { useLanguage } from '../context/LanguageContext'

export default function BetaBadge() {
  const { t } = useLanguage()

  return (
    <div
      className="pointer-events-none fixed right-3 top-[max(0.5rem,env(safe-area-inset-top))] z-[60]"
      aria-label={t('common.beta')}
    >
      <span className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg ring-1 ring-red-400/50">
        {t('common.beta')}
      </span>
    </div>
  )
}
