import { requireSupabase } from './supabase'

const BUCKET = 'profile-songs'
const MAX_BYTES = 10 * 1024 * 1024

const MP3_TYPES = new Set(['audio/mpeg', 'audio/mp3'])
const MP4_TYPES = new Set(['video/mp4', 'audio/mp4'])

export type ProfileSongFormat = 'mp3' | 'mp4'

export function getProfileSongFormat(file: File): ProfileSongFormat | null {
  const name = file.name.toLowerCase()

  if (MP3_TYPES.has(file.type) || name.endsWith('.mp3')) {
    return 'mp3'
  }
  if (MP4_TYPES.has(file.type) || name.endsWith('.mp4')) {
    return 'mp4'
  }
  return null
}

export function validateProfileSongFile(file: File): string | null {
  if (!getProfileSongFormat(file)) {
    return 'song.invalidFormat'
  }
  if (file.size > MAX_BYTES) {
    return 'song.tooLarge'
  }
  return null
}

function contentTypeForFormat(format: ProfileSongFormat): string {
  return format === 'mp3' ? 'audio/mpeg' : 'video/mp4'
}

export async function uploadProfileSong(
  userId: string,
  file: File
): Promise<string> {
  const validationError = validateProfileSongFile(file)
  if (validationError) throw new Error(validationError)

  const format = getProfileSongFormat(file)
  if (!format) throw new Error('song.invalidFormat')

  const client = requireSupabase()
  await deleteProfileSong(userId)

  const path = `${userId}/song.${format}`

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: contentTypeForFormat(format),
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
