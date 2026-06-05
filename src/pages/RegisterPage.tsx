import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { signUp, isConfigured } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    const { error: authError } = await signUp(email, password, username)
    setLoading(false)

    if (authError) {
      setError(authError)
      return
    }

    setInfo(
      'Cuenta creada. Si tu proyecto requiere confirmación por email, revisa tu bandeja de entrada. Después inicia sesión y completa tu perfil.'
    )
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 text-sm font-medium uppercase tracking-widest text-rose-400">
        Registro
      </h1>
      <p className="mb-8 text-sm text-rose-400">
        Crea tu cuenta. Los perfiles se cargan desde Supabase, no usamos fotos de
        ejemplo.
      </p>

      {!isConfigured && (
        <p className="mb-6 border border-rose-200 p-4 text-sm text-rose-500">
          Supabase no está configurado. Añade las variables de entorno antes de
          continuar.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-rose-400">Nombre</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="input-field"
          />
        </div>

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
            minLength={6}
            autoComplete="new-password"
            className="input-field"
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {info && <p className="text-sm text-rose-500">{info}</p>}

        <button
          type="submit"
          disabled={loading || !isConfigured}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-rose-400">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-rose-700 underline underline-offset-2">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
