import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import SocialLinks from './SocialLinks'
import ThemeToggle from './ThemeToggle'
import MessagesNavLink from './MessagesNavLink'
import LanguageToggle from './LanguageToggle'

interface HeaderProps {
  transparent?: boolean
}

function isNavActive(pathname: string, to: string) {
  return pathname === to
}

export default function Header({ transparent = false }: HeaderProps) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const { theme } = useTheme()
  const { t } = useLanguage()

  const navItems = [
    { to: '/discover', label: t('nav.discover') },
    { to: '/profile', label: t('nav.profile') },
  ]

  const handleSignOut = async () => {
    const confirmed = window.confirm(t('nav.logoutConfirm'))
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

  const messagesActive =
    location.pathname === '/matches' || location.pathname.startsWith('/chat/')

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <LanguageToggle />
          <Link
            to="/"
            className={`truncate text-sm font-semibold tracking-wide ${brandClass}`}
          >
            Lol-edate
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <SocialLinks />
          <ThemeToggle />

          <nav className="hidden items-center gap-5 md:flex">
            {user &&
              navItems.map(({ to, label }) => {
                const active = isNavActive(location.pathname, to)
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

            {user && (
              <MessagesNavLink
                className={`transition-colors ${
                  messagesActive ? linkActive : linkMuted
                }`}
              />
            )}

            {!loading && !user && (
              <>
                <Link to="/login" className={`text-sm font-medium ${linkMuted}`}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-xs">
                  {t('nav.register')}
                </Link>
              </>
            )}

            {user && (
              <button
                onClick={handleSignOut}
                className={`text-sm font-medium ${linkMuted}`}
              >
                {t('nav.logout')}
              </button>
            )}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`text-sm font-medium md:hidden ${brandClass}`}
            aria-label={t('common.menu')}
          >
            {mobileOpen ? t('common.close') : t('common.menu')}
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
            navItems.map(({ to, label }) => {
              const active = isNavActive(location.pathname, to)
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

          {user && (
            <MessagesNavLink
              onClick={() => setMobileOpen(false)}
              showLabel
              className={`block py-2 text-sm font-medium ${
                messagesActive ? linkActive : linkMuted
              }`}
            />
          )}

          {!loading && !user && (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className={`block py-2 text-sm ${linkMuted}`}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold text-heading"
              >
                {t('nav.register')}
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              className={`block py-2 text-sm ${linkMuted}`}
            >
              {t('nav.logout')}
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
