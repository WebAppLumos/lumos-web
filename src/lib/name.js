export function sanitizeNameInput(value) {
  return String(value ?? '').replace(/\d/g, '')
}
