import axios, { AxiosHeaders } from 'axios'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { clearStoredSession, notifySessionExpired } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
})

let initialAuthStatePromise = null

function waitForInitialAuthState() {
  initialAuthStatePromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })

  return initialAuthStatePromise
}

async function resolveAuthUser() {
  if (auth.currentUser) {
    return auth.currentUser
  }

  await waitForInitialAuthState()

  return auth.currentUser
}

export function setAuthorizationHeader(config, token) {
  const value = `Bearer ${token}`
  const headers = AxiosHeaders.from(config.headers ?? {})

  headers.set('Authorization', value)
  config.headers = headers
}

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
