import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, isConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/profile'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await signIn(email, password)
    setLoading(false)

    if (authError) {
      setError(authError)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 text-sm font-medium uppercase tracking-widest text-rose-400">
        Iniciar sesión
      </h1>
      <p className="mb-8 text-sm text-rose-400">
        Accede a tu cuenta de Lol-edate.
      </p>

      {!isConfigured && (
        <p className="mb-6 border border-rose-200 p-4 text-sm text-rose-500">
          Supabase no está configurado. Añade las variables de entorno antes de
          continuar.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-rose-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-rose-400">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input-field"
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !isConfigured}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-rose-400">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-rose-700 underline underline-offset-2">
          Registrarse
        </Link>
      </p>
    </div>
  )
}
