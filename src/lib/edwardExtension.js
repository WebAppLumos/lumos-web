const DEFAULT_EXTENSION_ID = 'aocdocffeljdoeedaecndcdlfnajgcgj'
const EXTENSION_ID = (import.meta.env.VITE_LUMOS_EXTENSION_ID || DEFAULT_EXTENSION_ID).trim()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function hasExtensionApi() {
  return typeof chrome !== 'undefined' && !!chrome.runtime?.sendMessage
}

export function isExtensionConfigured() {
  return Boolean(EXTENSION_ID)
}

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

function sendExtensionMessage(payload) {
  if (!hasExtensionApi() || !EXTENSION_ID) {
    throw new Error('Lumos EDWARD 확장이 설정되지 않았습니다.')
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(EXTENSION_ID, payload, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error('Lumos EDWARD 확장을 찾을 수 없습니다. 설치 후 페이지를 새로고침해 주세요.'))

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

export async function syncEdwardViaExtension(token, {
  syncTimetable = false,
  syncGrades = false,
  year,
  termCode,
} = {}) {
  return sendExtensionMessage({
    action: 'syncEdward',
    token,
    apiBaseUrl: API_BASE_URL,
    syncTimetable,
    syncGrades,
    year,
    termCode,
  })
}

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

export function getExtensionSetupHint() {
  return 'lumos-extension 폴더를 Chrome 확장 프로그램으로 로드한 뒤 페이지를 새로고침해 주세요.'
}
