import { useEffect, useRef, useState } from 'react'
import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

interface ProfileSongPlayerProps {
  songUrl: string | null
  profileName: string
  autoPlay?: boolean
}

export default function ProfileSongPlayer({
  songUrl,
  profileName,
  autoPlay = true,
}: ProfileSongPlayerProps) {
  const { t } = useLanguage()
  const mediaRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [needsInteraction, setNeedsInteraction] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    if (!songUrl || !autoPlay) return

    const media = mediaRef.current
    if (!media) return

    media.currentTime = 0
    const playPromise = media.play()

    if (!playPromise) return

    playPromise
      .then(() => {
        setPlaying(true)
        setNeedsInteraction(false)
      })
      .catch(() => {
        setPlaying(false)
        setNeedsInteraction(true)
      })
  }, [songUrl, autoPlay])

  useEffect(() => {
    return () => {
      mediaRef.current?.pause()
    }
  }, [])

  if (!songUrl) return null

  const togglePlay = async () => {
    const media = mediaRef.current
    if (!media) return

    if (media.paused) {
      try {
        await media.play()
        setPlaying(true)
        setNeedsInteraction(false)
      } catch {
        setNeedsInteraction(true)
      }
      return
    }

    media.pause()
    setPlaying(false)
  }

  const toggleMute = () => {
    const media = mediaRef.current
    if (!media) return

    media.muted = !media.muted
    setMuted(media.muted)
  }

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-theme bg-white/80 p-4 shadow-card backdrop-blur-sm dark:bg-zinc-950/90">
      <audio
        ref={mediaRef}
        src={songUrl}
        loop
        preload="metadata"
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-theme bg-rose-50 dark:bg-white/5">
          <Music2 className="h-5 w-5 text-heading" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-heading">
            {t('profile.songPlaying', { name: profileName })}
          </p>
          <p className="text-xs text-muted">
            {needsInteraction
              ? t('profile.songAutoplayBlocked')
              : playing
                ? t('profile.songNowPlaying')
                : t('profile.songPaused')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => void toggleMute()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-theme text-muted transition-colors hover:text-heading"
            aria-label={muted ? t('profile.songUnmute') : t('profile.songMute')}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" aria-hidden />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() => void togglePlay()}
            className="btn-primary flex h-10 w-10 items-center justify-center !px-0 !py-0"
            aria-label={playing ? t('profile.songPause') : t('profile.songPlay')}
          >
            {playing ? (
              <Pause className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
