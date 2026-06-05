interface LikeAnimationProps {
  type: 'like' | 'super_like'
  show: boolean
}

export default function LikeAnimation({ type, show }: LikeAnimationProps) {
  if (!show) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div className="rounded-2xl border border-rose-200 bg-white/90 px-6 py-4 shadow-glow backdrop-blur-md dark:border-white/20 dark:bg-black/80 dark:shadow-glow-dark">
        <span className="text-sm font-semibold text-rose-700 dark:text-white/80">
          {type === 'super_like' ? 'Super like enviado' : 'Like enviado'}
        </span>
      </div>
    </div>
  )
}
