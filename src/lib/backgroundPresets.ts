import type { Theme } from '../context/ThemeContext'

export type BackgroundPreset =
  | 'default'
  | 'top'
  | 'jungle'
  | 'mid'
  | 'adc'
  | 'support'
  | 'custom'

export interface CustomBackgroundConfig {
  color1: string
  color2: string
  gradient: boolean
}

export const DEFAULT_CUSTOM_BACKGROUND: CustomBackgroundConfig = {
  color1: '#6366f1',
  color2: '#ec4899',
  gradient: true,
}

export const ROLE_ACCENT: Record<
  Exclude<BackgroundPreset, 'default' | 'custom'>,
  string
> = {
  top: '#3b82f6',
  jungle: '#ef4444',
  mid: '#22c55e',
  adc: '#eab308',
  support: '#ec4899',
}

const ROLE_BACKGROUNDS: Record<
  Exclude<BackgroundPreset, 'default' | 'custom'>,
  Record<Theme, string>
> = {
  top: {
    light:
      'linear-gradient(180deg, #eff6ff 0%, #dbeafe 45%, #93c5fd 100%)',
    dark: 'linear-gradient(180deg, #020617 0%, #0c1929 45%, #1e40af 100%)',
  },
  jungle: {
    light:
      'linear-gradient(180deg, #fef2f2 0%, #fecaca 45%, #f87171 100%)',
    dark: 'linear-gradient(180deg, #0a0a0a 0%, #450a0a 45%, #b91c1c 100%)',
  },
  mid: {
    light:
      'linear-gradient(180deg, #f0fdf4 0%, #bbf7d0 45%, #4ade80 100%)',
    dark: 'linear-gradient(180deg, #0a0a0a 0%, #052e16 45%, #15803d 100%)',
  },
  adc: {
    light:
      'linear-gradient(180deg, #fefce8 0%, #fef08a 45%, #facc15 100%)',
    dark: 'linear-gradient(180deg, #0a0a0a 0%, #422006 45%, #a16207 100%)',
  },
  support: {
    light:
      'linear-gradient(180deg, #fdf2f8 0%, #fbcfe8 45%, #f472b6 100%)',
    dark: 'linear-gradient(180deg, #0a0a0a 0%, #500724 45%, #be185d 100%)',
  },
}

export function resolveBackgroundCss(
  preset: BackgroundPreset,
  custom: CustomBackgroundConfig,
  theme: Theme
): string | null {
  if (preset === 'default') return null

  if (preset === 'custom') {
    if (custom.gradient) {
      return `linear-gradient(180deg, ${custom.color1} 0%, ${custom.color2} 100%)`
    }
    return custom.color1
  }

  return ROLE_BACKGROUNDS[preset][theme]
}

export const ROLE_PRESETS: Exclude<BackgroundPreset, 'default' | 'custom'>[] = [
  'top',
  'jungle',
  'mid',
  'adc',
  'support',
]
