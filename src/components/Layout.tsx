import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import MessageNotifications from './MessageNotifications'
import { useTheme } from '../context/ThemeContext'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isChat = location.pathname.startsWith('/chat/')
  const { theme } = useTheme()

  return (
    <div
      className={`flex flex-col ${
        isChat ? 'h-dvh overflow-hidden' : 'min-h-dvh'
      } ${
        isHome
          ? theme === 'dark'
            ? 'bg-black'
            : 'bg-lol-cream'
          : theme === 'dark'
            ? 'bg-black'
            : 'bg-gradient-to-b from-rose-50 to-lol-cream'
      }`}
    >
      <MessageNotifications />
      <Header transparent={isHome} />
      <main
        className={`flex flex-1 flex-col ${
          isChat ? 'min-h-0 overflow-hidden' : 'min-h-0'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}
