import type { Profile } from '../types'
import type { Match } from '../types'
import { requireSupabase } from './supabase'
import type { DbLolAccount, DbProfile } from '../db/schema'
import { createEmptyProfile } from '../data/constants'
import { isValidChampion } from '../data/champions'
import {
  normalizeDiscordUsername,
  normalizeXUsername,
} from './social'
import {
  attachReputationToProfiles,
  fetchReputationForUsers,
} from './reputation'
import { NEW_MATCH_PLACEHOLDER } from './chatConstants'
import { fetchUnreadCountsByMatch } from './messages'
import {
  parseProfileColorCustom,
  parseProfileColorPreset,
} from './profileColors'
import { toAppError } from './rateLimit'

type ProfileRow = DbProfile & {
  lol_accounts: DbLolAccount[] | DbLolAccount | null
  interests: { interest: string }[] | null
  profile_looking_for: { looking_for: string }[] | null
}

function mapRowToProfile(row: ProfileRow): Profile {
  const lol = Array.isArray(row.lol_accounts)
    ? row.lol_accounts[0]
    : row.lol_accounts

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    age: row.age,
    city: row.city,
    distanceKm: 0,
    photoUrl: row.avatar_url,
    songUrl: row.profile_song_url ?? null,
    riotId: lol?.riot_id ?? '',
    opggUrl: lol?.opgg_url ?? '',
    elo: lol?.elo ?? '',
    role: (lol?.main_role as Profile['role']) ?? 'Mid',
    favoriteChampions: (lol?.favorite_champions ?? []).filter(isValidChampion),
    lookingFor:
      row.profile_looking_for?.map(
        (x) => x.looking_for as Profile['lookingFor'][number]
      ) ?? [],
    bio: row.bio ?? '',
    interests: row.interests?.map((x) => x.interest) ?? [],
    playSchedule: row.play_schedule ?? '',
    discordUsername: row.discord_username ?? '',
    xUsername: row.x_username ?? '',
    lastSeenAt: row.last_seen_at ?? null,
    profileColorPreset: parseProfileColorPreset(row.profile_color_preset),
    profileColorCustom: parseProfileColorCustom(row),
  }
}

const profileSelect =
  '*, lol_accounts(*), interests(interest), profile_looking_for(looking_for)'

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const client = requireSupabase()

  const { data, error } = await client
    .from('profiles')
    .select(profileSelect)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapRowToProfile(data as ProfileRow)
}

export async function fetchDiscoverProfiles(
  currentUserId: string
): Promise<Profile[]> {
  const client = requireSupabase()

  const { data: swiped, error: swipesError } = await client
    .from('swipes')
    .select('swiped_id')
    .eq('swiper_id', currentUserId)

  if (swipesError) throw swipesError

  const swipedUserIds = new Set(swiped?.map((s) => s.swiped_id) ?? [])

  const { data, error } = await client
    .from('profiles')
    .select(profileSelect)
    .neq('user_id', currentUserId)

  if (error) throw error

  const profiles = ((data as ProfileRow[]) ?? [])
    .filter((row) => !swipedUserIds.has(row.user_id))
    .map(mapRowToProfile)

  const reputationByUser = await fetchReputationForUsers(
    profiles.map((p) => p.userId),
    currentUserId
  )

  return attachReputationToProfiles(profiles, reputationByUser)
}

export async function createProfile(
  userId: string,
  name: string
): Promise<Profile> {
  const client = requireSupabase()

  const { data, error } = await client
    .from('profiles')
    .insert({
      user_id: userId,
      name,
      age: 18,
      city: 'Madrid',
    })
    .select('id')
    .single()

  if (error) throw error

  const empty = createEmptyProfile(userId, name)
  return { ...empty, id: data.id }
}

