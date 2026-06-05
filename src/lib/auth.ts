const AUTH_EMAIL_DOMAIN = 'users.loledate.app'

export function usernameToAuthEmail(username: string): string {
  const normalized = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  if (!normalized) {
    throw new Error('Usuario inválido')
  }
  return `${normalized}@${AUTH_EMAIL_DOMAIN}`
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim()
  if (trimmed.length < 3) return 'Mínimo 3 caracteres.'
  if (trimmed.length > 20) return 'Máximo 20 caracteres.'
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return 'Solo letras, números y guion bajo.'
  }
  return null
}

export function getDisplayUsername(user: {
  user_metadata?: Record<string, unknown>
  email?: string | null
}): string {
  const meta = user.user_metadata?.username
  if (typeof meta === 'string' && meta.trim()) return meta.trim()
  const email = user.email ?? ''
  if (email.endsWith(`@${AUTH_EMAIL_DOMAIN}`)) {
    return email.replace(`@${AUTH_EMAIL_DOMAIN}`, '')
  }
  return email.split('@')[0] || 'Usuario'
}
