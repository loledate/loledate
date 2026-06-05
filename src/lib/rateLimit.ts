export const RATE_LIMIT_ERROR = 'errors.rateLimit'

export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    const message = String(error ?? '').toLowerCase()
    return message.includes('rate_limit')
  }

  const err = error as { message?: string; code?: string }
  const message = (err.message ?? '').toLowerCase()

  return (
    message.includes('rate_limit') ||
    message.includes('rate limit') ||
    err.code === 'P0001'
  )
}

export function toAppError(error: unknown, fallbackKey: string): Error {
  if (isRateLimitError(error)) {
    return new Error(RATE_LIMIT_ERROR)
  }

  if (error instanceof Error) {
    return error
  }

  return new Error(fallbackKey)
}

export const SEND_MESSAGE_COOLDOWN_MS = 800

let lastMessageSentAt = 0

export function assertMessageSendCooldown(): void {
  const now = Date.now()
  if (now - lastMessageSentAt < SEND_MESSAGE_COOLDOWN_MS) {
    throw new Error(RATE_LIMIT_ERROR)
  }
  lastMessageSentAt = now
}
