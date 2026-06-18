/**
 * 로그인/회원가입 시 백엔드 동기화 직렬화.
 * onAuthStateChanged 가 syncBackendLogin 보다 먼저 실행되는 race condition 방지.
 */
let pendingBackendSync = null

/**
 * 백엔드 동기화 작업을 큐에 넣고 실행합니다. AuthProvider 가 완료를 기다립니다.
 * @param {() => Promise<void>} work
 * @returns {Promise<void>}
 */
export function runWithBackendSync(work) {
  pendingBackendSync = Promise.resolve().then(work)

  return pendingBackendSync.finally(() => {
    pendingBackendSync = null
  })
}

/** 진행 중인 백엔드 동기화 Promise. 없으면 즉시 resolve. */
export function waitForBackendSync() {
  return pendingBackendSync ?? Promise.resolve()
}
