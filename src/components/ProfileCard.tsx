import type { Profile } from '../types'
import { LOOKING_FOR_LABELS } from '../types'
import Badge from './Badge'
import Avatar from './Avatar'

interface ProfileCardProps {
  profile: Profile
  compact?: boolean
}

export default function ProfileCard({ profile, compact = false }: ProfileCardProps) {
  if (compact) {
    return (
      <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-card">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Avatar
            url={profile.photoUrl}
            name={profile.name}
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-900/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-semibold text-white">
              {profile.name}, {profile.age}
            </h3>
            <p className="text-xs text-rose-100">{profile.city}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {profile.elo && <Badge>{profile.elo}</Badge>}
              <Badge>{profile.role}</Badge>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-card">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Avatar
          url={profile.photoUrl}
          name={profile.name}
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent" />

        <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
          <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-rose-700 backdrop-blur-sm">
            {profile.distanceKm} km
          </span>
          {profile.elo && <Badge className="text-xs">{profile.elo}</Badge>}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-2xl font-semibold text-white drop-shadow-md">
            {profile.name}
            <span className="ml-2 text-xl font-normal text-rose-100">
              {profile.age}
            </span>
          </h2>
          <p className="mt-1 text-sm text-rose-50">{profile.city}</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {profile.riotId && (
          <div className="flex items-center justify-between rounded-xl bg-rose-50 p-3">
            <div>
              <p className="text-xs text-rose-400">Riot ID</p>
              <p className="text-sm font-medium text-rose-900">{profile.riotId}</p>
            </div>
            {profile.opggUrl && (
              <a
                href={profile.opggUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-rose-500 underline underline-offset-2 hover:text-rose-700"
              >
                OP.GG
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-rose-400">Rol</span>
          <Badge>{profile.role}</Badge>
        </div>

        {profile.favoriteChampions.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-rose-400">Mains</p>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteChampions.map((champ) => (
                <Badge key={champ}>{champ}</Badge>
              ))}
            </div>
          </div>
        )}

        {profile.lookingFor.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-rose-400">Busca</p>
            <div className="flex flex-wrap gap-2">
              {profile.lookingFor.map((lf) => (
                <Badge key={lf}>{LOOKING_FOR_LABELS[lf]}</Badge>
              ))}
            </div>
          </div>
        )}

        {profile.bio && (
          <p className="text-sm leading-relaxed text-rose-700">{profile.bio}</p>
        )}

        {profile.interests.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-rose-400">Intereses</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge key={interest}>{interest}</Badge>
              ))}
            </div>
          </div>
        )}

        {profile.playSchedule && (
          <p className="text-xs text-rose-500">{profile.playSchedule}</p>
        )}
      </div>
    </div>
  )
}
