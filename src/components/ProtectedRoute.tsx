import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-muted">{t('common.loading')}</p>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <h1 className="mb-2 text-sm font-medium uppercase tracking-widest text-muted">
          {t('config.title')}
        </h1>
        <p className="text-sm leading-relaxed text-body">{t('config.body')}</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
