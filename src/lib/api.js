import axios, { AxiosHeaders } from 'axios'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { clearStoredSession, notifySessionExpired } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
})

let initialAuthStatePromise = null

function waitForInitialAuthState() {
  if (!initialAuthStatePromise) {
    initialAuthStatePromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user)
      })
    })
  }

  return initialAuthStatePromise
}

async function resolveAuthUser() {
  if (auth.currentUser) {
    return auth.currentUser
  }

  return waitForInitialAuthState()
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
  (error) => {
    const status = error.response?.status

    if ((status === 401 || status === 403) && !error.config?.skipSessionExpired) {
      clearStoredSession()
      notifySessionExpired()
    }

    return Promise.reject(error)
  },
)

export default api
