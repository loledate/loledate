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
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onPass}
        disabled={disabled}
        aria-label="Rechazar"
        className="h-12 w-12 rounded-full border-2 border-rose-200 bg-white text-sm text-rose-400 shadow-sm transition-all hover:border-rose-400 hover:text-rose-600 disabled:opacity-30"
      >
        X
      </button>

      <button
        onClick={onSuperLike}
        disabled={disabled}
        aria-label="Super Like"
        className="h-11 w-11 rounded-full border-2 border-amber-300 bg-amber-50 text-xs text-amber-600 shadow-glow-gold transition-all hover:scale-105 disabled:opacity-30"
      >
        *
      </button>

      <button
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
        className="h-14 w-14 rounded-full border-2 border-rose-400 bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-semibold text-white shadow-glow transition-all hover:scale-105 disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}
