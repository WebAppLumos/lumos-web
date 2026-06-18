/**
 * 인증·회원가입·회원탈퇴 공통 로직.
 * Firebase Auth(클라이언트) + Spring API(프로필·데이터) 이중 구조.
 */
import api from './api'
import { getNameValidationMessage } from './name'
import { isValidPhoneNumber } from './phoneNumber'
import { clearStoredSession } from './session'
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth'
import { auth } from './firebase'

export const EMAIL_DOMAIN_OPTIONS = [
  'gmail.com',
  'naver.com',
  'daum.net',
  'hanmail.net',
  'kakao.com',
  'nate.com',
  'outlook.com',
  'outlook.kr',
  'hotmail.com',
  'live.com',
  'icloud.com',
  'me.com',
  'yahoo.com',
  'yahoo.co.kr',
]

export const ALLOWED_EMAIL_DOMAINS = [
  ...EMAIL_DOMAIN_OPTIONS,
  'googlemail.com',
]

/** 이메일 주소에서 @ 뒤 도메인 부분을 추출합니다. */
export function getEmailDomain(email) {
  const at = String(email ?? '').lastIndexOf('@')
  if (at < 0) return ''
  return email.slice(at + 1).toLowerCase().trim()
}

/** 허용된 이메일 도메인인지 검사합니다. */
export function isAllowedEmailDomain(email) {
  return ALLOWED_EMAIL_DOMAINS.includes(getEmailDomain(email))
}

const FIREBASE_AUTH_MESSAGES = {
  'auth/email-already-in-use': '이미 가입된 이메일입니다. 로그인해 주세요.',
  'auth/invalid-email': '이메일 형식을 확인해 주세요.',
  'auth/invalid-credential': '이메일 또는 비밀번호를 확인해 주세요.',
  'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
  'auth/wrong-password': '이메일 또는 비밀번호를 확인해 주세요.',
  'auth/user-not-found': '이메일 또는 비밀번호를 확인해 주세요.',
  'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
  'auth/too-many-requests': '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
}

/** 로그인 실패 시 사용자에게 보여줄 한글 메시지를 반환합니다. */
export function getSigninErrorMessage(error) {
  if (error.code && FIREBASE_AUTH_MESSAGES[error.code]) {
    return FIREBASE_AUTH_MESSAGES[error.code]
  }

  const serverMessage = error.response?.data?.message
  if (serverMessage) {
    if (serverMessage === '전화번호를 입력해 주세요.') {
      return '등록된 회원 정보가 없습니다. 회원가입을 진행해 주세요.'
    }
    return serverMessage
  }

  if (error.response?.status === 404) {
    return '등록된 회원 정보가 없습니다. 회원가입을 진행해 주세요.'
  }

  if (error.response?.status === 401) {
    return '인증에 실패했습니다. 다시 시도해 주세요.'
  }

  return '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}

/** 회원가입 실패 시 사용자에게 보여줄 한글 메시지를 반환합니다. */
export function getSignupErrorMessage(error) {
  if (error.code && FIREBASE_AUTH_MESSAGES[error.code]) {
    return FIREBASE_AUTH_MESSAGES[error.code]
  }

  const serverMessage = error.response?.data?.message
  if (serverMessage) {
    return serverMessage
  }

  if (error.response?.status === 401) {
    return '인증에 실패했습니다. 다시 시도해 주세요.'
  }

  if (error.response?.status === 409) {
    return '이미 등록된 회원 정보가 있습니다.'
  }

  return '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
}

/**
 * Firebase 로그인/가입 직후 백엔드 users 테이블을 동기화합니다.
 * @param {import('firebase/auth').User} firebaseUser
 * @param {object} [profile] - 회원가입 시 name, phoneNumber 등
 * @returns {Promise<object>} 백엔드 사용자 프로필
 */
export async function syncBackendLogin(firebaseUser, profile = {}) {
  const idToken = await ensureFreshIdToken(firebaseUser)
  const response = await api.post('/api/auth/login', {
    idToken,
    ...profile,
  }, {
    authToken: idToken,
    skipSessionExpired: true,
  })
  return response.data?.user ?? response.data
}

/**
 * Firebase ID 토큰을 강제 갱신해 반환합니다.
 * @param {import('firebase/auth').User} [firebaseUser]
 * @returns {Promise<string>}
 */
export async function ensureFreshIdToken(firebaseUser) {
  const user = firebaseUser ?? auth.currentUser
  if (!user) {
    const error = new Error('로그인 세션이 없습니다.')
    error.code = 'auth/user-not-found'
    throw error
  }

  await user.reload()
  const activeUser = auth.currentUser ?? user
  return activeUser.getIdToken(true)
}

/** DELETE /api/users/me 를 한 번 호출합니다. */
async function deleteBackendAccountOnce(firebaseUser) {
  const token = await ensureFreshIdToken(firebaseUser)
  return api.delete('/api/users/me', {
    authToken: token,
    skipSessionExpired: true,
  })
}

/** 탈퇴 전 백엔드 세션이 유효한지 GET /api/users/me 로 확인합니다. */
export async function validateWithdrawalSession(firebaseUser) {
  const token = await ensureFreshIdToken(firebaseUser)
  await api.get('/api/users/me', {
    authToken: token,
    skipSessionExpired: true,
  })
}

/**
 * 탈퇴 직전 Firebase 비밀번호 재인증을 수행합니다.
 * @param {import('firebase/auth').User} firebaseUser
 * @param {string} password
 */
export async function reauthenticateForWithdrawal(firebaseUser, password) {
  if (!firebaseUser?.email) {
    const error = new Error('MISSING_EMAIL')
    error.code = 'auth/user-not-found'
    throw error
  }

  const credential = EmailAuthProvider.credential(firebaseUser.email, password)
  await reauthenticateWithCredential(firebaseUser, credential)
  await firebaseUser.reload()
}

/**
 * 백엔드 사용자 데이터를 삭제합니다. 401 시 1회 재시도, 404는 이미 삭제된 것으로 간주합니다.
 * @param {import('firebase/auth').User} firebaseUser
 */
export async function deleteBackendAccount(firebaseUser) {
  try {
    await deleteBackendAccountOnce(firebaseUser)
  } catch (error) {
    if (error.response?.status === 401) {
      await new Promise((resolve) => {
        setTimeout(resolve, 600)
      })
      const activeUser = auth.currentUser ?? firebaseUser
      await deleteBackendAccountOnce(activeUser)
      return
    }

    if (error.response?.status !== 404) {
      throw error
    }
  }
}

/**
 * Firebase는 로그인돼 있으나 DB users 행이 없는 고아 세션인지 판별합니다.
 * @param {Error} error
 * @returns {boolean}
 */
export function isOrphanedBackendSessionError(error) {
  const status = error.response?.status
  if (status === 404) {
    return true
  }

  const message = String(error.response?.data?.message ?? '')
  return status === 500 && message.includes('사용자를 찾을 수 없습니다')
}

/** 고아 세션 정리: localStorage 비우고 Firebase signOut. */
export async function recoverOrphanedFirebaseSession() {
  clearStoredSession()
  await signOut(auth).catch(() => {})
}

/**
 * 클라이언트에서 Firebase 계정을 삭제합니다. (이미 없으면 무시)
 * @param {import('firebase/auth').User} firebaseUser
 */
export async function deleteFirebaseAccountClient(firebaseUser) {
  try {
    await deleteUser(firebaseUser)
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return
    }
    throw error
  }
}

