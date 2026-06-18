/**
 * Lumos Sync Chrome 확장 메시지 브릿지.
 * 웹은 portal SSO에 직접 접근할 수 없어 확장이 EDWARD/CTL 데이터를 수집합니다.
 */
const DEFAULT_EXTENSION_ID = 'mjbkpdkmolfjmkfaollkpnjfhejnahop'
const EXTENSION_ID = (import.meta.env.VITE_LUMOS_EXTENSION_ID || DEFAULT_EXTENSION_ID).trim()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/** chrome.runtime.sendMessage API 사용 가능 여부 */
function hasExtensionApi() {
  return typeof chrome !== 'undefined' && !!chrome.runtime?.sendMessage
}

/** VITE_LUMOS_EXTENSION_ID 가 설정돼 있는지 확인합니다. */
export function isExtensionConfigured() {
  return Boolean(EXTENSION_ID)
}

/**
 * 확장 설치·동작 여부를 ping 으로 확인합니다.
 * @returns {Promise<{installed: boolean, configured: boolean, version?: string}>}
 */
export async function pingExtension() {
  if (!hasExtensionApi() || !EXTENSION_ID) {
    return { installed: false, configured: false }
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(EXTENSION_ID, { action: 'ping' }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        resolve({ installed: false, configured: true })

        return
      }
      resolve({ installed: true, configured: true, version: response.version })
    })
  })
}

/**
 * 확장에 메시지를 보내고 응답 data 를 반환합니다.
 * @param {object} payload
 * @returns {Promise<unknown>}
 */
function sendExtensionMessage(payload) {
  if (!hasExtensionApi() || !EXTENSION_ID) {
    throw new Error('Lumos Sync 확장이 설정되지 않았습니다.')
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(EXTENSION_ID, payload, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error('Lumos Sync 확장을 찾을 수 없습니다. 설치 후 페이지를 새로고침해 주세요.'))

        return
      }
      if (!response?.ok) {
        reject(new Error(response?.error || 'EDWARD 동기화에 실패했습니다.'))

        return
      }
      resolve(response.data)
    })
  })
}

/**
 * EDWARD 학적·시간표·성적 동기화를 확장에 요청합니다.
 * @param {string} token - Firebase ID 토큰
 * @param {object} options - syncProfile, syncTimetable, syncGrades, year, termCode
 */
export async function syncEdwardViaExtension(token, {
  syncTimetable = false,
  syncGrades = false,
  syncProfile = false,
  year,
  termCode,
} = {}) {
  return sendExtensionMessage({
    action: 'syncEdward',
    token,
    apiBaseUrl: API_BASE_URL,
    syncTimetable,
    syncGrades,
    syncProfile,
    year,
    termCode,
  })
}

/** EDWARD 시간표만 동기화합니다. 실패 시 Error throw. */
export async function syncTimetableViaExtension(token, { year, termCode } = {}) {
  const data = await syncEdwardViaExtension(token, {
    syncTimetable: true,
    syncGrades: false,
    year,
    termCode,
  })
  if (!data.timetable?.ok) {
    throw new Error(data.timetable?.error || 'EDWARD 시간표 동기화에 실패했습니다.')
  }
  return data.timetable.data
}

/** EDWARD 성적만 동기화합니다. 실패 시 Error throw. */
export async function syncGradesViaExtension(token) {
  const data = await syncEdwardViaExtension(token, {
    syncTimetable: false,
    syncGrades: true,
  })
  if (!data.grades?.ok) {
    throw new Error(data.grades?.error || 'EDWARD 성적 동기화에 실패했습니다.')
  }
  return data.grades.data
}

/** CTL 진행 중·미제출 과제를 확장에 통해 동기화합니다. */
export async function syncCtlAssignmentsViaExtension(token) {
  return sendExtensionMessage({
    action: 'syncCtlAssignments',
    token,
    apiBaseUrl: API_BASE_URL,
  })
}

/** 확장 미설치 시 사용자에게 보여줄 안내 문구 */
export function getExtensionSetupHint() {
  return 'lumos-extension 폴더를 Chrome 확장 프로그램으로 로드한 뒤 페이지를 새로고침해 주세요.'
}
