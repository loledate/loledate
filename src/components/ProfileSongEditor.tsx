import { useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import {
  deleteProfileSong,
  uploadProfileSong,
  validateProfileSongFile,
} from '../lib/profileSongs'

interface ProfileSongEditorProps {
  userId: string
  songUrl: string | null
  onSongChange: (songUrl: string | null) => Promise<{ error: string | null }>
}

export default function ProfileSongEditor({
  userId,
  songUrl,
  onSongChange,
}: ProfileSongEditorProps) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    const validationError = validateProfileSongFile(file)
    if (validationError) {
      setError(t(validationError))
      return
    }

    setUploading(true)
    setError('')

    try {
      const url = await uploadProfileSong(userId, file)
      const result = await onSongChange(url)
      if (result.error) setError(t(result.error))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'profile.songUploadFailed'
      setError(t(message))
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    setError('')

    try {
      await deleteProfileSong(userId).catch(() => {})
      const result = await onSongChange(null)
      if (result.error) setError(t(result.error))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'profile.songRemoveFailed'
      setError(t(message))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border border-theme p-5">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted">
        {t('profile.songTitle')}
      </h3>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-body">{t('profile.songDescription')}</p>
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,video/mp4,audio/mp4,.mp3,.mp4"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ''
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
          >
            {uploading
              ? t('profile.uploadingSong')
              : songUrl
                ? t('profile.changeSong')
                : t('profile.uploadSong')}
          </button>
          {songUrl && (
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={uploading}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
            >
              {t('profile.removeSong')}
            </button>
          )}
        </div>
        <p className="text-xs text-muted">{t('profile.songHint')}</p>
        {error && <p className="text-xs text-body">{error}</p>}
      </div>
    </div>
  )
}