/**
 * 회원 탈퇴 전체 흐름: 세션 확인 → 백엔드 삭제 → 로컬 세션·Firebase 로그아웃.
 * @param {import('firebase/auth').User} firebaseUser
 */
export async function completeAccountWithdrawal(firebaseUser) {
  const activeUser = auth.currentUser ?? firebaseUser
  if (!activeUser) {
    const error = new Error('로그인 세션이 없습니다.')
    error.code = 'auth/user-not-found'
    throw error
  }

  await validateWithdrawalSession(activeUser)

  try {
    await deleteBackendAccount(activeUser)
  } catch (error) {
    if (error.response?.status === 404) {
      await deleteFirebaseAccountClient(activeUser)
    } else {
      throw error
    }
  }

  clearStoredSession()
  await signOut(auth).catch(() => {})
}

/** 탈퇴 실패 시 사용자에게 보여줄 한글 메시지를 반환합니다. */
export function getWithdrawalErrorMessage(error) {
  const code = error?.code
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return '비밀번호가 올바르지 않습니다.'
  }
  if (
    code === 'auth/requires-recent-login'
    || code === 'auth/user-token-expired'
    || code === 'auth/user-not-found'
  ) {
    return '로그인 세션이 만료되었습니다. 로그아웃 후 다시 로그인해 주세요.'
  }

  const status = error?.response?.status
  if (status === 401 || status === 403) {
    return '인증이 만료되었습니다. 로그아웃 후 다시 로그인해 주세요.'
  }

  const serverMessage = error?.response?.data?.message
  if (serverMessage) {
    return serverMessage
  }

  const message = String(error?.message ?? '')
  if (message.includes('user-token-expired')) {
    return '로그인 세션이 만료되었습니다. 로그아웃 후 다시 로그인해 주세요.'
  }

  return '탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}

/** 탈퇴 실패 후 강제 로그아웃이 필요한 오류인지 판별합니다. */
export function shouldLogoutAfterWithdrawalFailure(error) {
  const code = error?.code
  if (
    code === 'auth/requires-recent-login'
    || code === 'auth/user-token-expired'
    || code === 'auth/user-not-found'
  ) {
    return true
  }

  const status = error?.response?.status
  return status === 401 || status === 403
}

/** 회원가입 폼 문자열 필드 앞뒤 공백을 제거합니다. */
export function trimSignupForm({ name, email, phoneNumber }) {
  return {
    name: name.trim(),
    email: email.trim(),
    phoneNumber: phoneNumber.trim(),
  }
}

/**
 * 회원가입 폼 유효성 검사. 통과 시 빈 문자열, 실패 시 오류 메시지 반환.
 * @returns {string}
 */
export function validateSignupForm({ name, email, phoneNumber }) {
  const nameMessage = getNameValidationMessage(name)
  if (nameMessage) {
    return nameMessage
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return '이메일 형식을 확인해 주세요.'
  }

  if (!isAllowedEmailDomain(email)) {
    return '해당 이메일은 사용할 수 없습니다.'
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return '전화번호는 010으로 시작하는 11자리 번호만 입력할 수 있습니다.'
  }

  return ''
}
