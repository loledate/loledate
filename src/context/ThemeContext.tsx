import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_CUSTOM_BACKGROUND,
  resolveBackgroundCss,
  type BackgroundPreset,
  type CustomBackgroundConfig,
} from '../lib/backgroundPresets'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'lol-edate-theme'
const THEME_SET_KEY = 'lol-edate-theme-set'
const BG_PRESET_KEY = 'lol-edate-bg-preset'
const BG_CUSTOM_KEY = 'lol-edate-bg-custom'

interface ThemeContextType {
  theme: Theme
  hasChosenTheme: boolean
  setTheme: (theme: Theme) => void
  coverImage: string
  backgroundPreset: BackgroundPreset
  customBackground: CustomBackgroundConfig
  backgroundCss: string | null
  hasCustomBackground: boolean
  setBackgroundPreset: (preset: BackgroundPreset) => void
  setCustomBackground: (config: CustomBackgroundConfig) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

function readBackgroundPreset(): BackgroundPreset {
  if (typeof window === 'undefined') return 'default'
  const saved = localStorage.getItem(BG_PRESET_KEY) as BackgroundPreset | null
  const valid: BackgroundPreset[] = [
    'default',
    'top',
    'jungle',
    'mid',
    'adc',
    'support',
    'custom',
  ]
  return saved && valid.includes(saved) ? saved : 'default'
}

function readCustomBackground(): CustomBackgroundConfig {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_BACKGROUND
  try {
    const raw = localStorage.getItem(BG_CUSTOM_KEY)
    if (!raw) return DEFAULT_CUSTOM_BACKGROUND
    const parsed = JSON.parse(raw) as Partial<CustomBackgroundConfig>
    return {
      color1: parsed.color1 ?? DEFAULT_CUSTOM_BACKGROUND.color1,
      color2: parsed.color2 ?? DEFAULT_CUSTOM_BACKGROUND.color2,
      gradient:
        typeof parsed.gradient === 'boolean'
          ? parsed.gradient
          : DEFAULT_CUSTOM_BACKGROUND.gradient,
    }
  } catch {
    return DEFAULT_CUSTOM_BACKGROUND
  }
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
  const [backgroundPreset, setBackgroundPresetState] =
    useState<BackgroundPreset>(readBackgroundPreset)
  const [customBackground, setCustomBackgroundState] =
    useState<CustomBackgroundConfig>(readCustomBackground)

  const backgroundCss = useMemo(
    () => resolveBackgroundCss(backgroundPreset, customBackground, theme),
    [backgroundPreset, customBackground, theme]
  )
  const hasCustomBackground = backgroundCss !== null

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  useEffect(() => {
    const body = document.body
    if (backgroundCss) {
      body.style.background = backgroundCss
      body.dataset.bgPreset = backgroundPreset
    } else {
      body.style.background = ''
      delete body.dataset.bgPreset
    }
  }, [backgroundCss, backgroundPreset])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    setHasChosenTheme(true)
    localStorage.setItem(THEME_KEY, next)
    localStorage.setItem(THEME_SET_KEY, 'true')
    applyThemeToDocument(next)
  }

  const setBackgroundPreset = (preset: BackgroundPreset) => {
    setBackgroundPresetState(preset)
    localStorage.setItem(BG_PRESET_KEY, preset)
  }

  const setCustomBackground = (config: CustomBackgroundConfig) => {
    setCustomBackgroundState(config)
    localStorage.setItem(BG_CUSTOM_KEY, JSON.stringify(config))
    setBackgroundPreset('custom')
  }

  const coverImage =
    theme === 'dark' ? '/fotoportada-dark.png' : '/fotoportada.png'

  return (
    <ThemeContext.Provider
      value={{
        theme,
        hasChosenTheme,
        setTheme,
        coverImage,
        backgroundPreset,
        customBackground,
        backgroundCss,
        hasCustomBackground,
        setBackgroundPreset,
        setCustomBackground,
      }}
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
