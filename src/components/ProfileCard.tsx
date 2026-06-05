import type { Profile } from '../types'
import { useLanguage } from '../context/LanguageContext'
import Badge from './Badge'
import Avatar from './Avatar'
import OnlineIndicator from './OnlineIndicator'
import OnlineStatusLabel from './OnlineStatusLabel'
import ProfileSocials from './ProfileSocials'
import FavoriteSongMedia from './FavoriteSongMedia'
import ReputationBadge from './ReputationBadge'
import type { ReputationTierKey } from '../lib/reputation'
import { getReputationTier } from '../lib/reputation'
import { resolveProfileCardTheme } from '../lib/profileColors'

interface ProfileCardProps {
  profile: Profile
  compact?: boolean
  showOnline?: boolean
  isOwnProfile?: boolean
}

function ProfilePhoto({
  profile,
  className = 'h-24 w-24 sm:h-32 sm:w-32',
  showOnline = false,
  borderColor,
}: {
  profile: Profile
  className?: string
  showOnline?: boolean
  borderColor?: string
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border bg-rose-100 dark:bg-zinc-900 ${className} ${
        borderColor ? '' : 'border-theme'
      }`}
      style={borderColor ? { borderColor } : undefined}
    >
      <Avatar
        url={profile.photoUrl}
        name={profile.name}
        className="h-full w-full"
        fit="contain"
      />
      {showOnline && <OnlineIndicator userId={profile.userId} size="md" />}
    </div>
  )
}

function ProfileHeader({
  profile,
  reputationCount,
  reputationTierKey,
  showOnline = false,
}: {
  profile: Profile
  reputationCount: number
  reputationTierKey: ReputationTierKey
  showOnline?: boolean
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
          {showOnline && (
            <OnlineStatusLabel
              userId={profile.userId}
              lastSeenAt={profile.lastSeenAt}
              className="mt-0.5"
            />
          )}
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

export default function ProfileCard({
  profile,
  compact = false,
  showOnline = false,
  isOwnProfile = false,
}: ProfileCardProps) {
  const { t, lookingForLabel, interestLabel } = useLanguage()
  const cardTheme = resolveProfileCardTheme(
    profile.profileColorPreset,
    profile.profileColorCustom
  )
  const reputationCount = profile.reputationCount ?? 0
  const reputationTierKey: ReputationTierKey =
    (profile.reputationTier as ReputationTierKey | undefined) ??
    getReputationTier(reputationCount)

  const cardClass = cardTheme
    ? 'overflow-hidden rounded-2xl border bg-white shadow-card dark:bg-black dark:shadow-none'
    : 'overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-card dark:border-white/10 dark:bg-black dark:shadow-none'

  const riotPanelClass = cardTheme
    ? 'flex items-center justify-between gap-3 rounded-xl p-3'
    : 'flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-3 dark:bg-white/5'

  const content = (
    <>
      <div
        className={`flex gap-4 border-b border-theme ${compact ? 'gap-3 p-3' : 'p-4 sm:gap-5 sm:p-5'}`}
        style={
          cardTheme ? { background: cardTheme.headerBackground } : undefined
        }
      >
        <ProfilePhoto
          profile={profile}
          className={compact ? 'h-20 w-20' : undefined}
          showOnline={showOnline}
          borderColor={cardTheme?.borderColor}
        />
        <ProfileHeader
          profile={profile}
          reputationCount={reputationCount}
          reputationTierKey={reputationTierKey}
          showOnline={showOnline}
        />
      </div>

      {!compact && (
        <div className="space-y-4 p-4 sm:p-5">
          {profile.riotId && (
            <div
              className={riotPanelClass}
              style={
                cardTheme
                  ? { backgroundColor: cardTheme.panelBackground }
                  : undefined
              }
            >
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

          <FavoriteSongMedia
            songUrl={profile.songUrl}
            profileName={profile.name}
            isOwnProfile={isOwnProfile}
          />
        </div>
      )}
    </>
  )

  if (compact) {
    return (
      <div className={cardClass} style={cardTheme ? { borderColor: cardTheme.borderColor } : undefined}>
        {content}
      </div>
    )
  }

  return (
    <div
      className={`relative mx-auto w-full max-w-2xl ${cardClass}`}
      style={cardTheme ? { borderColor: cardTheme.borderColor } : undefined}
    >
      {content}
    </div>
  )
}
