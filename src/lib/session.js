export const SESSION_EXPIRED_EVENT = 'lumos:session-expired'

export function hasStoredSession() {
  return Boolean(
    localStorage.getItem('lumos_user_info')
      || localStorage.getItem('lumos_uid')
  )
}

export function clearStoredSession() {
  localStorage.removeItem('lumos_user_info')
  localStorage.removeItem('lumos_uid')
}

export function notifySessionExpired() {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}
