import type { Profile } from '../types'
import { requireSupabase } from './supabase'
import type { DbLolAccount, DbProfile } from '../db/schema'
import { createEmptyProfile } from '../data/constants'
import {
  normalizeDiscordUsername,
  normalizeXUsername,
} from './social'

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
    riotId: lol?.riot_id ?? '',
    opggUrl: lol?.opgg_url ?? '',
    elo: lol?.elo ?? '',
    role: (lol?.main_role as Profile['role']) ?? 'Mid',
    favoriteChampions: lol?.favorite_champions ?? [],
    lookingFor:
      row.profile_looking_for?.map(
        (x) => x.looking_for as Profile['lookingFor'][number]
      ) ?? [],
    bio: row.bio ?? '',
    interests: row.interests?.map((x) => x.interest) ?? [],
    playSchedule: row.play_schedule ?? '',
    discordUsername: row.discord_username ?? '',
    xUsername: row.x_username ?? '',
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

  return ((data as ProfileRow[]) ?? [])
    .filter((row) => !swipedUserIds.has(row.user_id))
    .map(mapRowToProfile)
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
): Promise<void> {
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
    bio: profile.bio,
    play_schedule: profile.playSchedule,
    discord_username: discordUsername || null,
    x_username: xUsername || null,
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
    favorite_champions: profile.favoriteChampions,
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

  if (error) throw error

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
