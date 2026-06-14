function enforce010Prefix(digits) {
  if (!digits) return ''

  if (digits[0] !== '0') return ''

  if (digits.length === 1) return '0'

  if (digits[1] !== '1') return '0'

  if (digits.length === 2) return '01'

  if (digits[2] !== '0') return '01'

  return `010${digits.slice(3, 11)}`
}

export function formatPhoneNumber(value) {
  const digits = enforce010Prefix(String(value ?? '').replace(/\D/g, ''))

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export function isValidPhoneNumber(value) {
  return /^010-\d{4}-\d{4}$/.test(String(value ?? '').trim())
}
