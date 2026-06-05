import { es } from './translations/es'
import { en } from './translations/en'

export type Locale = 'es' | 'en'

export const translations = { es, en } as const

export type TranslationTree = typeof es

function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const value = getPath(translations[locale] as Record<string, unknown>, key)
  let text = typeof value === 'string' ? value : key

  if (params) {
    for (const [param, val] of Object.entries(params)) {
      text = text.split(`{{${param}}}`).join(String(val))
    }
  }

  return text
}

export const LOCALE_KEY = 'lol-edate-locale'

export function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'es'
  const saved = localStorage.getItem(LOCALE_KEY)
  if (saved === 'es' || saved === 'en') return saved
  const browser = navigator.language.toLowerCase()
  return browser.startsWith('es') ? 'es' : 'en'
}
