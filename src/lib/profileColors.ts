import {
  DEFAULT_CUSTOM_BACKGROUND,
  ROLE_ACCENT,
  type BackgroundPreset,
  type CustomBackgroundConfig,
} from './backgroundPresets'

export type ProfileColorPreset = BackgroundPreset

export function defaultProfileColorCustom(): CustomBackgroundConfig {
  return { ...DEFAULT_CUSTOM_BACKGROUND }
}

export function parseProfileColorPreset(
  value: string | null | undefined
): ProfileColorPreset {
  const valid: ProfileColorPreset[] = [
    'default',
    'top',
    'jungle',
    'mid',
    'adc',
    'support',
    'custom',
  ]
  return value && valid.includes(value as ProfileColorPreset)
    ? (value as ProfileColorPreset)
    : 'default'
}

export function parseProfileColorCustom(row: {
  profile_color_1?: string | null
  profile_color_2?: string | null
  profile_color_gradient?: boolean | null
}): CustomBackgroundConfig {
  return {
    color1: row.profile_color_1 ?? DEFAULT_CUSTOM_BACKGROUND.color1,
    color2: row.profile_color_2 ?? DEFAULT_CUSTOM_BACKGROUND.color2,
    gradient:
      typeof row.profile_color_gradient === 'boolean'
        ? row.profile_color_gradient
        : DEFAULT_CUSTOM_BACKGROUND.gradient,
  }
}

export interface ProfileCardTheme {
  headerBackground: string
  borderColor: string
  accentColor: string
  panelBackground: string
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim()
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(236, 72, 153, ${alpha})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export function resolveProfileCardTheme(
  preset: ProfileColorPreset,
  custom: CustomBackgroundConfig
): ProfileCardTheme | null {
  if (preset === 'default') return null

  if (preset === 'custom') {
    const primary = custom.color1
    const secondary = custom.color2
    const headerBackground = custom.gradient
      ? `linear-gradient(135deg, ${rgba(primary, 0.22)} 0%, ${rgba(secondary, 0.32)} 100%)`
      : rgba(primary, 0.24)
    return {
      headerBackground,
      borderColor: rgba(primary, 0.45),
      accentColor: primary,
      panelBackground: rgba(primary, 0.1),
    }
  }

  const accent = ROLE_ACCENT[preset]
  return {
    headerBackground: `linear-gradient(135deg, ${rgba(accent, 0.18)} 0%, ${rgba(accent, 0.32)} 100%)`,
    borderColor: rgba(accent, 0.42),
    accentColor: accent,
    panelBackground: rgba(accent, 0.1),
  }
}
