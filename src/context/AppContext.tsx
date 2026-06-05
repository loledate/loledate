import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { Profile, Filters, Match } from '../types'
import { DEFAULT_FILTERS } from '../types'
import { useAuth } from './AuthContext'
import { getDisplayUsername } from '../lib/auth'
import { createEmptyProfile } from '../data/constants'
import {
  fetchProfile,
  fetchDiscoverProfiles,
  createProfile,
  saveProfile,
  recordSwipe,
} from '../lib/profiles'
import { isSupabaseConfigured } from '../lib/supabase'

interface AppContextType {
  userProfile: Profile | null
  profileLoading: boolean
  discoverLoading: boolean
  setUserProfile: (profile: Profile) => void
  saveUserProfile: (profile: Profile) => Promise<{ error: string | null }>
  filters: Filters
  setFilters: (filters: Filters) => void
  discoverProfiles: Profile[]
  currentIndex: number
  passProfile: () => void
  likeProfile: (type: 'like' | 'super_like') => void
  matches: Match[]
  applyFilters: () => void
  clearFilters: () => void
  refreshDiscover: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

function filterProfiles(profiles: Profile[], filters: Filters): Profile[] {
  return profiles.filter((p) => {
    if (filters.city && p.city !== filters.city) return false
    if (p.age < filters.ageMin || p.age > filters.ageMax) return false
    if (filters.elo && !p.elo.toLowerCase().includes(filters.elo.toLowerCase()))
      return false
    if (filters.role && p.role !== filters.role) return false
    if (filters.lookingFor && !p.lookingFor.includes(filters.lookingFor))
      return false
    if (p.distanceKm > filters.maxDistance) return false
    if (
      filters.interests &&
      !p.interests.some((i) =>
        i.toLowerCase().includes(filters.interests.toLowerCase())
      )
    )
      return false
    return true
  })
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [discoverLoading, setDiscoverLoading] = useState(false)
  const [allDiscoverProfiles, setAllDiscoverProfiles] = useState<Profile[]>([])
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [activeFilters, setActiveFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [currentIndex] = useState(0)
  const [localPassedIds, setLocalPassedIds] = useState<Set<string>>(new Set())
  const [matches] = useState<Match[]>([])

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setUserProfile(null)
      setAllDiscoverProfiles([])
      return
    }

    let cancelled = false

    async function loadProfile() {
      setProfileLoading(true)
      try {
        let profile = await fetchProfile(user!.id)

        if (!profile) {
          const username = getDisplayUsername(user!)
          profile = await createProfile(user!.id, username)
        }

        if (!cancelled) setUserProfile(profile)
      } catch {
        if (!cancelled) {
          setUserProfile(createEmptyProfile(user!.id, getDisplayUsername(user!)))
        }
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [user])

  const refreshDiscover = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setAllDiscoverProfiles([])
      return
    }

    setDiscoverLoading(true)
    try {
      const profiles = await fetchDiscoverProfiles(user.id)
      setAllDiscoverProfiles(profiles)
      setLocalPassedIds(new Set())
    } catch {
      setAllDiscoverProfiles([])
    } finally {
      setDiscoverLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user && userProfile) {
      refreshDiscover()
    }
  }, [user, userProfile, refreshDiscover])

  const filteredProfiles = filterProfiles(
    allDiscoverProfiles.filter((p) => !localPassedIds.has(p.id)),
    activeFilters
  )

  const passProfile = useCallback(() => {
    const current = filteredProfiles[currentIndex]
    if (!current || !user) return

    setLocalPassedIds((prev) => new Set([...prev, current.id]))
    recordSwipe(user.id, current.userId, 'pass').catch(() => {})
  }, [currentIndex, filteredProfiles, user])

  const likeProfile = useCallback(
    (type: 'like' | 'super_like') => {
      const current = filteredProfiles[currentIndex]
      if (!current || !user) return

      setLocalPassedIds((prev) => new Set([...prev, current.id]))
      recordSwipe(user.id, current.userId, type).catch(() => {})
    },
    [currentIndex, filteredProfiles, user]
  )

  const applyFilters = useCallback(() => {
    setActiveFilters({ ...filters })
  }, [filters])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setActiveFilters(DEFAULT_FILTERS)
  }, [])

  const saveUserProfile = useCallback(
    async (profile: Profile) => {
      if (!user) return { error: 'No hay sesión activa.' }

      try {
        await saveProfile(user.id, profile)
        setUserProfile(profile)
        await refreshDiscover()
        return { error: null }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al guardar el perfil.'
        return { error: message }
      }
    },
    [user, refreshDiscover]
  )

  return (
    <AppContext.Provider
      value={{
        userProfile,
        profileLoading,
        discoverLoading,
        setUserProfile,
        saveUserProfile,
        filters,
        setFilters,
        discoverProfiles: filteredProfiles,
        currentIndex,
        passProfile,
        likeProfile,
        matches,
        applyFilters,
        clearFilters,
        refreshDiscover,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
