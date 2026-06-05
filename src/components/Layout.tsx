import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div
      className={`flex min-h-screen flex-col ${
        isHome ? 'bg-lol-cream' : 'bg-gradient-to-b from-rose-50 to-lol-cream'
      }`}
    >
      <Header transparent={isHome} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
