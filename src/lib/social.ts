export const SOCIAL_LINKS = {
  discord: import.meta.env.VITE_DISCORD_URL ?? 'https://discord.gg/loledate',
  x: import.meta.env.VITE_X_URL ?? 'https://x.com/loledate',
} as const

export function normalizeXUsername(value: string): string {
  return value.trim().replace(/^@+/, '')
}

export function xProfileUrl(username: string): string {
  const handle = normalizeXUsername(username)
  return handle ? `https://x.com/${encodeURIComponent(handle)}` : ''
}

export function normalizeDiscordUsername(value: string): string {
  return value.trim()
}