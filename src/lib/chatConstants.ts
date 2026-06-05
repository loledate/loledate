export const NEW_MATCH_PLACEHOLDER = '__NEW_MATCH__'

export const LEGACY_NEW_MATCH_MESSAGES = [
  '¡Nuevo match! Escríbele un mensaje.',
  NEW_MATCH_PLACEHOLDER,
] as const

export function isNewMatchPlaceholder(message: string): boolean {
  return (LEGACY_NEW_MATCH_MESSAGES as readonly string[]).includes(message)
}
