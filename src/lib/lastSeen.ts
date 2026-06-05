import type { Locale } from '../i18n'
import { isSupabaseConfigured, requireSupabase } from './supabase'

export async function touchLastSeen(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return

  const client = requireSupabase()
  const { error } = await client
    .from('profiles')
    .update({
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.warn('touchLastSeen failed', error.message)
  }
}

export function pickLatestIso(
  a?: string | null,
  b?: string | null
): string | null {
  if (!a) return b ?? null
  if (!b) return a
  return new Date(a) >= new Date(b) ? a : b
}

export function formatRelativeTime(iso: string, locale: Locale): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''

  const diffSec = Math.round((then - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const absSec = Math.abs(diffSec)

  if (absSec < 60) return rtf.format(diffSec, 'second')

  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')

  const diffHour = Math.round(diffSec / 3600)
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour')

  const diffDay = Math.round(diffSec / 86400)
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day')

  const diffMonth = Math.round(diffSec / (86400 * 30))
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month')

  const diffYear = Math.round(diffSec / (86400 * 365))
  return rtf.format(diffYear, 'year')
}
