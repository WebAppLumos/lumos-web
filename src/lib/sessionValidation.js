/**
 * 백그라운드 세션 유효성 검사.
 * 5분 주기 + 토큰 만료 시점 + 탭 복귀 시 /api/users/me 재검증.
 */
import { signOut } from 'firebase/auth'
import api from './api'
import { auth } from './firebase'
import {
  clearStoredSession,
  hasStoredSession,
  notifySessionExpired,
} from './session'

const SESSION_CHECK_INTERVAL_MS = 5 * 60 * 1000
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000

/** HTTP 401/403 또는 Firebase auth/ 오류인지 판별합니다. */
function isAuthFailure(error) {
  const status = error?.response?.status
  if (status === 401 || status === 403) {
    return true
  }

  const code = String(error?.code ?? '')
  return code.startsWith('auth/')
}

/** localStorage 정리 후 세션 만료 이벤트를 발생시킵니다. */
export function expireSession() {
  clearStoredSession()
  notifySessionExpired()
}

/**
 * Firebase·백엔드 세션이 모두 유효한지 검증합니다.
 * @returns {Promise<boolean>} 유효하면 true
 */
export async function validateActiveSession() {
  const firebaseUser = auth.currentUser

  if (!firebaseUser) {
    if (hasStoredSession()) {
      expireSession()
    }
    return false
  }

  try {
    await firebaseUser.getIdToken(true)
    await api.get('/api/users/me', {
      skipSessionExpired: true,
      forceTokenRefresh: true,
    })
    return true
  } catch (error) {
    if (isAuthFailure(error)) {
      expireSession()
      await signOut(auth).catch(() => {})
      return false
    }

    return true
  }
}

/**
 * Firebase ID 토큰 만료 1분 전에 onExpire 콜백을 예약합니다.
 * @returns {Promise<number|null>} setTimeout id
 */
async function scheduleTokenExpiryCheck(firebaseUser, onExpire) {
  try {
    const tokenResult = await firebaseUser.getIdTokenResult()
    const expiresAt = new Date(tokenResult.expirationTime).getTime()
    const delay = Math.max(expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS, 10_000)

    return window.setTimeout(() => {
      onExpire()
    }, delay)
  } catch {
    return null
  }
}

/**
 * 주기적·만료 시점·탭 복귀 시 세션 검증을 시작합니다.
 * @returns {() => void} cleanup 함수 (useEffect 반환용)
 */
export function startSessionValidation() {
  let intervalId = null
  let expiryTimerId = null
  let stopped = false

  const runValidation = () => {
    if (stopped) return

    validateActiveSession()
      .then((isValid) => {
        if (stopped || !isValid || !auth.currentUser) {
          return
        }

        if (expiryTimerId) {
          window.clearTimeout(expiryTimerId)
        }

        scheduleTokenExpiryCheck(auth.currentUser, runValidation)
          .then((timerId) => {
            expiryTimerId = timerId
          })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  runValidation()
  intervalId = window.setInterval(runValidation, SESSION_CHECK_INTERVAL_MS)

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      runValidation()
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  return () => {
    stopped = true

    if (intervalId) {
      window.clearInterval(intervalId)
    }

    if (expiryTimerId) {
      window.clearTimeout(expiryTimerId)
    }

    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}
