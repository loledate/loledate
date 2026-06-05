import { Heart, Star, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

interface ActionButtonsProps {
  onPass: () => void
  onLike: () => void
  onSuperLike: () => void
  disabled?: boolean
}

export default function ActionButtons({
  onPass,
  onLike,
  onSuperLike,
  disabled = false,
}: ActionButtonsProps) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onPass}
        disabled={disabled}
        aria-label={t('swipe.pass')}
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-rose-200 bg-white text-rose-400 shadow-sm transition-all hover:border-rose-400 hover:text-rose-600 disabled:opacity-30 dark:border-white/20 dark:bg-black dark:text-white/50 dark:hover:border-white/40 dark:hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        onClick={onSuperLike}
        disabled={disabled}
        aria-label="Super Like"
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-50 text-amber-600 shadow-glow-gold transition-all hover:scale-105 disabled:opacity-30 dark:border-amber-500/40 dark:bg-black dark:text-amber-400"
      >
        <Star className="h-4 w-4 fill-current" />
      </button>

      <button
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-rose-400 bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-glow transition-all hover:scale-105 disabled:opacity-30 dark:border-white dark:bg-white dark:from-white dark:to-white dark:text-black dark:shadow-none"
      >
        <Heart className="h-6 w-6 fill-current" />
      </button>
    </div>
  )
}
