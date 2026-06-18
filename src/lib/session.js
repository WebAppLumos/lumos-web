/** 세션 만료 시 AuthProvider 가 수신하는 커스텀 이벤트 이름 */
export const SESSION_EXPIRED_EVENT = 'lumos:session-expired'

/** localStorage 에 저장된 사용자 프로필(lumos_user_info)을 파싱해 반환합니다. */
export function getStoredUser() {
  const stored = localStorage.getItem('lumos_user_info')
  return stored ? JSON.parse(stored) : null
}

/** 사용자 프로필을 localStorage 에 저장하거나 삭제합니다. */
export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('lumos_user_info', JSON.stringify(user))
  } else {
    localStorage.removeItem('lumos_user_info')
  }
}

/** lumos_user_info 또는 lumos_uid 가 존재하는지 확인합니다. */
export function hasStoredSession() {
  return Boolean(
    localStorage.getItem('lumos_user_info')
      || localStorage.getItem('lumos_uid')
  )
}

/** 프로필·UID·대시보드 위젯 캐시를 모두 제거합니다. */
export function clearStoredSession() {
  localStorage.removeItem('lumos_user_info')
  localStorage.removeItem('lumos_uid')
  localStorage.removeItem('lumos_dashboard_widgets')
}

/** lumos:session-expired 이벤트를 발생시켜 전역 로그아웃을 트리거합니다. */
export function notifySessionExpired() {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}
