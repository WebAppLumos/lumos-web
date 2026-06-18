/**
 * 전역 인증 상태 Provider.
 *
 * Firebase onAuthStateChanged 와 백엔드 프로필(/api/users/me)을 묶어
 * isSessionReady 가 true일 때만 개인 데이터 API를 호출하도록 합니다.
 */
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

/** AuthProvider 하위에서 인증 상태·user·logout 등을 사용하는 훅 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/** GET /api/users/me 로 백엔드 프로필을 조회합니다. */
async function fetchProfile(firebaseUser) {
  const token = await firebaseUser.getIdToken(true)
  const response = await api.get('/api/users/me', {
    skipSessionExpired: true,
    authToken: token,
  })
  return response.data
}

/** 프로필 조회. 401 시 토큰 갱신 타이밍 이슈로 600ms 후 1회 재시도합니다. */
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

/** 전역 인증 Context Provider. children 을 감싸 앱 전체에 user·isSessionReady 를 제공합니다. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(true)
  const [isSessionReady, setIsSessionReady] = useState(false)

  const updateUser = useCallback((nextUser) => {
    setStoredUser(nextUser)
    setUser(nextUser)
  }, [])

  /** 서버에서 최신 프로필을 다시 불러와 state·localStorage 를 갱신합니다. */
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

  /** localStorage·Firebase 세션을 정리하고 로그아웃합니다. */
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

      // Signin/Signup 의 runWithBackendSync 가 끝날 때까지 프로필 fetch 대기
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
          // Firebase만 남은 고아 세션 → 자동 로그아웃
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
