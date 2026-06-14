let pendingBackendSync = null

export function runWithBackendSync(work) {
  pendingBackendSync = Promise.resolve().then(work)

  return pendingBackendSync.finally(() => {
    pendingBackendSync = null
  })
}

export function waitForBackendSync() {
  return pendingBackendSync ?? Promise.resolve()
}
