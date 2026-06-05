interface AvatarProps {
  url: string | null
  name: string
  className?: string
}

export default function Avatar({ url, name, className = '' }: AvatarProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`object-cover ${className}`}
      />
    )
  }

  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className={`flex items-center justify-center border border-rose-200 bg-gradient-to-br from-rose-100 to-amber-50 text-rose-600 dark:border-white/15 dark:from-zinc-800 dark:to-zinc-900 dark:text-white/50 ${className}`}
      aria-hidden
    >
      <span className="text-sm font-semibold">{initial}</span>
    </div>
  )
}
