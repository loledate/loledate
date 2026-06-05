import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { subscribeToIncomingMessages } from '../lib/messages'
import { playMessageSound } from '../lib/notificationSound'

export default function MessageNotifications() {
  const { user } = useAuth()
  const { refreshMatchesSilent } = useApp()
  const location = useLocation()
  const locationRef = useRef(location)

  locationRef.current = location

  useEffect(() => {
    if (!user) return

    return subscribeToIncomingMessages(user.id, (row) => {
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
