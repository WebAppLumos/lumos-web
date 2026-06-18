/**
 * 시간표 세션 메모리 캐시.
 * 대시보드·전역 검색·오늘의 시간표 위젯이 동일 스냅샷을 공유합니다.
 */
import { fetchInitialTimetableSession } from './api'

let cache = null
let inflight = null

/** 현재 메모리에 캐시된 시간표 스냅샷을 반환합니다. 없으면 null. */
export function getTimetableSession() {
  return cache
}

/** 시간표 스냅샷을 메모리 캐시에 저장합니다. */
export function setTimetableSession(data) {
  cache = data
}

/** 캐시와 진행 중 요청을 모두 초기화합니다. (동기화 후 등) */
export function clearTimetableSession() {
  cache = null
  inflight = null
}

/**
 * 캐시가 없으면 API에서 시간표 스냅샷을 불러옵니다.
 * 동시 호출은 inflight 로 하나의 Promise 를 공유합니다.
 * @returns {Promise<object>}
 */
export function ensureTimetableSession() {
  if (cache) {
    return Promise.resolve(cache)
  }

  if (inflight) {
    return inflight
  }

  inflight = fetchInitialTimetableSession()
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
