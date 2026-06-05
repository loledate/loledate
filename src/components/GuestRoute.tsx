import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface GuestRouteProps {
  children: React.ReactNode
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-muted">Cargando...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/profile" replace />
  }

  return <>{children}</>
}
