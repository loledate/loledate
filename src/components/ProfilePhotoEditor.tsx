import { useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import Avatar from './Avatar'
import { deleteAvatar, uploadAvatar, validateAvatarFile } from '../lib/avatars'

interface ProfilePhotoEditorProps {
  userId: string
  name: string
  photoUrl: string | null
  onPhotoChange: (photoUrl: string | null) => Promise<{ error: string | null }>
}

export default function ProfilePhotoEditor({
  userId,
  name,
  photoUrl,
  onPhotoChange,
}: ProfilePhotoEditorProps) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    const validationError = validateAvatarFile(file)
    if (validationError) {
      setError(t(validationError))
      return
    }

    setUploading(true)
    setError('')

    try {
      const url = await uploadAvatar(userId, file)
      const result = await onPhotoChange(url)
      if (result.error) setError(t(result.error))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'profile.photoUploadFailed'
      setError(t(message))
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    setError('')

    try {
      await deleteAvatar(userId).catch(() => {})
      const result = await onPhotoChange(null)
      if (result.error) setError(t(result.error))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'profile.photoRemoveFailed'
      setError(t(message))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border border-theme p-5">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted">
        {t('profile.photoTitle')}
      </h3>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl border border-theme bg-rose-100 dark:bg-zinc-900 sm:w-32">
          <Avatar
            url={photoUrl}
            name={name}
            className="h-full w-full"
            fit="contain"
          />
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
          >
            {uploading
              ? t('profile.uploadingPhoto')
              : photoUrl
                ? t('profile.changePhoto')
                : t('profile.uploadPhoto')}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={uploading}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
            >
              {t('profile.removePhoto')}
            </button>
          )}
          <p className="text-xs text-muted">{t('profile.photoHint')}</p>
          {error && <p className="text-xs text-body">{error}</p>}
        </div>
      </div>
    </div>
  )
}
