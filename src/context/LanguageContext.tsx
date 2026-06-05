import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LookingFor } from '../types'
import {
  detectInitialLocale,
  LOCALE_KEY,
  translate,
  type Locale,
} from '../i18n'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  lookingForLabel: (value: LookingFor) => string
  interestLabel: (value: string) => string
  rankLabel: (value: string) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const RANK_KEY_MAP: Record<string, string> = {
  Hierro: 'hierro',
  Bronce: 'bronce',
  Plata: 'plata',
  Oro: 'oro',
  Platino: 'platino',
  Esmeralda: 'esmeralda',
  Diamante: 'diamante',
  'Maestro+': 'maestro',
  'Maestro': 'maestro',
}

const INTEREST_KEY_MAP: Record<string, string> = {
  anime: 'anime',
  música: 'musica',
  gaming: 'gaming',
  streaming: 'streaming',
  gym: 'gym',
  café: 'cafe',
  cosplay: 'cosplay',
  lectura: 'lectura',
  playa: 'playa',
  manga: 'manga',
  series: 'series',
  viajes: 'viajes',
  arte: 'arte',
  fútbol: 'futbol',
  'K-pop': 'kpop',
  gatos: 'gatos',
  tech: 'tech',
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitialLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(LOCALE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  )

  const lookingForLabel = useCallback(
    (value: LookingFor) => t(`lookingFor.${value}`),
    [t]
  )

  const interestLabel = useCallback(
    (value: string) => {
      const key = INTEREST_KEY_MAP[value]
      return key ? t(`interests.${key}`) : value
    },
    [t]
  )

  const rankLabel = useCallback(
    (value: string) => {
      const key = RANK_KEY_MAP[value]
      return key ? t(`ranks.${key}`) : value
    },
    [t]
  )

  const value = useMemo(
    () => ({ locale, setLocale, t, lookingForLabel, interestLabel, rankLabel }),
    [locale, setLocale, t, lookingForLabel, interestLabel, rankLabel]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}

export function useOptionalLanguage() {
  return useContext(LanguageContext)
}
