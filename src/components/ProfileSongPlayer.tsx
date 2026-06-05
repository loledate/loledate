import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { isProfileSongVideo } from '../lib/profileSongs'
import Avatar from './Avatar'

interface ProfileSongPlayerProps {
  songUrl: string | null
  profileName: string
  photoUrl?: string | null
  autoPlay?: boolean
  sticky?: boolean
  isOwnProfile?: boolean
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function ProfileSongPlayer({
  songUrl,
  profileName,
  photoUrl = null,
  autoPlay = true,
  sticky = false,
  isOwnProfile = false,
}: ProfileSongPlayerProps) {
  const { t } = useLanguage()
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [needsInteraction, setNeedsInteraction] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const isVideo = songUrl ? isProfileSongVideo(songUrl) : false

  const getMedia = () => (isVideo ? videoRef.current : audioRef.current)

  useLayoutEffect(() => {
    if (!songUrl || !autoPlay) return

    const tryPlay = () => {
      const media = isVideo ? videoRef.current : audioRef.current
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
    }

    requestAnimationFrame(tryPlay)
  }, [songUrl, autoPlay, isVideo])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      videoRef.current?.pause()
    }
  }, [])

  if (!songUrl) return null

  const title = isOwnProfile
    ? t('card.favoriteSongMine')
    : t('card.favoriteSong', { name: profileName })

  const syncTime = () => setCurrentTime(getMedia()?.currentTime ?? 0)
  const syncDuration = () => setDuration(getMedia()?.duration ?? 0)

  const togglePlay = async () => {
    const media = getMedia()
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
    const media = getMedia()
    if (!media) return
    media.muted = !media.muted
    setMuted(media.muted)
  }

  const handleSeek = (value: number) => {
    const media = getMedia()
    if (!media || !duration) return
    media.currentTime = (value / 100) * duration
    setCurrentTime(media.currentTime)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const wrapperClass = sticky
    ? 'fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-4'
    : 'mt-6 overflow-hidden rounded-2xl'

  const innerClass =
    'mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 p-3 shadow-2xl sm:gap-3 sm:p-4'

  return (
    <div className={wrapperClass}>
      {!isVideo && (
        <audio
          ref={audioRef}
          src={songUrl}
          loop
          preload="metadata"
          className="hidden"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={syncTime}
          onLoadedMetadata={syncDuration}
          onDurationChange={syncDuration}
        />
      )}

      <div className={innerClass}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
          {title}
        </p>

        {isVideo && (
          <video
            ref={videoRef}
            src={songUrl}
            loop
            playsInline
            controls={!sticky}
            preload="metadata"
            className={`w-full rounded-lg bg-black object-contain ${
              sticky ? 'max-h-28 sm:max-h-36' : 'aspect-video'
            }`}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={syncTime}
            onLoadedMetadata={syncDuration}
            onDurationChange={syncDuration}
          />
        )}

        <div className="flex items-center gap-3">
          {!isVideo && (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg shadow-lg ring-1 ring-white/10 sm:h-16 sm:w-16">
              <Avatar
                url={photoUrl}
                name={profileName}
                className="h-full w-full"
                fit="cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{profileName}</p>
            <p className="truncate text-xs text-zinc-400">
              {needsInteraction
                ? t('profile.songAutoplayBlocked')
                : playing
                  ? t('profile.songNowPlaying')
                  : t('profile.songPaused')}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => void toggleMute()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
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
              className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label={playing ? t('profile.songPause') : t('profile.songPlay')}
            >
              {playing ? (
                <Pause className="h-5 w-5 fill-current" aria-hidden />
              ) : (
                <Play className="h-5 w-5 fill-current" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-0.5">
          <span className="w-9 shrink-0 text-[10px] tabular-nums text-zinc-500">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-emerald-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
            aria-label={t('profile.songSeek')}
          />
          <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-zinc-500">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
