import { useRef, useState } from 'react'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    const validationError = validateAvatarFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError('')

    try {
      const url = await uploadAvatar(userId, file)
      const result = await onPhotoChange(url)
      if (result.error) setError(result.error)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo subir la foto.'
      )
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
      if (result.error) setError(result.error)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo quitar la foto.'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border border-theme p-5">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted">
        Foto de perfil
      </h3>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Avatar
          url={photoUrl}
          name={name}
          className="h-24 w-24 rounded-xl"
        />
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
            {uploading ? 'Subiendo...' : photoUrl ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={uploading}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
            >
              Quitar foto
            </button>
          )}
          <p className="text-xs text-muted">JPG, PNG, WebP o GIF. Máximo 5 MB.</p>
          {error && <p className="text-xs text-body">{error}</p>}
        </div>
      </div>
    </div>
  )
}
