export const SESSION_EXPIRED_EVENT = 'lumos:session-expired'

export function getStoredUser() {
  const stored = localStorage.getItem('lumos_user_info')
  return stored ? JSON.parse(stored) : null
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('lumos_user_info', JSON.stringify(user))
  } else {
    localStorage.removeItem('lumos_user_info')
  }
}

export function hasStoredSession() {
  return Boolean(
    localStorage.getItem('lumos_user_info')
      || localStorage.getItem('lumos_uid')
  )
}

export function clearStoredSession() {
  localStorage.removeItem('lumos_user_info')
  localStorage.removeItem('lumos_uid')
  localStorage.removeItem('lumos_dashboard_widgets')
}

export function notifySessionExpired() {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}
