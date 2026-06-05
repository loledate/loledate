import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { subscribeToIncomingMessages } from '../lib/messages'
import { playMessageSound } from '../lib/notificationSound'

export default function MessageNotifications() {
  const { user } = useAuth()
  const { matches, refreshMatchesSilent } = useApp()
  const location = useLocation()
  const locationRef = useRef(location)
  const matchIdsRef = useRef<string[]>([])

  locationRef.current = location
  matchIdsRef.current = matches.map((m) => m.id)

  useEffect(() => {
    if (!user) return

    return subscribeToIncomingMessages(user.id, (row) => {
      if (!matchIdsRef.current.includes(row.match_id)) {
        void refreshMatchesSilent()
        return
      }

      const activeChatId = locationRef.current.pathname.match(
        /^\/chat\/([^/]+)/
      )?.[1]

      if (activeChatId === row.match_id) return

      playMessageSound()
      void refreshMatchesSilent()
    })
  }, [user, refreshMatchesSilent])

  return null
}
