import axios from 'axios'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

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
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
