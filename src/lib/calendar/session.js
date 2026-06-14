import { fetchInitialCalendarSession } from './api'

let cache = null
let inflight = null

export function getCalendarSession() {
  return cache
}

export function setCalendarSession(data) {
  cache = data
}

export function clearCalendarSession() {
  cache = null
  inflight = null
}

export function ensureCalendarSession() {
  if (cache) {
    return Promise.resolve(cache)
  }

  if (inflight) {
    return inflight
  }

  inflight = fetchInitialCalendarSession()
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

export function refreshCalendarSession() {
  inflight = fetchInitialCalendarSession()
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
