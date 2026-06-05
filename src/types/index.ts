import type { CustomBackgroundConfig } from '../lib/backgroundPresets'
import type { ProfileColorPreset } from '../lib/profileColors'

export type Role = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support'

export type LookingFor = 'duoQ' | 'amistad' | 'cita' | 'casual' | 'ranked'

export type Elo =
  | 'Hierro'
  | 'Bronce'
  | 'Plata'
  | 'Oro'
  | 'Platino'
  | 'Esmeralda'
  | 'Diamante'
  | 'Maestro'
  | 'Gran Maestro'
  | 'Retador'

export interface Profile {
  id: string
  userId: string
  name: string
  age: number
  city: string
  distanceKm: number
  photoUrl: string | null
  songUrl: string | null
  riotId: string
  opggUrl: string
  elo: string
  role: Role
  favoriteChampions: string[]
  lookingFor: LookingFor[]
  bio: string
  interests: string[]
  playSchedule: string
  discordUsername: string
  xUsername: string
  reputationCount?: number
  reputationTier?: string
  reputationLikedByMe?: boolean
  lastSeenAt?: string | null
  profileColorPreset: ProfileColorPreset
  profileColorCustom: CustomBackgroundConfig
}

export interface Filters {
  city: string
  ageMin: number
  ageMax: number
  elo: string
  role: Role | ''
  lookingFor: LookingFor | ''
  maxDistance: number
  interests: string
}

export interface Match {
  id: string
  profile: Profile
  lastMessage: string
  lastMessageAt: string
  unread: boolean
  unreadCount: number
}

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  timestamp: string
  isOwn: boolean
}

export const DEFAULT_FILTERS: Filters = {
  city: '',
  ageMin: 16,
  ageMax: 35,
  elo: '',
  role: '',
  lookingFor: '',
  maxDistance: 100,
  interests: '',
}

export const LOOKING_FOR_LABELS: Record<LookingFor, string> = {
  duoQ: 'DuoQ',
  amistad: 'Amistad',
  cita: 'Cita',
  casual: 'Casual',
  ranked: 'Ranked',
}
