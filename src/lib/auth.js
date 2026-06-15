import api from './api'
import { getNameValidationMessage } from './name'
import { isValidPhoneNumber } from './phoneNumber'
import { clearStoredSession } from './session'
import { deleteUser, signOut } from 'firebase/auth'
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


export function getEmailDomain(email) {
  const at = String(email ?? '').lastIndexOf('@')
  if (at < 0) return ''
  return email.slice(at + 1).toLowerCase().trim()
}

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

export async function syncBackendLogin(firebaseUser, profile = {}) {
  const idToken = await firebaseUser.getIdToken(true)
  const response = await api.post('/api/auth/login', {
    idToken,
    ...profile,
  }, {
    authToken: idToken,
    skipSessionExpired: true,
  })
  return response.data?.user ?? response.data
}

export async function deleteBackendAccount(firebaseUser) {
  const token = await firebaseUser.getIdToken(true)

  try {
    await api.delete('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      skipSessionExpired: true,
    })
  } catch (error) {
    // 탈퇴 도중 이탈 후 재시도 등: 이미 DB에서 삭제된 경우 계속 진행
    if (error.response?.status !== 404) {
      throw error
    }
  }
}

export function isOrphanedBackendSessionError(error) {
  const status = error.response?.status
  if (status === 404) {
    return true
  }

  const message = String(error.response?.data?.message ?? '')
  return status === 500 && message.includes('사용자를 찾을 수 없습니다')
}

export async function recoverOrphanedFirebaseSession() {
  clearStoredSession()
  await signOut(auth).catch(() => {})
}

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

export async function completeAccountWithdrawal(firebaseUser) {
  let backendError = null

  try {
    await deleteBackendAccount(firebaseUser)
  } catch (error) {
    if (error.response?.status !== 404) {
      backendError = error
    }
  }

  try {
    await deleteFirebaseAccountClient(firebaseUser)
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      throw error
    }
    if (error.code !== 'auth/user-not-found' && !backendError) {
      throw error
    }
    if (error.code !== 'auth/user-not-found') {
      throw backendError
    }
  }

  if (backendError) {
    throw backendError
  }

  clearStoredSession()
  await signOut(auth).catch(() => {})
}

export function trimSignupForm({ name, email, phoneNumber }) {
  return {
    name: name.trim(),
    email: email.trim(),
    phoneNumber: phoneNumber.trim(),
  }
}

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
