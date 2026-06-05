import { createClient } from '@supabase/supabase-js'

const AUTH_EMAIL_DOMAIN = 'users.loledate.app'
const WINDOW_MS = 60_000
const MAX_SIGNUPS_PER_WINDOW = 30
const attempts = new Map()

function usernameToAuthEmail(username) {
  const normalized = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  if (!normalized) throw new Error('Usuario inválido')
  return `${normalized}@${AUTH_EMAIL_DOMAIN}`
}

function validateUsername(username) {
  const trimmed = username.trim()
  if (trimmed.length < 3) return 'Mínimo 3 caracteres.'
  if (trimmed.length > 20) return 'Máximo 20 caracteres.'
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return 'Solo letras, números y guion bajo.'
  }
  return null
}

function mapAuthError(message) {
  const lower = message.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'Ese usuario ya existe.'
  }
  if (lower.includes('password')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  return message
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress ?? 'unknown'
}

function isRateLimited(ip) {
  const now = Date.now()
  let entry = attempts.get(ip)
  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { start: now, count: 0 }
  }
  entry.count += 1
  attempts.set(ip, entry)
  return entry.count > MAX_SIGNUPS_PER_WINDOW
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: 'Demasiados registros a la vez. Espera un minuto.',
    })
  }

  const { username, password } = req.body ?? {}
  const usernameError = validateUsername(username ?? '')
  if (usernameError) {
    return res.status(400).json({ error: usernameError })
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return res.status(500).json({
      error: 'Registro no configurado en el servidor. Añade SUPABASE_SERVICE_ROLE_KEY en Vercel.',
    })
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let email
  try {
    email = usernameToAuthEmail(username)
  } catch {
    return res.status(400).json({ error: 'Usuario inválido' })
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password: String(password),
    email_confirm: true,
    user_metadata: { username: username.trim() },
  })

  if (error) {
    return res.status(400).json({ error: mapAuthError(error.message) })
  }

  return res.status(200).json({ ok: true })
}
