import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/discover', label: 'Descubrir' },
  { to: '/matches', label: 'Matches' },
  { to: '/profile', label: 'Perfil' },
]

interface HeaderProps {
  transparent?: boolean
}

export default function Header({ transparent = false }: HeaderProps) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setMobileOpen(false)
  }

  const headerClass = transparent
    ? 'absolute inset-x-0 top-0 z-50 border-b border-white/20 bg-white/10 backdrop-blur-md'
    : 'sticky top-0 z-50 border-b border-rose-200/80 bg-white/80 backdrop-blur-xl'

  const linkMuted = transparent
    ? 'text-rose-900/70 hover:text-rose-900'
    : 'text-rose-500 hover:text-rose-800'

  const linkActive = transparent ? 'text-rose-950' : 'text-rose-900'

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className={`text-sm font-semibold tracking-wide ${
            transparent ? 'text-rose-950' : 'text-rose-800'
          }`}
        >
          Lol-edate
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {user &&
            navItems.slice(1).map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm font-medium transition-colors ${
                    active ? linkActive : linkMuted
                  }`}
                >
                  {label}
                </Link>
              )
            })}

          {!loading && !user && (
            <>
              <Link to="/login" className={`text-sm font-medium ${linkMuted}`}>
                Entrar
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-xs">
                Registro
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              className={`text-sm font-medium ${linkMuted}`}
            >
              Salir
            </button>
          )}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`text-sm font-medium md:hidden ${
            transparent ? 'text-rose-900' : 'text-rose-600'
          }`}
          aria-label="Menú"
        >
          {mobileOpen ? 'Cerrar' : 'Menú'}
        </button>
      </div>

      {mobileOpen && (
        <nav
          className={`border-t px-4 py-3 md:hidden ${
            transparent
              ? 'border-white/20 bg-white/20 backdrop-blur-md'
              : 'border-rose-200/80 bg-white/90'
          }`}
        >
          {user &&
            navItems.slice(1).map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 text-sm font-medium ${
                    active ? 'text-rose-900' : 'text-rose-500'
                  }`}
                >
                  {label}
                </Link>
              )
            })}

          {!loading && !user && (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm text-rose-500"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold text-rose-900"
              >
                Registro
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              className="block py-2 text-sm text-rose-500"
            >
              Salir
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