export async function saveProfile(
  userId: string,
  profile: Profile
): Promise<Profile> {
  const client = requireSupabase()

  const { data: existing, error: fetchError } = await client
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError) throw fetchError

  let profileId = existing?.id

  const discordUsername = normalizeDiscordUsername(profile.discordUsername)
  const xUsername = normalizeXUsername(profile.xUsername)

  const profilePayload = {
    name: profile.name,
    age: profile.age,
    city: profile.city,
    avatar_url: profile.photoUrl,
    profile_song_url: profile.songUrl,
    bio: profile.bio,
    play_schedule: profile.playSchedule,
    discord_username: discordUsername || null,
    x_username: xUsername || null,
    profile_color_preset: profile.profileColorPreset,
    profile_color_1: profile.profileColorCustom.color1,
    profile_color_2: profile.profileColorCustom.color2,
    profile_color_gradient: profile.profileColorCustom.gradient,
    updated_at: new Date().toISOString(),
  }

  if (!profileId) {
    const { data: created, error: createError } = await client
      .from('profiles')
      .insert({
        user_id: userId,
        ...profilePayload,
      })
      .select('id')
      .single()

    if (createError) throw createError
    profileId = created.id
  } else {
    const { error: updateError } = await client
      .from('profiles')
      .update(profilePayload)
      .eq('id', profileId)

    if (updateError) throw updateError
  }

  const { data: lolExisting, error: lolFetchError } = await client
    .from('lol_accounts')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle()

  if (lolFetchError) throw lolFetchError

  const lolPayload = {
    profile_id: profileId,
    riot_id: profile.riotId || '',
    opgg_url: profile.opggUrl || null,
    elo: profile.elo || null,
    main_role: profile.role,
    favorite_champions: profile.favoriteChampions.filter(isValidChampion),
    updated_at: new Date().toISOString(),
  }

  if (lolExisting?.id) {
    const { error } = await client
      .from('lol_accounts')
      .update(lolPayload)
      .eq('id', lolExisting.id)
    if (error) throw error
  } else {
    const { error } = await client.from('lol_accounts').insert(lolPayload)
    if (error) throw error
  }

  await client.from('interests').delete().eq('profile_id', profileId)
  if (profile.interests.length > 0) {
    const { error } = await client.from('interests').insert(
      profile.interests.map((interest) => ({
        profile_id: profileId,
        interest,
      }))
    )
    if (error) throw error
  }

  await client.from('profile_looking_for').delete().eq('profile_id', profileId)
  if (profile.lookingFor.length > 0) {
    const { error } = await client.from('profile_looking_for').insert(
      profile.lookingFor.map((looking_for) => ({
        profile_id: profileId,
        looking_for,
      }))
    )
    if (error) throw error
  }

  const saved = await fetchProfile(userId)
  if (!saved) {
    throw new Error('No se pudo cargar el perfil guardado.')
  }
  return saved
}

export async function recordSwipe(
  swiperId: string,
  swipedUserId: string,
  action: 'like' | 'super_like' | 'pass'
): Promise<boolean> {
  const client = requireSupabase()

  const { error } = await client.from('swipes').upsert(
    {
      swiper_id: swiperId,
      swiped_id: swipedUserId,
      action,
    },
    { onConflict: 'swiper_id,swiped_id' }
  )

  if (error) throw toAppError(error, 'profile.saveFailed')

  if (action === 'pass') return false

  const { data: mutual, error: mutualError } = await client
    .from('swipes')
    .select('id')
    .eq('swiper_id', swipedUserId)
    .eq('swiped_id', swiperId)
    .in('action', ['like', 'super_like'])
    .maybeSingle()

  if (mutualError) throw mutualError
  if (!mutual) return false

  const [userA, userB] =
    swiperId < swipedUserId
      ? [swiperId, swipedUserId]
      : [swipedUserId, swiperId]

  const { error: matchError } = await client.from('matches').upsert(
    { user_a: userA, user_b: userB },
    { onConflict: 'user_a,user_b', ignoreDuplicates: true }
  )

  if (matchError) throw matchError
  return true
}

type DbMatchRow = {
  id: string
  user_a: string
  user_b: string
  matched_at: string
}

