import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import api from '../../lib/api'
import { isOrphanedBackendSessionError, recoverOrphanedFirebaseSession } from '../../lib/auth'
import { waitForBackendSync } from '../../lib/backendSync'
import { auth } from '../../lib/firebase'
import {
  clearStoredSession,
  getStoredUser,
  SESSION_EXPIRED_EVENT,
  setStoredUser,
} from '../../lib/session'
import { startSessionValidation } from '../../lib/sessionValidation'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

async function fetchProfile(firebaseUser) {
  const token = await firebaseUser.getIdToken(true)
  const response = await api.get('/api/users/me', {
    skipSessionExpired: true,
    authToken: token,
  })
  return response.data
}

async function loadProfile(firebaseUser) {
  try {
    return await fetchProfile(firebaseUser)
  } catch (error) {
    const status = error.response?.status

    if (status === 401) {
      await new Promise((resolve) => {
        setTimeout(resolve, 600)
      })
      return fetchProfile(firebaseUser)
    }

    throw error
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(true)
  const [isSessionReady, setIsSessionReady] = useState(false)

  const updateUser = useCallback((nextUser) => {
    setStoredUser(nextUser)
    setUser(nextUser)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) {
      setStoredUser(null)
      setUser(null)
      return null
    }

    const profile = await loadProfile(auth.currentUser)
    setStoredUser(profile)
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(async () => {
    clearStoredSession()
    setUser(null)
    await signOut(auth).catch(() => {})
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setIsSessionReady(false)
        setIsLoading(false)
        return
      }

      localStorage.setItem('lumos_uid', firebaseUser.uid)
      setIsSessionReady(false)

      await waitForBackendSync()

      const cachedUser = getStoredUser()
      if (cachedUser?.userId === firebaseUser.uid) {
        setUser(cachedUser)
      }

      try {
        const profile = await loadProfile(firebaseUser)
        setStoredUser(profile)
        setUser(profile)
        setIsSessionReady(true)
      } catch (error) {
        console.error(error)
        setIsSessionReady(false)

        if (isOrphanedBackendSessionError(error)) {
          setUser(null)
          await recoverOrphanedFirebaseSession()
        } else if (!getStoredUser()) {
          clearStoredSession()
          setUser(null)
        }
      } finally {
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const handleSessionExpired = () => {
      setIsSessionReady(false)
      logout()
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [logout])

  useEffect(() => {
    if (!user || !isSessionReady) {
      return undefined
    }

    return startSessionValidation()
  }, [user, isSessionReady])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isSessionReady,
      isAuthenticated: Boolean(user),
      updateUser,
      refreshUser,
      logout,
    }),
    [user, isLoading, isSessionReady, updateUser, refreshUser, logout],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
