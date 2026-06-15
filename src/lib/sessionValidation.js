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

function isAuthFailure(error) {
  const status = error?.response?.status
  if (status === 401 || status === 403) {
    return true
  }

  const code = String(error?.code ?? '')
  return code.startsWith('auth/')
}

export function expireSession() {
  clearStoredSession()
  notifySessionExpired()
}

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
