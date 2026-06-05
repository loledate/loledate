import { useLanguage } from '../context/LanguageContext'
import { isProfileSongVideo } from '../lib/profileSongs'

interface FavoriteSongMediaProps {
  songUrl: string | null
  profileName: string
  isOwnProfile?: boolean
}

export default function FavoriteSongMedia({
  songUrl,
  profileName,
  isOwnProfile = false,
}: FavoriteSongMediaProps) {
  const { t } = useLanguage()

  if (!songUrl) return null

  const isVideo = isProfileSongVideo(songUrl)
  const title = isOwnProfile
    ? t('card.favoriteSongMine')
    : t('card.favoriteSong', { name: profileName })

  return (
    <div className="overflow-hidden rounded-xl border border-theme bg-zinc-950">
      <p className="border-b border-white/10 bg-gradient-to-r from-zinc-900 to-emerald-950/30 px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
        {title}
      </p>
      {isVideo ? (
        <video
          src={songUrl}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full bg-black object-contain"
        />
      ) : (
        <div className="bg-gradient-to-r from-zinc-900 to-emerald-950/20 p-4">
          <audio src={songUrl} controls preload="metadata" className="w-full" />
        </div>
      )}
    </div>
  )
}
