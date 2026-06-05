import type { Profile } from '../types'
import { requireSupabase } from './supabase'
import { toAppError } from './rateLimit'

export type ReputationTierKey =
  | 'unrated'
  | 'new'
  | 'known'
  | 'respected'
  | 'legend'

export interface ProfileReputation {
  count: number
  likedByMe: boolean
  tier: ReputationTierKey
}

export function getReputationTier(count: number): ReputationTierKey {
  if (count <= 0) return 'unrated'
  if (count < 5) return 'new'
  if (count < 15) return 'known'
  if (count < 50) return 'respected'
  return 'legend'
}

function buildReputation(count: number, likedByMe: boolean): ProfileReputation {
  return { count, likedByMe, tier: getReputationTier(count) }
}

export async function fetchProfileReputation(
  targetUserId: string,
  currentUserId: string
): Promise<ProfileReputation> {
  const client = requireSupabase()

  const { count, error: countError } = await client
    .from('profile_likes')
    .select('*', { count: 'exact', head: true })
    .eq('liked_user_id', targetUserId)

  if (countError) throw countError

  if (targetUserId === currentUserId) {
    return buildReputation(count ?? 0, false)
  }

  const { data, error } = await client
    .from('profile_likes')
    .select('id')
    .eq('liker_id', currentUserId)
    .eq('liked_user_id', targetUserId)
    .maybeSingle()

  if (error) throw error

  return buildReputation(count ?? 0, Boolean(data))
}

export async function fetchReputationForUsers(
  targetUserIds: string[],
  currentUserId: string
): Promise<Map<string, ProfileReputation>> {
  const result = new Map<string, ProfileReputation>()
  if (!targetUserIds.length) return result

  const client = requireSupabase()
  const uniqueIds = [...new Set(targetUserIds)]

  const { data: likeRows, error } = await client
    .from('profile_likes')
    .select('liker_id, liked_user_id')
    .in('liked_user_id', uniqueIds)

  if (error) throw error

  const countByUser = new Map<string, number>()
  const likedByMe = new Set<string>()

  for (const row of likeRows ?? []) {
    countByUser.set(
      row.liked_user_id,
      (countByUser.get(row.liked_user_id) ?? 0) + 1
    )
    if (row.liker_id === currentUserId) {
      likedByMe.add(row.liked_user_id)
    }
  }

  for (const userId of uniqueIds) {
    const count = countByUser.get(userId) ?? 0
    result.set(userId, buildReputation(count, likedByMe.has(userId)))
  }

  return result
}

export async function toggleProfileLike(
  targetUserId: string,
  currentUserId: string,
  currentlyLiked: boolean
): Promise<ProfileReputation> {
  if (targetUserId === currentUserId) {
    throw new Error('reputation.selfLike')
  }

  const client = requireSupabase()

  if (currentlyLiked) {
    const { error } = await client
      .from('profile_likes')
      .delete()
      .eq('liker_id', currentUserId)
      .eq('liked_user_id', targetUserId)

    if (error) throw toAppError(error, 'reputation.toggleFailed')
  } else {
    const { error } = await client.from('profile_likes').insert({
      liker_id: currentUserId,
      liked_user_id: targetUserId,
    })

    if (error) throw toAppError(error, 'reputation.toggleFailed')
  }

  return fetchProfileReputation(targetUserId, currentUserId)
}

export function attachReputationToProfiles(
  profiles: Profile[],
  reputationByUser: Map<string, ProfileReputation>
): Profile[] {
  return profiles.map((profile) => {
    const rep = reputationByUser.get(profile.userId)
    if (!rep) return profile
    return {
      ...profile,
      reputationCount: rep.count,
      reputationTier: rep.tier,
      reputationLikedByMe: rep.likedByMe,
    }
  })
}
