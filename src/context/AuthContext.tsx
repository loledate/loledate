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
  if (message.includes('Invalid login credentials')) {
    return 'Usuario o contraseña incorrectos.'
  }
  if (message.includes('User already registered')) {
    return 'Ese usuario ya existe.'
  }
  if (message.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  return message
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
      return { error: 'Supabase no configurado. Revisa tu archivo .env.' }
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
      return { error: 'Supabase no configurado. Revisa tu archivo .env.' }
    }

    const usernameError = validateUsername(username)
    if (usernameError) return { error: usernameError }

    const { error } = await requireSupabase().auth.signUp({
      email: usernameToAuthEmail(username),
      password,
      options: {
        data: { username: username.trim() },
        emailRedirectTo: undefined,
      },
    })

    return { error: error ? mapAuthError(error.message) : null }
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
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
