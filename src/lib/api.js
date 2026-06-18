/**
 * Lumos 백엔드 Axios 인스턴스.
 * Firebase ID 토큰 자동 첨부, 401 시 1회 재시도, 실패 시 세션 만료 처리.
 */
import axios, { AxiosHeaders } from 'axios'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { clearStoredSession, notifySessionExpired } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
})

let initialAuthStatePromise = null

/** Firebase 초기 인증 상태가 확정될 때까지 대기합니다. */
function waitForInitialAuthState() {
  initialAuthStatePromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })

  return initialAuthStatePromise
}

/** 현재 Firebase 사용자를 반환합니다. 없으면 초기 auth 상태 대기 후 재확인. */
async function resolveAuthUser() {
  if (auth.currentUser) {
    return auth.currentUser
  }

  await waitForInitialAuthState()

  return auth.currentUser
}

/**
 * 요청 config 에 Authorization Bearer 헤더를 설정합니다.
 * @param {import('axios').InternalAxiosRequestConfig} config
 * @param {string} token
 */
export function setAuthorizationHeader(config, token) {
  const value = `Bearer ${token}`
  const headers = AxiosHeaders.from(config.headers ?? {})

  headers.set('Authorization', value)
  config.headers = headers
}

/**
 * 요청마다 Firebase ID 토큰을 Authorization 헤더에 첨부합니다.
 * config.authToken 이 있으면 해당 토큰을 우선 사용합니다.
 */
async function attachAuthorizationHeader(config) {
  const headers = AxiosHeaders.from(config.headers ?? {})
  config.headers = headers

  if (headers.has('Authorization')) {
    return config
  }

  let token = config.authToken

  if (!token) {
    const user = await resolveAuthUser()
    if (user) {
      token = await user.getIdToken(Boolean(config.forceTokenRefresh))
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  delete config.authToken
  return config
}

api.interceptors.request.use(async (config) => {
  try {
    return await attachAuthorizationHeader(config)
  } catch (error) {
    clearStoredSession()
    notifySessionExpired()
    return Promise.reject(error)
  }
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const config = error.config

    if ((status === 401 || status === 403) && config && !config._retriedAuth && !config.skipSessionExpired) {
      const user = await resolveAuthUser().catch(() => null)
      if (user) {
        try {
          const refreshedToken = await user.getIdToken(true)
          config._retriedAuth = true
          setAuthorizationHeader(config, refreshedToken)
          return api.request(config)
        } catch {
          // fall through to session clear
        }
      }
    }

    if ((status === 401 || status === 403) && !config?.skipSessionExpired) {
      clearStoredSession()
      notifySessionExpired()
      signOut(auth).catch(() => {})
    }

    return Promise.reject(error)
  },
)

export default api
