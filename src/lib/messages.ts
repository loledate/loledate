import type { ChatMessage } from '../types'
import { requireSupabase } from './supabase'

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
  if (!trimmed) throw new Error('El mensaje está vacío.')

  const { data, error } = await requireSupabase()
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content: trimmed,
    })
    .select('id, sender_id, content, created_at')
    .single()

  if (error) throw error
  return mapMessage(data as MessageRow, senderId)
}

export async function markMessagesAsRead(
  matchId: string,
  currentUserId: string
): Promise<void> {
  const { error } = await requireSupabase()
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .neq('sender_id', currentUserId)
    .is('read_at', null)

  if (error) throw error
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
