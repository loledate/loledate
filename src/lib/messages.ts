import type { ChatMessage } from '../types'
import { requireSupabase } from './supabase'
import { assertMessageSendCooldown, toAppError } from './rateLimit'

type MessageRow = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

function mapMessage(row: MessageRow, currentUserId: string): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    text: row.content,
    timestamp: row.created_at,
    isOwn: row.sender_id === currentUserId,
  }
}

export async function fetchMessages(
  matchId: string,
  currentUserId: string
): Promise<ChatMessage[]> {
  const { data, error } = await requireSupabase()
    .from('messages')
    .select('id, sender_id, content, created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return ((data as MessageRow[]) ?? []).map((row) =>
    mapMessage(row, currentUserId)
  )
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  content: string
): Promise<ChatMessage> {
  const trimmed = content.trim()
  if (!trimmed) throw new Error('messages.emptyMessage')

  assertMessageSendCooldown()

  const { data, error } = await requireSupabase()
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content: trimmed,
    })
    .select('id, sender_id, content, created_at')
    .single()

  if (error) throw toAppError(error, 'messages.sendFailed')
  return mapMessage(data as MessageRow, senderId)
}

export async function markMessagesAsRead(
  matchId: string,
  currentUserId: string
): Promise<number> {
  const client = requireSupabase()

  const { data: rpcCount, error: rpcError } = await client.rpc(
    'mark_match_messages_read',
    { p_match_id: matchId }
  )

  if (!rpcError && typeof rpcCount === 'number') {
    return rpcCount
  }

  const { data, error } = await client
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .neq('sender_id', currentUserId)
    .is('read_at', null)
    .select('id')

  if (error) throw error
  return data?.length ?? 0
}

export async function fetchUnreadCountsByMatch(
  matchIds: string[],
  currentUserId: string
): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  if (!matchIds.length) return counts

  const client = requireSupabase()

  const { data, error } = await client
    .from('messages')
    .select('match_id')
    .in('match_id', matchIds)
    .neq('sender_id', currentUserId)
    .is('read_at', null)

  if (error) throw error

  for (const row of data ?? []) {
    counts.set(row.match_id, (counts.get(row.match_id) ?? 0) + 1)
  }

  return counts
}

export function subscribeToMessages(
  matchId: string,
  currentUserId: string,
  onInsert: (message: ChatMessage) => void
) {
  const client = requireSupabase()

  const channel = client
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        const row = payload.new as MessageRow
        onInsert(mapMessage(row, currentUserId))
      }
    )
    .subscribe()

  return () => {
    client.removeChannel(channel)
  }
}

type IncomingMessageRow = MessageRow & { match_id: string }

export function subscribeToIncomingMessages(
  currentUserId: string,
  onIncoming: (row: IncomingMessageRow) => void
) {
  const client = requireSupabase()

  const channel = client
    .channel(`incoming-messages:${currentUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const row = payload.new as IncomingMessageRow
        if (row.sender_id === currentUserId) return
        onIncoming(row)
      }
    )
    .subscribe()

  return () => {
    client.removeChannel(channel)
  }
}
