import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'lol-edate-theme'
const THEME_SET_KEY = 'lol-edate-theme-set'

interface ThemeContextType {
  theme: Theme
  hasChosenTheme: boolean
  setTheme: (theme: Theme) => void
  coverImage: string
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = localStorage.getItem(THEME_KEY) as Theme | null
    return saved === 'dark' || saved === 'light' ? saved : 'light'
  })
  const [hasChosenTheme, setHasChosenTheme] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(THEME_SET_KEY) === 'true'
  })

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    setHasChosenTheme(true)
    localStorage.setItem(THEME_KEY, next)
    localStorage.setItem(THEME_SET_KEY, 'true')
    applyThemeToDocument(next)
  }

  const coverImage =
    theme === 'dark' ? '/fotoportada-dark.png' : '/fotoportada.png'

  return (
    <ThemeContext.Provider
      value={{ theme, hasChosenTheme, setTheme, coverImage }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}
