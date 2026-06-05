import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import SocialLinks from './SocialLinks'
import ThemeToggle from './ThemeToggle'

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
  const { theme } = useTheme()

  const handleSignOut = async () => {
    const confirmed = window.confirm('¿Seguro que quieres cerrar sesión?')
    if (!confirmed) return
    await signOut()
    setMobileOpen(false)
  }

  const headerClass = transparent
    ? theme === 'dark'
      ? 'absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md'
      : 'absolute inset-x-0 top-0 z-50 border-b border-white/20 bg-white/10 backdrop-blur-md'
    : theme === 'dark'
      ? 'sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl'
      : 'sticky top-0 z-50 border-b border-rose-200/80 bg-white/80 backdrop-blur-xl'

  const linkMuted =
    theme === 'dark'
      ? 'text-white/50 hover:text-white/80'
      : transparent
        ? 'text-rose-900/70 hover:text-rose-900'
        : 'text-rose-500 hover:text-rose-800'

  const linkActive = theme === 'dark' ? 'text-white' : 'text-rose-900'

  const brandClass =
    theme === 'dark'
      ? 'text-white'
      : transparent
        ? 'text-rose-950'
        : 'text-rose-800'

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className={`text-sm font-semibold tracking-wide ${brandClass}`}>
          Lol-edate
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <SocialLinks />
          <ThemeToggle />

          <nav className="hidden items-center gap-5 md:flex">
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
            <button onClick={handleSignOut} className={`text-sm font-medium ${linkMuted}`}>
              Salir
            </button>
          )}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`text-sm font-medium md:hidden ${brandClass}`}
            aria-label="Menú"
          >
            {mobileOpen ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className={`border-t px-4 py-3 md:hidden ${
            theme === 'dark'
              ? 'border-white/10 bg-black/90'
              : transparent
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
                    active ? linkActive : linkMuted
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
                className={`block py-2 text-sm ${linkMuted}`}
              >
                Entrar
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold text-heading"
              >
                Registro
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              className={`block py-2 text-sm ${linkMuted}`}
            >
              Salir
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
