import { createClient } from '@supabase/supabase-js'
import {
  getClientIp,
  protectRegisterAttempt,
} from './lib/rateLimit.mjs'

const AUTH_EMAIL_DOMAIN = 'users.loledate.app'

function usernameToAuthEmail(username) {
  const normalized = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  if (!normalized) throw new Error('validation.invalidUsername')
  return `${normalized}@${AUTH_EMAIL_DOMAIN}`
}

function validateUsername(username) {
  const trimmed = username.trim()
  if (trimmed.length < 3) return 'validation.usernameMin'
  if (trimmed.length > 20) return 'validation.usernameMax'
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return 'validation.usernameChars'
  }
  return null
}

function mapAuthError(message) {
  const lower = message.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'auth.userExists'
  }
  if (lower.includes('password')) {
    return 'auth.passwordMin'
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'errors.rateLimit'
  }
  return message
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase =
    url && serviceKey
      ? createClient(url, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null

  const rateCheck = await protectRegisterAttempt(supabase, ip)
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'errors.rateLimit',
      retryAfter: 900,
    })
  }

  const { username, password } = req.body ?? {}
  const usernameError = validateUsername(username ?? '')
  if (usernameError) {
    return res.status(400).json({ error: usernameError })
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'auth.passwordMin' })
  }

  if (!supabase) {
    return res.status(500).json({
      error: 'auth.supabaseEnv',
    })
  }

  let email
  try {
    email = usernameToAuthEmail(username)
  } catch {
    return res.status(400).json({ error: 'validation.invalidUsername' })
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password: String(password),
    email_confirm: true,
    user_metadata: { username: username.trim() },
  })

  if (error) {
    const mapped = mapAuthError(error.message)
    const status = mapped === 'errors.rateLimit' ? 429 : 400
    return res.status(status).json({ error: mapped })
  }

  return res.status(200).json({ ok: true })
}
