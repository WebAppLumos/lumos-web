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

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', value)
    return
  }

  config.headers = AxiosHeaders.from({
    ...(config.headers ?? {}),
    Authorization: value,
  })
}

api.interceptors.request.use(async (config) => {
  if (config.authToken) {
    setAuthorizationHeader(config, config.authToken)
    return config
  }

  const user = await resolveAuthUser()
  if (user) {
    try {
      const forceRefresh = Boolean(config.forceTokenRefresh)
      const token = await user.getIdToken(forceRefresh)
      setAuthorizationHeader(config, token)
    } catch (error) {
      clearStoredSession()
      notifySessionExpired()
      return Promise.reject(error)
    }
  }

  return config
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
