import type { Profile } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { xProfileUrl } from '../lib/social'
import { DiscordIcon, XIcon } from './SocialLinks'

interface ProfileSocialsProps {
  profile: Pick<Profile, 'discordUsername' | 'xUsername'>
  compact?: boolean
}

export default function ProfileSocials({
  profile,
  compact = false,
}: ProfileSocialsProps) {
  const { t } = useLanguage()
  const discord = profile.discordUsername.trim()
  const xHandle = profile.xUsername.trim()

  if (!discord && !xHandle) return null

  const items = (
    <>
      {discord && (
        <div className={itemClass(compact)}>
          <DiscordIcon className="h-4 w-4 shrink-0 text-muted" />
          <span className="font-medium text-heading">{discord}</span>
        </div>
      )}
      {xHandle && (
        <a
          href={xProfileUrl(xHandle)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${itemClass(compact)} transition-colors hover:text-heading`}
        >
          <XIcon className="h-4 w-4 shrink-0 text-muted" />
          <span className="font-medium text-heading">
            @{xHandle.replace(/^@+/, '')}
          </span>
        </a>
      )}
    </>
  )

  if (compact) {
    return <div className="mt-1 flex flex-wrap items-center gap-2">{items}</div>
  }

  return (
    <div>
      <p className="mb-2 text-xs text-muted">{t('card.socials')}</p>
      <div className="space-y-2">{items}</div>
    </div>
  )
}

function itemClass(compact: boolean) {
  return compact
    ? 'inline-flex items-center gap-1.5 rounded-full border border-theme px-2.5 py-1 text-xs text-body'
    : 'flex items-center gap-3 rounded-xl bg-rose-50 p-3 dark:bg-white/5'
}
