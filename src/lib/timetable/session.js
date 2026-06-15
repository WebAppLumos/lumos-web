import { fetchInitialTimetableSession } from './api'

let cache = null
let inflight = null

export function getTimetableSession() {
  return cache
}

export function setTimetableSession(data) {
  cache = data
}

export function clearTimetableSession() {
  cache = null
  inflight = null
}

export function ensureTimetableSession() {
  if (cache) {
    return Promise.resolve(cache)
  }

  if (inflight) {
    return inflight
  }

  inflight = fetchInitialTimetableSession()
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
