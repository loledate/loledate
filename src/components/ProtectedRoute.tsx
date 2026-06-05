import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-muted">Cargando...</p>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <h1 className="mb-2 text-sm font-medium uppercase tracking-widest text-muted">
          Configuración pendiente
        </h1>
        <p className="text-sm leading-relaxed text-body">
          Crea un archivo <code className="text-body">.env</code> en la raíz
          del proyecto con <code className="text-body">VITE_SUPABASE_URL</code>{' '}
          y <code className="text-body">VITE_SUPABASE_ANON_KEY</code>, y
          ejecuta el SQL de <code className="text-body">src/db/schema.ts</code>{' '}
          en Supabase.
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
