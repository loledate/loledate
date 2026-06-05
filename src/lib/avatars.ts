import { requireSupabase } from './supabase'

const BUCKET = 'avatars'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

function extensionForType(type: string): string {
  switch (type) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'jpg'
  }
}

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Formato no válido. Usa JPG, PNG, WebP o GIF.'
  }
  if (file.size > MAX_BYTES) {
    return 'La imagen no puede superar 5 MB.'
  }
  return null
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const validationError = validateAvatarFile(file)
  if (validationError) throw new Error(validationError)

  const client = requireSupabase()
  const ext = extensionForType(file.type)
  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: '3600',
    })

  if (uploadError) throw uploadError

  const { data } = client.storage.from(BUCKET).getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}

export async function deleteAvatar(userId: string): Promise<void> {
  const client = requireSupabase()

  const { data: files, error: listError } = await client.storage
    .from(BUCKET)
    .list(userId)

  if (listError) throw listError
  if (!files?.length) return

  const paths = files.map((file) => `${userId}/${file.name}`)
  const { error: removeError } = await client.storage
    .from(BUCKET)
    .remove(paths)

  if (removeError) throw removeError
}
