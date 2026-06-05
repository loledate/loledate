import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateUsername } from '../lib/auth'

export default function LoginPage() {
  const { signIn, isConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string; registered?: boolean })?.from ?? '/profile'
  const justRegistered = (location.state as { registered?: boolean })?.registered

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
    const { error: authError } = await signIn(username, password)
    setLoading(false)

    if (authError) {
      setError(authError)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 text-sm font-medium uppercase tracking-widest text-muted">
        Iniciar sesión
      </h1>
      <p className="mb-8 text-sm text-muted">
        Entra con tu usuario y contraseña.
      </p>

      {justRegistered && (
        <p className="mb-6 border border-theme bg-rose-50 dark:bg-white/5 p-4 text-sm text-body">
          Cuenta creada. Ya puedes iniciar sesión.
        </p>
      )}

      {!isConfigured && (
        <p className="mb-6 border border-theme p-4 text-sm text-body">
          Supabase no está configurado. Añade las variables de entorno antes de
          continuar.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="tu_usuario"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input-field"
          />
        </div>

        {error && <p className="text-sm text-body">{error}</p>}

        <button
          type="submit"
          disabled={loading || !isConfigured}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-body underline underline-offset-2">
          Registrarse
        </Link>
      </p>
    </div>
  )
}
