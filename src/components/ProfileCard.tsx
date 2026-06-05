import type { Profile } from '../types'
import { useLanguage } from '../context/LanguageContext'
import Badge from './Badge'
import Avatar from './Avatar'
import ProfileSocials from './ProfileSocials'
import ReputationBadge from './ReputationBadge'
import type { ReputationTierKey } from '../lib/reputation'
import { getReputationTier } from '../lib/reputation'

interface ProfileCardProps {
  profile: Profile
  compact?: boolean
}

function ProfilePhoto({
  profile,
  className = 'h-24 w-24 sm:h-32 sm:w-32',
}: {
  profile: Profile
  className?: string
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-theme bg-rose-100 dark:bg-zinc-900 ${className}`}
    >
      <Avatar
        url={profile.photoUrl}
        name={profile.name}
        className="h-full w-full"
        fit="contain"
      />
    </div>
  )
}

function ProfileHeader({
  profile,
  reputationCount,
  reputationTierKey,
}: {
  profile: Profile
  reputationCount: number
  reputationTierKey: ReputationTierKey
}) {
  const { t } = useLanguage()

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-heading sm:text-2xl">
            {profile.name}
            <span className="ml-2 text-base font-normal text-muted sm:text-xl">
              {profile.age}
            </span>
          </h2>
          <p className="truncate text-sm text-body">{profile.city}</p>
        </div>
        {profile.distanceKm > 0 && (
          <span className="shrink-0 rounded-full border border-theme px-2 py-1 text-xs text-muted">
            {t('common.km', { n: profile.distanceKm })}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ReputationBadge
          count={reputationCount}
          tierKey={reputationTierKey}
          compact
        />
        {profile.elo && <Badge className="text-xs">{profile.elo}</Badge>}
        <Badge className="text-xs">{profile.role}</Badge>
      </div>

      <ProfileSocials profile={profile} compact />
    </div>
  )
}

export default function ProfileCard({ profile, compact = false }: ProfileCardProps) {
  const { t, lookingForLabel, interestLabel } = useLanguage()
  const reputationCount = profile.reputationCount ?? 0
  const reputationTierKey: ReputationTierKey =
    (profile.reputationTier as ReputationTierKey | undefined) ??
    getReputationTier(reputationCount)

  if (compact) {
    return (
      <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-card dark:border-white/10 dark:bg-black dark:shadow-none">
        <div className="flex gap-3 p-3">
          <ProfilePhoto profile={profile} className="h-20 w-20" />
          <ProfileHeader
            profile={profile}
            reputationCount={reputationCount}
            reputationTierKey={reputationTierKey}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-card dark:border-white/10 dark:bg-black dark:shadow-none">
      <div className="flex gap-4 border-b border-theme p-4 sm:gap-5 sm:p-5">
        <ProfilePhoto profile={profile} />
        <ProfileHeader
          profile={profile}
          reputationCount={reputationCount}
          reputationTierKey={reputationTierKey}
        />
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {profile.riotId && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-3 dark:bg-white/5">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">{t('card.riotId')}</p>
              <p className="truncate text-sm font-medium text-heading">
                {profile.riotId}
              </p>
            </div>
            {profile.opggUrl && (
              <a
                href={profile.opggUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-medium text-body underline underline-offset-2 hover:text-heading"
              >
                {t('profile.opgg')}
              </a>
            )}
          </div>
        )}

        {profile.favoriteChampions.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-muted">{t('card.mains')}</p>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteChampions.map((champ) => (
                <Badge key={champ}>{champ}</Badge>
              ))}
            </div>
          </div>
        )}

        {profile.lookingFor.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-muted">{t('card.lookingFor')}</p>
            <div className="flex flex-wrap gap-2">
              {profile.lookingFor.map((lf) => (
                <Badge key={lf}>{lookingForLabel(lf)}</Badge>
              ))}
            </div>
          </div>
        )}

        {profile.bio && (
          <div>
            <p className="mb-2 text-xs text-muted">{t('card.bio')}</p>
            <p className="text-sm leading-relaxed text-body">{profile.bio}</p>
          </div>
        )}

        {profile.interests.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-muted">{t('card.interests')}</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge key={interest}>{interestLabel(interest)}</Badge>
              ))}
            </div>
          </div>
        )}

        {profile.playSchedule && (
          <div>
            <p className="mb-2 text-xs text-muted">{t('card.schedule')}</p>
            <p className="text-sm text-body">{profile.playSchedule}</p>
          </div>
        )}
      </div>
    </div>
  )
}
