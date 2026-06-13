const FIREBASE_SIGNUP_MESSAGES = {
  'auth/email-already-in-use': '이미 가입된 이메일입니다. 로그인해 주세요.',
  'auth/invalid-email': '이메일 형식을 확인해 주세요.',
  'auth/invalid-credential': '이미 가입된 이메일이거나 비밀번호가 일치하지 않습니다.',
  'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
  'auth/wrong-password': '이미 가입된 이메일이거나 비밀번호가 일치하지 않습니다.',
  'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
}

export function trimSignupForm({ name, email, department, studentNumber, phoneNumber }) {
  return {
    name: name.trim(),
    email: email.trim(),
    department: department.trim(),
    studentNumber: studentNumber.trim(),
    phoneNumber: phoneNumber.trim(),
  }
}

export function getSignupErrorMessage(error) {
  if (error.code && FIREBASE_SIGNUP_MESSAGES[error.code]) {
    return FIREBASE_SIGNUP_MESSAGES[error.code]
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

export function validateSignupForm({ studentNumber }) {
  if (!/^\d{7}$/.test(studentNumber)) {
    return '학번은 숫자 7자리로 입력해 주세요. 예: 2024001'
  }

  return ''
}
