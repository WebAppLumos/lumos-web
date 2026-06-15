import { fetchScholarshipProfile } from './fetchProfile'

let cache = null
let inflight = null

export function getScholarshipSession() {
  return cache
}

export function setScholarshipSession(session) {
  cache = session
}

export function clearScholarshipSession() {
  cache = null
  inflight = null
}

export function ensureScholarshipSession(user) {
  if (!user) {
    return Promise.reject(new Error('Scholarship session requires a logged-in user.'))
  }

  if (cache) {
    return Promise.resolve(cache)
  }

  if (inflight) {
    return inflight
  }

  inflight = fetchScholarshipProfile(user)
    .then((session) => {
      cache = session
      inflight = null
      return session
    })
    .catch((error) => {
      inflight = null
      throw error
    })

  return inflight
}

export function refreshScholarshipSession(user) {
  clearScholarshipSession()
  return ensureScholarshipSession(user)
}
