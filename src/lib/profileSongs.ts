import { requireSupabase } from './supabase'

const BUCKET = 'profile-songs'
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(['video/mp4', 'audio/mp4'])

export function validateProfileSongFile(file: File): string | null {
  const isMp4 =
    ALLOWED_TYPES.has(file.type) ||
    file.name.toLowerCase().endsWith('.mp4')

  if (!isMp4) {
    return 'song.invalidFormat'
  }
  if (file.size > MAX_BYTES) {
    return 'song.tooLarge'
  }
  return null
}

export async function uploadProfileSong(
  userId: string,
  file: File
): Promise<string> {
  const validationError = validateProfileSongFile(file)
  if (validationError) throw new Error(validationError)

  const client = requireSupabase()
  const path = `${userId}/song.mp4`

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: 'video/mp4',
      cacheControl: '3600',
    })

  if (uploadError) throw uploadError

  const { data } = client.storage.from(BUCKET).getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}

export async function deleteProfileSong(userId: string): Promise<void> {
  const client = requireSupabase()

  const { data: files, error: listError } = await client.storage
    .from(BUCKET)
    .list(userId)

  if (listError) throw listError
  if (!files?.length) return

  const paths = files.map((file) => `${userId}/${file.name}`)
  const { error: removeError } = await client.storage.from(BUCKET).remove(paths)

  if (removeError) throw removeError
}
