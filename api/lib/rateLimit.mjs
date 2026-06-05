const RATE_LIMIT_CODE = 'rate_limit_exceeded'

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim()
  }
  return req.socket?.remoteAddress ?? 'unknown'
}

export function isRateLimitError(error) {
  if (!error) return false
  const message = String(error.message ?? error).toLowerCase()
  return (
    message.includes('rate_limit') ||
    message.includes(RATE_LIMIT_CODE) ||
    error.code === 'P0001'
  )
}

/**
 * In-memory fallback (por instancia serverless). No sustituye Supabase RPC.
 */
const memoryBuckets = new Map()

export function checkMemoryRateLimit(key, maxHits, windowMs) {
  const now = Date.now()
  let entry = memoryBuckets.get(key)

  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 0 }
  }

  entry.count += 1
  memoryBuckets.set(key, entry)

  if (memoryBuckets.size > 5000) {
    for (const [bucketKey, value] of memoryBuckets) {
      if (now - value.start > windowMs) {
        memoryBuckets.delete(bucketKey)
      }
    }
  }

  return entry.count <= maxHits
}

export async function assertSupabaseRateLimit(
  supabase,
  bucketKey,
  action,
  maxHits,
  windowSeconds
) {
  const { error } = await supabase.rpc('assert_rate_limit', {
    p_bucket_key: bucketKey,
    p_action: action,
    p_max_hits: maxHits,
    p_window_seconds: windowSeconds,
  })

  if (!error) return { allowed: true }

  if (isRateLimitError(error)) {
    return { allowed: false }
  }

  return { allowed: true, skipped: true, error }
}

export async function protectRegisterAttempt(supabase, ip) {
  const burstKey = `ip:${ip}:register:burst`
  const hourKey = `ip:${ip}:register:hour`

  const burstOk = checkMemoryRateLimit(burstKey, 5, 15 * 60 * 1000)
  const hourOk = checkMemoryRateLimit(hourKey, 15, 60 * 60 * 1000)

  if (!burstOk || !hourOk) {
    return { allowed: false, source: 'memory' }
  }

  if (!supabase) {
    return { allowed: true }
  }

  const burst = await assertSupabaseRateLimit(
    supabase,
    burstKey,
    'register_burst',
    5,
    900
  )
  if (!burst.allowed) {
    return { allowed: false, source: 'supabase' }
  }

  const hourly = await assertSupabaseRateLimit(
    supabase,
    hourKey,
    'register_hour',
    15,
    3600
  )
  if (!hourly.allowed) {
    return { allowed: false, source: 'supabase' }
  }

  return { allowed: true }
}

export { RATE_LIMIT_CODE }
