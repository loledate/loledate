interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'elo' | 'role' | 'champion' | 'looking'
  className?: string
}

export default function Badge({
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ${className}`}
    >
      {children}
    </span>
  )
}
