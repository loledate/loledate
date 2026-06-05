import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase'
import { usernameToAuthEmail, validateUsername } from '../lib/auth'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  isConfigured: boolean
  signIn: (username: string, password: string) => Promise<{ error: string | null }>
  signUp: (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) {
    return 'auth.invalidCredentials'
  }
  if (
    lower.includes('user already registered') ||
    lower.includes('already been registered')
  ) {
    return 'auth.userExists'
  }
  if (lower.includes('password should be at least')) {
    return 'auth.passwordMin'
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'errors.rateLimit'
  }
  if (lower.includes('email logins are disabled')) {
    return 'auth.emailDisabled'
  }
  if (lower.includes('database error checking email')) {
    return 'auth.dbError'
  }
  return message
}

async function registerAccount(username: string, password: string) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string
    ok?: boolean
  }

  if (!response.ok) {
    const errorKey =
      response.status === 429
        ? 'errors.rateLimit'
        : payload.error
          ? mapAuthError(String(payload.error))
          : 'auth.registerFailed'

    return { error: errorKey }
  }

  return { error: null as string | null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const client = requireSupabase()

    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (username: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'auth.supabaseEnv' }
    }

    const usernameError = validateUsername(username)
    if (usernameError) return { error: usernameError }

    const { error } = await requireSupabase().auth.signInWithPassword({
      email: usernameToAuthEmail(username),
      password,
    })

    return { error: error ? mapAuthError(error.message) : null }
  }

  const signUp = async (username: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'auth.supabaseEnv' }
    }

    const usernameError = validateUsername(username)
    if (usernameError) return { error: usernameError }

    const { error: registerError } = await registerAccount(username, password)
    if (registerError) return { error: registerError }

    return signIn(username, password)
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) return
    await requireSupabase().auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
