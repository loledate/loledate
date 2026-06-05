import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const iconButtonClass =
  'flex h-8 w-8 items-center justify-center rounded-full border border-theme text-muted transition-colors hover:border-rose-400/40 hover:text-heading dark:hover:border-white/30 dark:hover:text-white'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={iconButtonClass}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
