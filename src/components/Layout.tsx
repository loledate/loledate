import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import MessageNotifications from './MessageNotifications'
import { useTheme } from '../context/ThemeContext'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { theme } = useTheme()

  return (
    <div
      className={`flex min-h-screen flex-col ${
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
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
