import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { validateUsername } from '../lib/auth'

export default function RegisterPage() {
  const { signUp, isConfigured } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const usernameError = validateUsername(username)
    if (usernameError) {
      setError(usernameError)
      return
    }

    setLoading(true)
    const { error: authError } = await signUp(username, password)
    setLoading(false)

    if (authError) {
      setError(authError)
      return
    }

    navigate('/login', {
      replace: true,
      state: { registered: true },
    })
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 text-sm font-medium uppercase tracking-widest text-muted">
        {t('auth.registerTitle')}
      </h1>
      <p className="mb-8 text-sm text-muted">{t('auth.registerSubtitle')}</p>

      {!isConfigured && (
        <p className="mb-6 border border-theme p-4 text-sm text-body">
          {t('auth.supabaseMissing')}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted">{t('auth.username')}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="tu_usuario"
            className="input-field"
          />
          <p className="mt-1 text-xs text-muted">{t('auth.usernameHint')}</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="input-field"
          />
        </div>

        {error && <p className="text-sm text-body">{t(error)}</p>}

        <button
          type="submit"
          disabled={loading || !isConfigured}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-body underline underline-offset-2">
          {t('auth.loginTitle')}
        </Link>
      </p>
    </div>
  )
}
