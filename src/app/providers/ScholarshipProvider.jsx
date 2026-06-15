import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { buildScholarshipSession, patchSessionWithUser } from '../../lib/scholarship/fetchProfile'
import {
  clearScholarshipSession,
  ensureScholarshipSession,
  getScholarshipSession,
  refreshScholarshipSession,
  setScholarshipSession,
} from '../../lib/scholarship/session'
import { useAuth } from './AuthProvider'

const ScholarshipContext = createContext(null)

export function useScholarship() {
  const context = useContext(ScholarshipContext)
  if (!context) {
    throw new Error('useScholarship must be used within ScholarshipProvider')
  }
  return context
}

export function ScholarshipProvider({ children }) {
  const { user, isSessionReady } = useAuth()
  const [session, setSessionState] = useState(() => getScholarshipSession())
  const [isLoading, setIsLoading] = useState(() => Boolean(user) && !getScholarshipSession())

  const applySession = useCallback((nextSession) => {
    setScholarshipSession(nextSession)
    setSessionState(nextSession)
    return nextSession
  }, [])

  useEffect(() => {
    if (!user || !isSessionReady) {
      clearScholarshipSession()
      setSessionState(null)
      setIsLoading(false)
      return undefined
    }

    let cancelled = false
    const cached = getScholarshipSession()

    if (cached) {
      applySession(patchSessionWithUser(cached, user))
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }

    ensureScholarshipSession(user)
      .then((data) => {
        if (!cancelled) {
          applySession(patchSessionWithUser(data, user))
        }
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user, isSessionReady, applySession])

  const refreshSession = useCallback(async () => {
    if (!user) {
      return null
    }

    setIsLoading(true)
    try {
      const data = await refreshScholarshipSession(user)
      return applySession(patchSessionWithUser(data, user))
    } finally {
      setIsLoading(false)
    }
  }, [user, applySession])

  const updateUserProfile = useCallback((updater) => {
    setSessionState((prev) => {
      if (!prev) {
        return prev
      }

      const nextProfile = typeof updater === 'function'
        ? updater(prev.userProfile)
        : { ...prev.userProfile, ...updater }

      return applySession(buildScholarshipSession(nextProfile, prev.curationCompleted))
    })
  }, [applySession])

  const setCurationCompleted = useCallback((completed) => {
    setSessionState((prev) => {
      if (!prev) {
        return prev
      }

      return applySession(buildScholarshipSession(prev.userProfile, completed))
    })
  }, [applySession])

  const value = useMemo(() => ({
    session,
    isLoading,
    refreshSession,
    updateUserProfile,
    setCurationCompleted,
  }), [session, isLoading, refreshSession, updateUserProfile, setCurationCompleted])

  return (
    <ScholarshipContext.Provider value={value}>
      {children}
    </ScholarshipContext.Provider>
  )
}
