const NAME_CHAR_PATTERN = /[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ]/g
const NAME_VALID_PATTERN = /^[a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ]+$/

export function sanitizeNameInput(value) {
  return String(value ?? '').replace(NAME_CHAR_PATTERN, '')
}

export function getNameValidationMessage(value) {
  const trimmed = String(value ?? '').trim()

  if (!trimmed) {
    return '이름을 입력해 주세요.'
  }

  if (!NAME_VALID_PATTERN.test(trimmed)) {
    return '이름은 한글과 영문만 입력할 수 있습니다.'
  }

  return ''
}