type DbMessageRow = {
  match_id: string
  content: string
  created_at: string
  sender_id: string
  read_at: string | null
}

export async function fetchMatches(currentUserId: string): Promise<Match[]> {
  const client = requireSupabase()

  const { data: rows, error } = await client
    .from('matches')
    .select('id, user_a, user_b, matched_at')
    .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)
    .order('matched_at', { ascending: false })

  if (error) throw error
  if (!rows?.length) return []

  const matchRows = rows as DbMatchRow[]
  const otherUserIds = matchRows.map((row) =>
    row.user_a === currentUserId ? row.user_b : row.user_a
  )

  const { data: profileRows, error: profileError } = await client
    .from('profiles')
    .select(profileSelect)
    .in('user_id', otherUserIds)

  if (profileError) throw profileError

  const profileByUserId = new Map(
    ((profileRows as ProfileRow[]) ?? []).map((row) => [
      row.user_id,
      mapRowToProfile(row),
    ])
  )

  const matchIds = matchRows.map((row) => row.id)
  const { data: messageRows } = await client
    .from('messages')
    .select('match_id, content, created_at, sender_id, read_at')
    .in('match_id', matchIds)
    .order('created_at', { ascending: false })

  const lastMessageByMatch = new Map<string, DbMessageRow>()
  for (const msg of (messageRows as DbMessageRow[]) ?? []) {
    if (!lastMessageByMatch.has(msg.match_id)) {
      lastMessageByMatch.set(msg.match_id, msg)
    }
  }

  const unreadCountByMatch = await fetchUnreadCountsByMatch(
    matchIds,
    currentUserId
  )

  const profiles = [...profileByUserId.values()]
  const reputationByUser = await fetchReputationForUsers(
    profiles.map((p) => p.userId),
    currentUserId
  )
  const enrichedByUserId = new Map(
    attachReputationToProfiles(profiles, reputationByUser).map((p) => [
      p.userId,
      p,
    ])
  )

  return matchRows
    .map((row) => {
      const otherUserId =
        row.user_a === currentUserId ? row.user_b : row.user_a
      const profile = enrichedByUserId.get(otherUserId)
      if (!profile) return null

      const last = lastMessageByMatch.get(row.id)
      const unreadCount = unreadCountByMatch.get(row.id) ?? 0

      return {
        id: row.id,
        profile,
        lastMessage: last?.content ?? NEW_MATCH_PLACEHOLDER,
        lastMessageAt: last?.created_at ?? row.matched_at,
        unread: unreadCount > 0,
        unreadCount,
      }
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
}

export async function fetchMatchById(
  matchId: string,
  currentUserId: string
): Promise<Match | null> {
  const client = requireSupabase()

  const { data: row, error } = await client
    .from('matches')
    .select('id, user_a, user_b, matched_at')
    .eq('id', matchId)
    .maybeSingle()

  if (error) throw error
  if (!row) return null

  const matchRow = row as DbMatchRow
  if (
    matchRow.user_a !== currentUserId &&
    matchRow.user_b !== currentUserId
  ) {
    return null
  }

  const otherUserId =
    matchRow.user_a === currentUserId ? matchRow.user_b : matchRow.user_a

  const { data: profileRow, error: profileError } = await client
    .from('profiles')
    .select(profileSelect)
    .eq('user_id', otherUserId)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profileRow) return null

  const { data: messageRows } = await client
    .from('messages')
    .select('match_id, content, created_at, sender_id, read_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(1)

  const last = (messageRows as DbMessageRow[] | null)?.[0]

  const { count: unreadCount } = await client
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', matchId)
    .neq('sender_id', currentUserId)
    .is('read_at', null)

  return {
    id: matchRow.id,
    profile: mapRowToProfile(profileRow as ProfileRow),
    lastMessage: last?.content ?? NEW_MATCH_PLACEHOLDER,
    lastMessageAt: last?.created_at ?? matchRow.matched_at,
    unread: (unreadCount ?? 0) > 0,
    unreadCount: unreadCount ?? 0,
  }
}
