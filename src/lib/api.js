import axios from 'axios'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { clearStoredSession, notifySessionExpired } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
})

let authReady = false
let authReadyPromise = null

function waitForAuthReady() {
  if (authReady) {
    return Promise.resolve(auth.currentUser)
  }

  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        authReady = true
        unsubscribe()
        resolve(user)
      })
    })
  }

  return authReadyPromise
}

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser ?? await waitForAuthReady()
  if (user) {
    try {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
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

    if (status === 401 || status === 403) {
      clearStoredSession()
      notifySessionExpired()
    }

    return Promise.reject(error)
  },
)

export default api
